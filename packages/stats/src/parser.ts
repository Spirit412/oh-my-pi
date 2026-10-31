import * as nodeFs from "node:fs";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import {
	type AssistantMessage,
	coerceServiceTierByFamily,
	getPremiumServiceTierRequests,
	parseServiceTier,
	resolveModelServiceTier,
	type ServiceTierByFamily,
	type ToolCall,
	type ToolResultMessage,
	type Usage,
} from "@oh-my-pi/pi-ai";
import { classifyModel } from "@oh-my-pi/pi-catalog/compat/taxonomy";
import { getAgentDir, getSessionsDir, isEnoent, readLines } from "@oh-my-pi/pi-utils";
import type {
	AgentType,
	MessageStatsInput,
	SessionEntry,
	SessionMessageEntry,
	SessionModelUsageEntry,
	SessionServiceTierChangeEntry,
	ToolCallStats,
	ToolKind,
	ToolResultLink,
	UserMessageLink,
	UserMessageStats,
} from "./types";
import { computeUserMessageMetrics, judgeProse } from "./user-metrics";

/** Basename of an advisor agent's transcript inside a session artifacts dir. */
const ADVISOR_TRANSCRIPT_BASENAME = "__advisor.jsonl";

/** Characters a persisted tool name may consist of without sanitization. */
const TOOL_NAME_PATTERN = /^[\w.:-]+$/;

/** Serialized UTF-8 byte length of a session payload, or 0 when it cannot be serialized. */
function jsonBytes(value: unknown): number {
	try {
		const text = JSON.stringify(value);
		return text === undefined ? 0 : Buffer.byteLength(text);
	} catch {
		return 0;
	}
}

/** Bytes as kilobytes with two decimals — the unit every payload surface reports. */
function toKb(bytes: number): number {
	return Math.round((bytes / 1024) * 100) / 100;
}

/**
 * Bytes per prompt token used to estimate a request's size. Sessions journal the
 * provider-counted prompt tokens and the assistant response, but not the request
 * body itself — and the transcript is not a substitute, because compaction and
 * re-injected context blocks make its byte count wildly exceed what was sent.
 * A fixed ratio keeps the estimate proportional across turns and models.
 */
const BYTES_PER_PROMPT_TOKEN = 4;

/**
 * Estimated size of the request body from the prompt tokens the provider
 * counted for the turn (uncached input + cache reads + cache writes). Response
 * sizes are measured exactly; this one is derived, and the UI labels it so.
 */
function estimateRequestKb(usage: Pick<Usage, "input" | "cacheRead" | "cacheWrite">): number {
	const promptTokens = (usage.input ?? 0) + (usage.cacheRead ?? 0) + (usage.cacheWrite ?? 0);
	return toKb(promptTokens * BYTES_PER_PROMPT_TOKEN);
}

/** Characters of serialized arguments kept for the tool-call log. */
const ARGS_PREVIEW_LIMIT = 500;
/** Characters of a command/path/url kept as a tool call's target. */
const TOOL_TARGET_LIMIT = 200;

/** Tool names whose invocation can execute a script file named in its arguments. */
const SCRIPT_TOOL_NAMES: ReadonlySet<string> = new Set(["bash", "eval", "computer"]);
/** Extensions that mark an argument token as an executed script. */
const SCRIPT_EXTENSIONS = String.raw`(?:[cm]?[jt]sx?|py|sh|bash|zsh|rb|php|pl|lua|r|jl|sql|go|rs|kt|swift)`;
/**
 * A script handed to an interpreter (`python3 scripts/report.py --limit 5`).
 * Requiring the interpreter is what keeps incidental filenames in unrelated
 * commands (`git add report.py`) out; glob tokens are rejected so a search
 * pattern like `--include=*.ts` never reads as an executed script.
 */
const SCRIPT_INTERPRETER_PATTERN = new RegExp(
	String.raw`(?:^|[\s;&|])(?:python3?(?:\.\d+)?|pypy3?|bun|node|deno|tsx|ts-node|sh|bash|zsh|ruby|perl|php|lua)\s+[^;&|]*?([^\s"'` +
		String.raw`;&|()<>*?[\]{}]+\.` +
		SCRIPT_EXTENSIONS +
		String.raw`)\b`,
);
/** A script executed directly by path (`./scripts/deploy.sh`). */
const SCRIPT_PATH_PATTERN = new RegExp(
	String.raw`(?:^|[\s;&|])(\.{0,2}\/[^\s"'` + String.raw`;&|()<>*?[\]{}]+\.` + SCRIPT_EXTENSIONS + String.raw`)\b`,
);
/** Argument keys consulted for a target when the tool has no dedicated mapping. */
const GENERIC_TARGET_KEYS = ["description", "name", "query", "url", "path", "command", "pattern"] as const;

/**
 * Classify which agent produced a transcript from its path within the sessions
 * directory. Layout: `<sessionsDir>/<project>/<file>.jsonl` is the `main`
 * agent; subagent and advisor transcripts live nested one level deeper inside
 * the session's artifacts dir (`<project>/<session>/<id>.jsonl`,
 * `<project>/<session>/__advisor.jsonl`). Any advisor transcript
 * (`__advisor.jsonl` or `__advisor.<slug>.jsonl`) — at any depth, including a
 * subagent's own advisor — counts as `advisor`; every other nested transcript
 * is a task `subagent`.
 */
export function classifyAgentType(sessionPath: string): AgentType {
	const base = path.basename(sessionPath);
	if (base === ADVISOR_TRANSCRIPT_BASENAME || (base.startsWith("__advisor.") && base.endsWith(".jsonl"))) {
		return "advisor";
	}
	const rel = path.relative(getSessionsDir(), sessionPath);
	// `<project>/<file>.jsonl` -> 2 segments. Deeper nesting is a subagent.
	return rel.split(path.sep).length <= 2 ? "main" : "subagent";
}

/**
 * Extract folder name from session filename.
 * Session files are named like: --work--pi--/timestamp_uuid.jsonl
 * The folder part uses -- as path separator.
 */
export function extractFolderFromPath(sessionPath: string): string {
	const sessionsDir = getSessionsDir();
	const rel = path.relative(sessionsDir, sessionPath);
	const projectDir = rel.split(path.sep)[0];
	// Convert --work--pi-- to /work/pi
	return projectDir.replace(/^--/, "/").replace(/--/g, "/");
}

/**
 * Check if an entry is an assistant message.
 */
function isAssistantMessage(entry: SessionEntry): entry is SessionMessageEntry {
	if (entry.type !== "message") return false;
	const msgEntry = entry as SessionMessageEntry;
	// Legacy sessions (pre-id tracking) recorded message entries without an `id`.
	// They're not linkable and would violate the messages.entry_id NOT NULL
	// constraint, so skip them at the parser boundary.
	if (typeof msgEntry.id !== "string" || msgEntry.id.length === 0) return false;
	return msgEntry.message?.role === "assistant";
}

function isModelUsage(entry: SessionEntry): entry is SessionModelUsageEntry {
	if (entry.type !== "model_usage") return false;
	const usageEntry = entry as SessionModelUsageEntry;
	return typeof usageEntry.id === "string" && usageEntry.id.length > 0;
}

/**
 * Check if an entry is a user message (non-toolResult).
 */
function isUserMessage(entry: SessionEntry): entry is SessionMessageEntry {
	if (entry.type !== "message") return false;
	const msgEntry = entry as SessionMessageEntry;
	if (typeof msgEntry.id !== "string" || msgEntry.id.length === 0) return false;
	return msgEntry.message?.role === "user";
}

/**
 * Check if an entry is a service-tier change.
 */
function isServiceTierChange(entry: SessionEntry): entry is SessionServiceTierChangeEntry {
	return entry.type === "service_tier_change";
}

/**
 * Check if an entry is a tool-result message.
 */
function isToolResultMessage(entry: SessionEntry): entry is SessionMessageEntry {
	if (entry.type !== "message") return false;
	return (entry as SessionMessageEntry).message?.role === "toolResult";
}

/**
 * Extract plain text from a user message content payload.
 */
function extractUserText(content: unknown): string {
	if (typeof content === "string") return content;
	if (!Array.isArray(content)) return "";
	const parts: string[] = [];
	for (const block of content) {
		if (block && typeof block === "object" && (block as { type?: unknown }).type === "text") {
			const text = (block as { text?: unknown }).text;
			if (typeof text === "string") parts.push(text);
		}
	}
	return parts.join("");
}

/**
 * Build user-message stats from an entry. Returns null for empty/synthetic content.
 */
function extractUserStats(sessionFile: string, folder: string, entry: SessionMessageEntry): UserMessageStats | null {
	const msg = entry.message as { role: "user"; content?: unknown; synthetic?: boolean };
	if (msg.role !== "user" || msg.synthetic) return null;
	const text = extractUserText(msg.content);
	if (!text.trim()) return null;
	const metrics = computeUserMessageMetrics(text);
	const prose = judgeProse(text);
	const ts = Date.parse(entry.timestamp);
	return {
		sessionFile,
		entryId: entry.id,
		folder,
		timestamp: Number.isFinite(ts) ? ts : 0,
		model: null,
		provider: null,
		chars: metrics.chars,
		words: metrics.words,
		yelling: metrics.yelling,
		profanity: metrics.profanity,
		anguish: metrics.anguish,
		negation: metrics.negation,
		repetition: metrics.repetition,
		blame: metrics.blame,
		prose,
		proseHash: prose ? Bun.hash(prose).toString(16) : "",
	};
}

/**
 * Session JSONL is written by older versions and foreign producers, so a token
 * counter is whatever was persisted, not what `Usage` declares. A non-numeric
 * bucket (`input: "10"`) must never be parsed and must never be summed: `+`
 * would concatenate it into the derived total and SQLite would coerce the
 * resulting string to a different, far larger number. A non-finite one
 * (`input: 1e999` is legal JSON) must not reach a NOT NULL column either.
 * Malformed input counts as absent.
 */
function isFiniteCount(value: unknown): value is number {
	return typeof value === "number" && Number.isFinite(value);
}

function finiteTokenCount(value: unknown): number {
	return isFiniteCount(value) ? value : 0;
}

/**
 * Token-bucket view for total derivation. Persisted session payloads are
 * outside-controlled (old versions, foreign producers), so every counter is
 * `unknown` and validated at read time.
 */
export interface UsageBucketView {
	totalTokens?: unknown;
	input?: unknown;
	output?: unknown;
	cacheRead?: unknown;
	cacheWrite?: unknown;
	orchestration?: { input?: unknown; output?: unknown; cacheRead?: unknown } | null;
}

/**
 * Total tokens for one usage payload, per the documented contract: the
 * conversation buckets plus provider-reported orchestration tokens. A present
 * finite provider total stays authoritative; a missing or malformed one
 * (absent, string, NaN) is derived from the buckets, which would otherwise
 * persist a zero total next to real token counts. Shared by ingest and the
 * trace builder so stored and displayed totals cannot disagree.
 */
export function resolveUsageTotal(usage: UsageBucketView | null | undefined): number {
	if (typeof usage?.totalTokens === "number" && Number.isFinite(usage.totalTokens)) return usage.totalTokens;
	if (!usage || typeof usage !== "object") return 0;
	const orchestration =
		usage.orchestration && typeof usage.orchestration === "object" ? usage.orchestration : undefined;
	return (
		finiteTokenCount(usage.input) +
		finiteTokenCount(usage.output) +
		finiteTokenCount(usage.cacheRead) +
		finiteTokenCount(usage.cacheWrite) +
		finiteTokenCount(orchestration?.input) +
		finiteTokenCount(orchestration?.output) +
		finiteTokenCount(orchestration?.cacheRead)
	);
}

/**
 * Extract stats from an assistant message entry.
 *
 * Session JSONL on disk is not guaranteed to match the current
 * `AssistantMessage` shape: crash-truncated turns, sessions written by older
 * versions, and foreign producers all flow through this parser. Every field
 * returned here feeds a NOT NULL column in stats.db, so malformed entries are
 * coerced (missing `stopReason`, token counts, `timestamp`) or skipped
 * (missing `model`/`provider`/`api`/`usage`) instead of crashing the whole
 * sync with a constraint violation.
 */
function extractStats(
	sessionFile: string,
	folder: string,
	entry: SessionMessageEntry,
	currentServiceTier: ServiceTierByFamily | undefined,
	agentType: AgentType,
): MessageStatsInput | null {
	const msg = entry.message as AssistantMessage;
	if (msg?.role !== "assistant") return null;
	if (typeof msg.model !== "string" || typeof msg.provider !== "string" || typeof msg.api !== "string") return null;
	const rawUsage = msg.usage as Partial<Usage> | undefined;
	if (!rawUsage || typeof rawUsage !== "object") return null;

	// Backfill: when the session recorded a premium tier (`priority`/`ultrafast`)
	// as the active service tier at this point but the AI usage payload was
	// captured before premium requests were folded into `premiumRequests`, derive
	// the count here so the "Premium Reqs" stat aggregates premium traffic on
	// re-sync. The tier the provider reported serving the turn (`msg.serviceTier`)
	// is authoritative — it is proof the tier reached the wire, so the
	// discovery-metadata gate is skipped; the session's live setting is only a
	// fallback for turns recorded before that field existed. Trust any non-zero
	// value already in `usage.premiumRequests` (Copilot multipliers or the new AI
	// code path) and only synthesise when the field is missing/zero.
	const recorded = rawUsage.premiumRequests ?? 0;
	const model = {
		provider: msg.provider,
		api: msg.api,
		identity: classifyModel(msg.provider, msg.model, { lenient: true }),
	};
	const servedTier = parseServiceTier(msg.serviceTier);
	const tier = servedTier ?? resolveModelServiceTier(currentServiceTier, model);
	const derived =
		recorded > 0 ? recorded : getPremiumServiceTierRequests(tier, model, { served: servedTier !== undefined });
	const wellFormed =
		isFiniteCount(rawUsage.input) &&
		isFiniteCount(rawUsage.output) &&
		isFiniteCount(rawUsage.cacheRead) &&
		isFiniteCount(rawUsage.cacheWrite) &&
		isFiniteCount(rawUsage.totalTokens);
	const usage: MessageStatsInput["usage"] =
		wellFormed && derived === recorded
			? (rawUsage as Usage)
			: {
					...rawUsage,
					input: finiteTokenCount(rawUsage.input),
					output: finiteTokenCount(rawUsage.output),
					cacheRead: finiteTokenCount(rawUsage.cacheRead),
					cacheWrite: finiteTokenCount(rawUsage.cacheWrite),
					// A present finite provider total stays authoritative; a missing
					// or malformed one (absent, string, NaN) is derived from the buckets.
					totalTokens: resolveUsageTotal(rawUsage),
					// An omitted `cost` must stay omitted: `resolveStoredCost` reads
					// absence as "no recorded price" and estimates the request, while
					// a zero would read as an explicitly free request.
					cost: rawUsage.cost,
					premiumRequests: derived,
				};

	return {
		sessionFile,
		entryId: entry.id,
		folder,
		model: msg.model,
		provider: msg.provider,
		api: msg.api,
		timestamp: coerceEntryTimestamp(msg.timestamp, entry),
		duration: msg.duration ?? null,
		ttft: msg.ttft ?? null,
		// A message persisted without a terminal stop reason never completed
		// normally: classify by whether it carried an error.
		stopReason: msg.stopReason ?? (msg.errorMessage ? "error" : "aborted"),
		errorMessage: msg.errorMessage ?? null,
		usage,
		agentType,
		serviceTier: servedTier ?? null,
	};
}

function extractModelUsageStats(
	sessionFile: string,
	folder: string,
	entry: SessionModelUsageEntry,
	agentType: AgentType,
): MessageStatsInput | null {
	const timestamp = Date.parse(entry.timestamp);
	return extractStats(
		sessionFile,
		folder,
		{
			type: "message",
			id: entry.id,
			parentId: entry.parentId,
			timestamp: entry.timestamp,
			message: {
				role: "assistant",
				content: [],
				api: entry.api,
				provider: entry.provider,
				model: entry.model,
				usage: entry.usage,
				stopReason: entry.stopReason ?? "stop",
				errorMessage: entry.errorMessage,
				timestamp: Number.isFinite(timestamp) ? timestamp : 0,
			},
		},
		undefined,
		agentType,
	);
}

/** Message timestamp, falling back to the entry's ISO timestamp, then 0. */
function coerceEntryTimestamp(timestamp: number | undefined, entry: SessionMessageEntry): number {
	// A stored zero is the "no timestamp" sentinel, not 1970: fall through to
	// the entry envelope so a recoverable ISO time still selects its tariff.
	if (typeof timestamp === "number" && Number.isFinite(timestamp) && timestamp > 0) return timestamp;
	const ts = Date.parse(entry.timestamp);
	return Number.isFinite(ts) ? ts : 0;
}

/**
 * Extract one {@link ToolCallStats} per `toolCall` content block of an
 * assistant message. Returns an empty array for turns without tool calls.
 */
function extractToolCalls(
	sessionFile: string,
	folder: string,
	entry: SessionMessageEntry,
	agentType: AgentType,
): ToolCallStats[] {
	const msg = entry.message as AssistantMessage;
	if (msg?.role !== "assistant" || !Array.isArray(msg.content)) return [];
	// `tool_calls` columns are NOT NULL: skip turns that can't be attributed
	// (malformed persisted entries — see extractStats) and blocks missing ids.
	if (typeof msg.model !== "string" || typeof msg.provider !== "string") return [];

	const blocks = msg.content.filter(
		(block): block is ToolCall =>
			block !== null &&
			typeof block === "object" &&
			block.type === "toolCall" &&
			typeof block.id === "string" &&
			typeof block.name === "string",
	);
	if (blocks.length === 0) return [];

	const calls: ToolCallStats[] = [];
	for (const block of blocks) {
		// Names reduced to nothing by sanitization carry no tool identity:
		// skip them rather than attributing usage to garbage (see
		// sanitizeToolName). callsInTurn still counts the raw block total.
		const toolName = sanitizeToolName(block.name);
		if (toolName === null) continue;
		let argsChars = 0;
		try {
			argsChars = JSON.stringify(block.arguments ?? {}).length;
		} catch {
			// Non-serializable arguments (shouldn't happen in persisted JSONL); size unknown.
		}
		const meta = deriveToolMeta(toolName, block.arguments);
		calls.push({
			sessionFile,
			entryId: entry.id,
			toolCallId: block.id,
			folder,
			toolName,
			model: msg.model,
			provider: msg.provider,
			timestamp: coerceEntryTimestamp(msg.timestamp, entry),
			agentType,
			callsInTurn: blocks.length,
			argsChars,
			toolKind: meta.kind,
			serverName: meta.serverName,
			skillName: meta.skillName,
			scriptName: meta.scriptName,
			target: meta.target,
			argsPreview: meta.argsPreview,
		});
	}
	return calls;
}

/**
 * Tool names as persisted can be polluted by provider-side parse garbage — a
 * gateway may hand the model's whole invocation text back as the function
 * name (e.g. `bash command="ls -la …"` with a stray in-band closer), which
 * then shows up verbatim in every `GROUP BY tool_name` aggregate and the
 * dashboard tool filter. Reduce such names to their leading identifier token;
 * names that yield no identifier at all carry no tool identity and are
 * returned as `null` so the row is skipped.
 */
function sanitizeToolName(name: string): string | null {
	const trimmed = name.trim();
	if (trimmed.length === 0) return null;
	if (TOOL_NAME_PATTERN.test(trimmed)) return trimmed;
	const candidate = trimmed.split(/[^\w.:-]/)[0] ?? "";
	return candidate.length > 0 ? candidate : null;
}

/**
 * Sanitize one half of an MCP tool name the way the MCP bridge mints it
 * (`sanitizeMCPToolNamePart` in the coding agent's tool bridge): lowercase,
 * non-identifier characters collapsed into single underscores.
 */
function sanitizeMcpNamePart(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9_]+/g, "_")
		.replace(/_+/g, "_")
		.replace(/^_+|_+$/g, "");
}

/**
 * Configured MCP servers, sanitized the way their tool names embed them. Cached
 * per agent directory: a missing or malformed config only costs the exact
 * server split, which then falls back to the name shape.
 */
let mcpServerCache: { dir: string; servers: { sanitized: string; original: string }[] } | null = null;
function configuredMcpServers(): { sanitized: string; original: string }[] {
	const dir = getAgentDir();
	if (mcpServerCache?.dir === dir) return mcpServerCache.servers;
	const servers: { sanitized: string; original: string }[] = [];
	try {
		const config = JSON.parse(nodeFs.readFileSync(path.join(dir, "mcp.json"), "utf8")) as {
			mcpServers?: Record<string, unknown>;
		};
		for (const name of Object.keys(config.mcpServers ?? {})) {
			const sanitized = sanitizeMcpNamePart(name);
			if (sanitized.length > 0) servers.push({ sanitized, original: name });
		}
	} catch {
		// No readable MCP config: the name-shape fallback below still yields a server guess.
	}
	servers.sort((a, b) => b.sanitized.length - a.sanitized.length);
	mcpServerCache = { dir, servers };
	return servers;
}

/**
 * Split `mcp__<server>_<tool>` into its server and tool. The single-underscore
 * join makes the boundary ambiguous in the raw name, so match the longest
 * configured server prefix first and fall back to the last underscore, which
 * keeps multi-word server names (`sequential-thinking`) intact.
 */
function splitMcpToolName(toolName: string): { server: string | null; tool: string | null } {
	const rest = toolName.slice("mcp__".length);
	if (rest.length === 0) return { server: null, tool: null };
	for (const { sanitized, original } of configuredMcpServers()) {
		if (rest === sanitized) return { server: original, tool: null };
		if (rest.startsWith(`${sanitized}_`)) {
			return { server: original, tool: rest.slice(sanitized.length + 1) };
		}
	}
	// Doubled server prefixes (`serena_serena_write_memory`) name a server the
	// config does not list; the repetition still identifies the boundary.
	const first = rest.indexOf("_");
	if (first > 0) {
		const head = rest.slice(0, first);
		if (rest.startsWith(`${head}_${head}_`)) return { server: head, tool: rest.slice(first + 1) };
	}
	const at = rest.lastIndexOf("_");
	return at > 0 ? { server: rest.slice(0, at), tool: rest.slice(at + 1) } : { server: rest, tool: null };
}

/** First non-empty string value among `keys`, in order. */
function firstStringArg(args: Record<string, unknown> | null, keys: readonly string[]): string | null {
	if (!args) return null;
	for (const key of keys) {
		const value = args[key];
		if (typeof value === "string" && value.trim().length > 0) return value;
	}
	return null;
}

/** Collapse whitespace and cut a target to its display budget. */
function compactTarget(value: string | null): string | null {
	if (value === null) return null;
	const compact = value.replace(/\s+/g, " ").trim();
	if (compact.length === 0) return null;
	return compact.length > TOOL_TARGET_LIMIT ? `${compact.slice(0, TOOL_TARGET_LIMIT - 1)}…` : compact;
}

/** Serialized arguments kept for the call log; the full payload stays in the transcript. */
function argsPreview(args: unknown): string | null {
	if (args === undefined) return null;
	try {
		const text = JSON.stringify(args);
		if (text === undefined) return null;
		return text.length > ARGS_PREVIEW_LIMIT ? `${text.slice(0, ARGS_PREVIEW_LIMIT - 1)}…` : text;
	} catch {
		return null;
	}
}

/** Skill named by a `skill://` read target or a `manage_skill` call. */
function skillNameFromCall(toolName: string, args: Record<string, unknown> | null): string | null {
	if (toolName === "manage_skill") return firstStringArg(args, ["name"]);
	if (toolName !== "read") return null;
	const target = firstStringArg(args, ["path"]);
	if (!target) return null;
	const match = /^skill:(?:\/\/)?([^/?#:]+)/i.exec(target);
	return match?.[1] ?? null;
}

/** Script file executed by a shell/eval/computer call, or the inline eval language. */
function scriptNameFromCall(toolName: string, args: Record<string, unknown> | null): string | null {
	if (!SCRIPT_TOOL_NAMES.has(toolName)) return null;
	if (toolName === "eval") {
		const language = (firstStringArg(args, ["language"]) ?? "js").toLowerCase();
		const short = language === "python" ? "py" : language === "javascript" ? "js" : language;
		return `eval.${short}`;
	}
	const command = firstStringArg(args, ["command", "path"]);
	if (!command) return null;
	const match = SCRIPT_INTERPRETER_PATTERN.exec(command) ?? SCRIPT_PATH_PATTERN.exec(command);
	if (!match) return null;
	return path.basename(match[1]);
}

/** Most identifying target of a call: URL, command, path, query or `server/tool`. */
function targetFromCall(toolName: string, args: Record<string, unknown> | null): string | null {
	if (!args) return null;
	switch (toolName) {
		case "bash":
			return compactTarget(firstStringArg(args, ["command"]));
		case "eval": {
			const language = (firstStringArg(args, ["language"]) ?? "js").toLowerCase();
			return `eval ${language}`;
		}
		case "read":
		case "write":
		case "edit":
		case "ast_edit":
			return compactTarget(firstStringArg(args, ["path", "file_path", "filePath"]));
		case "grep":
		case "ast_grep":
		case "glob":
		case "find":
			return compactTarget(firstStringArg(args, ["pattern", "query", "path"]));
		case "fetch":
			return compactTarget(firstStringArg(args, ["url", "path"]));
		case "web_search":
			return compactTarget(firstStringArg(args, ["query"]));
		case "task":
			return compactTarget(firstStringArg(args, ["description", "agent", "prompt"]));
		case "manage_skill":
			return compactTarget(firstStringArg(args, ["name"]));
		default:
			return compactTarget(firstStringArg(args, GENERIC_TARGET_KEYS));
	}
}

/** Kind, source name and target derived from one tool call's name and arguments. */
interface ToolMeta {
	kind: ToolKind;
	serverName: string | null;
	skillName: string | null;
	scriptName: string | null;
	target: string | null;
	argsPreview: string | null;
}

function deriveToolMeta(toolName: string, args: unknown): ToolMeta {
	const record =
		args !== null && typeof args === "object" && !Array.isArray(args) ? (args as Record<string, unknown>) : null;
	const preview = argsPreview(args);
	if (toolName.startsWith("mcp__")) {
		const { server, tool } = splitMcpToolName(toolName);
		return {
			kind: "mcp",
			serverName: server,
			skillName: null,
			scriptName: null,
			target: compactTarget(tool ? `${server ?? "?"}/${tool}` : server),
			argsPreview: preview,
		};
	}
	const skillName = skillNameFromCall(toolName, record);
	if (skillName !== null) {
		return {
			kind: "skill",
			serverName: null,
			skillName,
			scriptName: null,
			target: compactTarget(skillName),
			argsPreview: preview,
		};
	}
	const scriptName = scriptNameFromCall(toolName, record);
	return {
		kind: scriptName !== null ? "script" : "builtin",
		serverName: null,
		skillName: null,
		scriptName,
		target: targetFromCall(toolName, record),
		argsPreview: preview,
	};
}

/**
 * Build the result linkage for a `toolResult` entry: text characters fed back
 * into context plus the error flag, keyed to the originating call.
 */
function extractToolResultLink(sessionFile: string, entry: SessionMessageEntry): ToolResultLink | null {
	const msg = entry.message as ToolResultMessage;
	if (msg.role !== "toolResult" || typeof msg.toolCallId !== "string" || msg.toolCallId.length === 0) return null;
	let resultChars = 0;
	if (Array.isArray(msg.content)) {
		for (const block of msg.content) {
			if (block && typeof block === "object" && block.type === "text" && typeof block.text === "string") {
				resultChars += block.text.length;
			}
		}
	}
	return {
		sessionFile,
		toolCallId: msg.toolCallId,
		resultChars,
		isError: msg.isError === true,
	};
}

const LF = 0x0a;
const CR = 0x0d;
const jsonLineDecoder = new TextDecoder();

function parseJsonLine(bytes: Uint8Array, start: number, end: number): SessionEntry | null {
	while (end > start && bytes[end - 1] === CR) end--;
	if (end <= start) return null;
	try {
		return JSON.parse(jsonLineDecoder.decode(bytes.subarray(start, end))) as SessionEntry;
	} catch {
		return null;
	}
}

function visitSessionEntriesLenient(bytes: Uint8Array, visit: (entry: SessionEntry) => void): number {
	let cursor = 0;
	let read = 0;

	while (cursor < bytes.length) {
		const newline = bytes.indexOf(LF, cursor);
		const hasNewline = newline !== -1;
		const lineEnd = hasNewline ? newline : bytes.length;
		const entry = parseJsonLine(bytes, cursor, lineEnd);
		if (entry) {
			visit(entry);
			read = hasNewline ? newline + 1 : lineEnd;
		} else if (hasNewline) {
			read = newline + 1;
		} else {
			break;
		}
		cursor = hasNewline ? newline + 1 : lineEnd;
	}

	return read;
}

/** Parse every well-formed entry in a transcript buffer (malformed lines skipped). */
export function parseAllSessionEntries(bytes: Uint8Array): SessionEntry[] {
	const entries: SessionEntry[] = [];
	visitSessionEntriesLenient(bytes, entry => entries.push(entry));
	return entries;
}

function scanLastServiceTier(bytes: Uint8Array): ServiceTierByFamily | undefined {
	let currentServiceTier: ServiceTierByFamily | undefined;
	visitSessionEntriesLenient(bytes, entry => {
		if (isServiceTierChange(entry)) currentServiceTier = coerceServiceTierByFamily(entry.serviceTier);
	});
	return currentServiceTier;
}
export interface SessionParserState {
	version: 1;
	offset: number;
	dev: number;
	ino: number;
	birthtimeMs: number;
	size: number;
	mtimeMs: number;
	checkpoint: string;
	serviceTier: ServiceTierByFamily | null;
}

export interface ParseSessionResult {
	stats: MessageStatsInput[];
	userStats: UserMessageStats[];
	userLinks: UserMessageLink[];
	toolCalls: ToolCallStats[];
	toolResults: ToolResultLink[];
	newOffset: number;
	parserState?: SessionParserState;
	reset?: boolean;
}

const CHECKPOINT_BYTES = 256;

async function readCheckpoint(handle: fs.FileHandle, end: number): Promise<Uint8Array> {
	// Positional reads keep the descriptor at zero for Bun.file(fd)'s subsequent tail read.
	const start = Math.max(0, end - CHECKPOINT_BYTES);
	const bytes = new Uint8Array(end - start);
	let read = 0;
	while (read < bytes.length) {
		const result = await handle.read(bytes, read, bytes.length - read, start + read);
		if (result.bytesRead === 0) break;
		read += result.bytesRead;
	}
	return bytes.subarray(0, read);
}

export function matchesSessionFile(state: SessionParserState, info: nodeFs.Stats): boolean {
	return state.dev === info.dev && state.ino === info.ino && state.birthtimeMs === info.birthtimeMs;
}

/** Offset-only callers reconstruct service-tier state once; persisted cursors read only the appended tail. */
export async function parseSessionFile(
	sessionPath: string,
	fromOffset = 0,
	state?: SessionParserState,
	replay = false,
): Promise<ParseSessionResult> {
	let bytes: Uint8Array;
	let start = fromOffset;
	let reset = false;
	let currentServiceTier: ServiceTierByFamily | undefined;
	let info: nodeFs.Stats;
	let checkpoint: string;
	let read: number;
	const folder = extractFolderFromPath(sessionPath);
	const agentType = classifyAgentType(sessionPath);
	const stats: MessageStatsInput[] = [];
	const userStats: UserMessageStats[] = [];
	const userLinks: UserMessageLink[] = [];
	const toolCalls: ToolCallStats[] = [];
	const toolResults: ToolResultLink[] = [];
	// First call per id: the row `INSERT OR IGNORE` keeps, so it can be written with its result.
	const callsById = new Map<string, ToolCallStats>();

	// Reduce each entry immediately so full replays do not retain tool-output/message bodies.
	const visit = (entry: SessionEntry): void => {
		if (isServiceTierChange(entry)) {
			currentServiceTier = coerceServiceTierByFamily(entry.serviceTier);
			return;
		}
		if (isUserMessage(entry)) {
			const userMsg = extractUserStats(sessionPath, folder, entry);
			if (userMsg) userStats.push(userMsg);
			return;
		}
		if (isToolResultMessage(entry)) {
			const link = extractToolResultLink(sessionPath, entry);
			if (!link) return;
			toolResults.push(link);
			const call = callsById.get(link.toolCallId);
			if (call && call.resultChars === undefined) {
				call.resultChars = link.resultChars;
				call.isError = link.isError;
			}
			return;
		}
		if (isModelUsage(entry)) {
			const modelUsageStats = extractModelUsageStats(sessionPath, folder, entry, agentType);
			if (modelUsageStats) {
				modelUsageStats.requestKb = estimateRequestKb(entry.usage);
				modelUsageStats.responseKb = 0;
				stats.push(modelUsageStats);
			}
			return;
		}
		if (isAssistantMessage(entry)) {
			const msgStats = extractStats(sessionPath, folder, entry, currentServiceTier, agentType);
			if (msgStats) {
				msgStats.requestKb = estimateRequestKb(msgStats.usage);
				msgStats.responseKb = toKb(jsonBytes(entry.message));
				stats.push(msgStats);
			}
			for (const call of extractToolCalls(sessionPath, folder, entry, agentType)) {
				toolCalls.push(call);
				if (!callsById.has(call.toolCallId)) callsById.set(call.toolCallId, call);
			}
			// Persist links even when the user entry was ingested in an earlier tail read.
			const parentId = entry.parentId;
			const msg = entry.message;
			if (parentId && msg.role === "assistant" && msg.model && msg.provider) {
				userLinks.push({
					sessionFile: sessionPath,
					entryId: parentId,
					model: msg.model,
					provider: msg.provider,
				});
			}
		}
	};

	try {
		const handle = await fs.open(sessionPath, "r");
		try {
			info = await handle.stat();
			const file = Bun.file(handle.fd);
			let resume = state?.version === 1 && state.offset === fromOffset;
			if (resume && state) {
				reset =
					!matchesSessionFile(state, info) ||
					info.size < state.size ||
					(info.size === state.size && info.mtimeMs !== state.mtimeMs);
				if (!reset) {
					const previous = await readCheckpoint(handle, fromOffset);
					reset = Bun.hash(previous).toString(16) !== state.checkpoint;
				}
				resume = !reset;
			}
			if (fromOffset > info.size) reset = true;
			if (replay) resume = false;
			start = reset || replay ? 0 : Math.max(0, fromOffset);
			const readStart = resume ? start : 0;
			bytes = await file.slice(readStart, info.size).bytes();
			currentServiceTier = resume
				? (state?.serviceTier ?? undefined)
				: scanLastServiceTier(bytes.subarray(0, start));
			read = visitSessionEntriesLenient(bytes.subarray(start - readStart), visit);
			const newOffset = start + read;
			const checkpointStart = Math.max(0, newOffset - CHECKPOINT_BYTES);
			const previous =
				checkpointStart >= readStart
					? bytes.subarray(checkpointStart - readStart, newOffset - readStart)
					: await readCheckpoint(handle, newOffset);
			checkpoint = Bun.hash(previous).toString(16);
		} finally {
			await handle.close();
		}
	} catch (err) {
		if (isEnoent(err))
			return { stats: [], userStats: [], userLinks: [], toolCalls: [], toolResults: [], newOffset: fromOffset };
		throw err;
	}

	const newOffset = start + read;
	return {
		stats,
		userStats,
		userLinks,
		toolCalls,
		toolResults,
		newOffset,
		reset,
		parserState: {
			version: 1,
			offset: newOffset,
			dev: info.dev,
			ino: info.ino,
			birthtimeMs: info.birthtimeMs,
			size: info.size,
			mtimeMs: info.mtimeMs,
			checkpoint,
			serviceTier: currentServiceTier ?? null,
		},
	};
}

/**
 * List all session directories (folders).
 */
export async function listSessionFolders(): Promise<string[]> {
	try {
		const sessionsDir = getSessionsDir();
		const entries = await fs.readdir(sessionsDir, { withFileTypes: true });
		return entries.filter(e => e.isDirectory()).map(e => path.join(sessionsDir, e.name));
	} catch {
		return [];
	}
}

/**
 * Name prefix of the scratch directories `omp gc --compress` creates beside
 * the files it copies on APFS. Their `.jsonl` files are transient copies of
 * transcripts, never transcripts of their own; a killed run can leave one
 * behind until the next `omp gc --compress --apply` removes it.
 */
export const COMPRESS_SCRATCH_PREFIX = ".omp-gc-compress-";

/** Whether `relativePath` (from any ancestor directory) lies inside a compress scratch directory. */
export function isCompressScratchPath(relativePath: string): boolean {
	return relativePath.split(/[\\/]/).some(part => part.startsWith(COMPRESS_SCRATCH_PREFIX));
}

/**
 * List all session files in a folder, excluding copies inside
 * `omp gc --compress` scratch directories.
 */
export async function listSessionFiles(folderPath: string): Promise<string[]> {
	try {
		const entries = await fs.readdir(folderPath, { recursive: true, withFileTypes: true });
		return entries
			.filter(
				e =>
					e.isFile() &&
					e.name.endsWith(".jsonl") &&
					!isCompressScratchPath(path.relative(folderPath, e.parentPath)),
			)
			.map(e => path.join(e.parentPath, e.name));
	} catch {
		return [];
	}
}

/**
 * List all session files across all folders.
 */
export async function listAllSessionFiles(): Promise<string[]> {
	const folders = await listSessionFolders();
	return (await Promise.all(folders.map(listSessionFiles))).flat();
}

/**
 * Find a specific entry in a session file.
 */
export async function getSessionEntry(sessionPath: string, entryId: string): Promise<SessionEntry | null> {
	try {
		for await (const line of readLines(Bun.file(sessionPath).stream())) {
			const entry = parseJsonLine(line, 0, line.length);
			if (entry && "id" in entry && entry.id === entryId) {
				return entry;
			}
		}
	} catch (err) {
		if (isEnoent(err)) return null;
		throw err;
	}
	return null;
}
