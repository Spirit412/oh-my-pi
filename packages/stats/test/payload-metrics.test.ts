import { describe, expect, it } from "bun:test";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { Database } from "bun:sqlite";
import { getRecentToolCalls, getRequestDetails, syncAllSessions } from "@oh-my-pi/omp-stats/aggregator";
import { closeDb, getRecentRequests, initDb } from "@oh-my-pi/omp-stats/db";
import { getOverallStats, getTimeSeries } from "@oh-my-pi/omp-stats/rollup";
import type { MessageStats, ToolCallDetail } from "@oh-my-pi/omp-stats/types";
import { getAgentDir, getSessionsDir, getStatsDbPath } from "@oh-my-pi/pi-utils";
import { installStatsTestIsolation } from "./helpers/temp-agent";

installStatsTestIsolation("@pi-stats-payload-metrics-");

const FOLDER_SLUG = "--tmp--payload-metrics";
const MODEL = "gpt-5.4";
const PROVIDER = "openai";
const TS1 = "2026-06-24T10:00:00.000Z";
const TS2 = "2026-06-24T10:05:00.000Z";
const TS3 = "2026-06-24T10:10:00.000Z";

const USER_TEXT = "Please analyze the merge request and produce a report.";
const SKILL_PATH = "skill://pdf";
const SCRIPT_TOOL_NAME = "bash";

/** Wire bytes as KB with two decimals (the ingest rule). */
function bytesKb(bytes: number): number {
	return Math.round((bytes / 1024) * 100) / 100;
}

function buildUserEntry(entryId: string, content: string) {
	return {
		type: "message",
		id: entryId,
		parentId: null,
		timestamp: TS1,
		message: { role: "user", content },
	};
}

interface AssistantOptions {
	entryId: string;
	parentId: string | null;
	timestamp: string;
	content: unknown[];
	/** Prompt-side usage override; defaults to 100 uncached input tokens. */
	usage?: { input?: number; cacheRead?: number; cacheWrite?: number };
	/** Exact wire sizes the AI transport records; omitted for pre-measurement sessions. */
	payload?: { requestBytes?: number; responseBytes?: number };
}

function buildAssistantEntry(opts: AssistantOptions) {
	return {
		type: "message",
		id: opts.entryId,
		parentId: opts.parentId,
		timestamp: opts.timestamp,
		message: {
			role: "assistant",
			content: opts.content,
			api: "openai-responses",
			provider: PROVIDER,
			model: MODEL,
			usage: {
				input: opts.usage?.input ?? 100,
				output: 20,
				cacheRead: opts.usage?.cacheRead ?? 0,
				cacheWrite: opts.usage?.cacheWrite ?? 0,
				totalTokens: 120,
				cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0.01 },
			},
			stopReason: "toolUse",
			timestamp: Date.parse(opts.timestamp),
			duration: 10,
			ttft: 5,
			...(opts.payload?.requestBytes !== undefined ? { requestBytes: opts.payload.requestBytes } : {}),
			...(opts.payload?.responseBytes !== undefined ? { responseBytes: opts.payload.responseBytes } : {}),
		},
	};
}

function buildToolResult(entryId: string, parentId: string, toolCallId: string, text: string) {
	return {
		type: "message",
		id: entryId,
		parentId,
		timestamp: TS1,
		message: {
			role: "toolResult",
			toolCallId,
			toolName: "tool",
			content: [{ type: "text", text }],
			isError: false,
			timestamp: Date.parse(TS1),
		},
	};
}

const TOOL_CALLS = [
	{ id: "call-mcp", name: "mcp__gitlab_get_merge_request", arguments: { project: "acme/api", iid: "42" } },
	{ id: "call-skill", name: "read", arguments: { path: SKILL_PATH } },
	{ id: "call-script", name: SCRIPT_TOOL_NAME, arguments: { command: "python3 scripts/report.py --limit 5" } },
	{ id: "call-skill-edit", name: "manage_skill", arguments: { action: "create", name: "weekly-report" } },
] as const;

function toolCallBlocks() {
	return TOOL_CALLS.map(call => ({ type: "toolCall", ...call }));
}

function buildEntries() {
	return [
		buildUserEntry("user-1", USER_TEXT),
		buildAssistantEntry({
			entryId: "asst-1",
			parentId: "user-1",
			timestamp: TS1,
			content: [{ type: "text", text: "Working on it." }, ...toolCallBlocks()],
			payload: { requestBytes: 4096, responseBytes: 2048 },
		}),
		buildToolResult("tr-1", "asst-1", "call-mcp", "merge request body"),
		buildToolResult("tr-2", "asst-1", "call-skill", "skill instructions"),
		buildToolResult("tr-3", "asst-1", "call-script", "report output"),
		buildToolResult("tr-4", "asst-1", "call-skill-edit", "skill created"),
	];
}

async function writeSessionFile(entries: unknown[]): Promise<string> {
	const sessionDir = path.join(getSessionsDir(), FOLDER_SLUG);
	await fs.mkdir(sessionDir, { recursive: true });
	const sessionFile = path.join(sessionDir, "session.jsonl");
	const header = {
		type: "session",
		version: 3,
		id: "sess-payload-1",
		timestamp: new Date().toISOString(),
		cwd: "/tmp/project",
	};
	await Bun.write(sessionFile, `${[header, ...entries].map(entry => JSON.stringify(entry)).join("\n")}\n`);
	return sessionFile;
}

function requestRow(rows: MessageStats[], entryId: string): MessageStats {
	const row = rows.find(r => r.entryId === entryId);
	if (!row) throw new Error(`missing request row for ${entryId}`);
	return row;
}

function callRow(calls: ToolCallDetail[], toolCallId: string): ToolCallDetail {
	const row = calls.find(call => call.toolCallId === toolCallId);
	if (!row) throw new Error(`missing tool call ${toolCallId}`);
	return row;
}

describe("payload metrics and tool metadata", () => {
	it("stores the exact wire sizes the transport measured and sums them", async () => {
		const entries = buildEntries();
		await writeSessionFile(entries);
		await syncAllSessions({ workers: 1 });

		const first = requestRow(getRecentRequests(10), "asst-1");
		// Straight from the recorded byte counts, independent of token usage.
		expect(first.requestKb).toBe(bytesKb(4096));
		expect(first.requestKb).toBe(4);
		expect(first.responseKb).toBe(bytesKb(2048));
		expect(first.responseKb).toBe(2);

		const overall = getOverallStats();
		expect(overall.totalRequestKb).toBeCloseTo(4, 6);
		expect(overall.totalResponseKb).toBeCloseTo(2, 6);
		expect(overall.payloadRequests).toBe(1);

		const series = getTimeSeries({ cutoff: null, bucketMs: 24 * 60 * 60 * 1000 });
		expect(series).toHaveLength(1);
		expect(series[0].requestKb).toBeCloseTo(4, 6);
		expect(series[0].responseKb).toBeCloseTo(2, 6);
	});

	it("leaves sessions without measured bytes null and out of every sum", async () => {
		const entries = buildEntries();
		const unmeasured = buildAssistantEntry({
			entryId: "asst-unmeasured",
			parentId: "tr-4",
			timestamp: TS2,
			content: [{ type: "text", text: "Done." }],
			usage: { input: 5_000, cacheRead: 900_000, cacheWrite: 0 },
		});
		await writeSessionFile([...entries, unmeasured]);
		await syncAllSessions({ workers: 1 });

		// Large token usage must not turn into a fabricated kilobyte figure.
		const row = requestRow(getRecentRequests(10), "asst-unmeasured");
		expect(row.requestKb).toBeNull();
		expect(row.responseKb).toBeNull();

		// Only the measured turn contributes; the count names the denominator.
		const overall = getOverallStats();
		expect(overall.totalRequestKb).toBeCloseTo(4, 6);
		expect(overall.payloadRequests).toBe(1);
	});

	it("replaces the interim NOT NULL size columns and clears their estimates", async () => {
		// Simulate a database written by the revision that derived KB from prompt
		// tokens: NOT NULL columns carrying a value for an existing row.
		await fs.mkdir(path.dirname(getStatsDbPath()), { recursive: true });
		const handle = new Database(getStatsDbPath());
		handle.run(`
			CREATE TABLE messages (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				session_file TEXT NOT NULL,
				entry_id TEXT NOT NULL,
				folder TEXT NOT NULL,
				model TEXT NOT NULL,
				provider TEXT NOT NULL,
				api TEXT NOT NULL,
				timestamp INTEGER NOT NULL,
				duration INTEGER,
				ttft INTEGER,
				stop_reason TEXT NOT NULL,
				error_message TEXT,
				input_tokens INTEGER NOT NULL,
				output_tokens INTEGER NOT NULL,
				cache_read_tokens INTEGER NOT NULL,
				cache_write_tokens INTEGER NOT NULL,
				total_tokens INTEGER NOT NULL,
				premium_requests REAL NOT NULL,
				cost_input REAL NOT NULL,
				cost_output REAL NOT NULL,
				cost_cache_read REAL NOT NULL,
				cost_cache_write REAL NOT NULL,
				cost_total REAL NOT NULL,
				cost_no_cache_input REAL,
				cost_unpriced INTEGER NOT NULL DEFAULT 0,
				agent_type TEXT NOT NULL DEFAULT 'main',
				service_tier TEXT,
				request_kb REAL NOT NULL DEFAULT 0,
				response_kb REAL NOT NULL DEFAULT 0,
				UNIQUE(session_file, entry_id)
			)
		`);
		handle.run(
			`INSERT INTO messages (session_file, entry_id, folder, model, provider, api, timestamp,
				stop_reason, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, total_tokens,
				premium_requests, cost_input, cost_output, cost_cache_read, cost_cache_write, cost_total,
				request_kb, response_kb)
			 VALUES ('/tmp/old.jsonl', 'old-1', '/tmp', 'm', 'p', 'openai-completions', 1,
				'stop', 10, 5, 0, 0, 15, 0, 0, 0, 0, 0, 0, 1213.91, 2.5)`,
		);
		handle.close();

		await initDb();
		const db = await initDb();
		const row = db.query("SELECT id, entry_id, request_kb, response_kb FROM messages").get() as {
			id: number;
			entry_id: string;
			request_kb: number | null;
			response_kb: number | null;
		};
		expect(row.entry_id).toBe("old-1");
		expect(row.id).toBe(1);
		expect(row.request_kb).toBeNull();
		expect(row.response_kb).toBeNull();
		closeDb();
	});

	it("records MCP server, skill, script and target metadata for tool calls", async () => {
		// The exact MCP server split needs the configured server list.
		await Bun.write(path.join(getAgentDir(), "mcp.json"), JSON.stringify({ mcpServers: { gitlab: {} } }));
		const entries = buildEntries();
		await writeSessionFile(entries);
		await syncAllSessions({ workers: 1 });

		const calls = await getRecentToolCalls(20, "all");
		expect(calls).toHaveLength(TOOL_CALLS.length);

		const mcp = callRow(calls, "call-mcp");
		expect(mcp.kind).toBe("mcp");
		expect(mcp.server).toBe("gitlab");
		expect(mcp.target).toBe("gitlab/get_merge_request");
		expect(mcp.argsPreview).toContain("acme/api");

		const skill = callRow(calls, "call-skill");
		expect(skill.kind).toBe("skill");
		expect(skill.skill).toBe("pdf");
		expect(skill.target).toBe("pdf");

		const script = callRow(calls, "call-script");
		expect(script.tool).toBe(SCRIPT_TOOL_NAME);
		expect(script.kind).toBe("script");
		expect(script.script).toBe("report.py");
		expect(script.target).toBe("python3 scripts/report.py --limit 5");

		const managed = callRow(calls, "call-skill-edit");
		expect(managed.kind).toBe("skill");
		expect(managed.skill).toBe("weekly-report");

		// The request drawer carries the same metadata for its turn.
		const firstRow = requestRow(getRecentRequests(10), "asst-1");
		expect(typeof firstRow.id).toBe("number");
		const details = await getRequestDetails(firstRow.id as number);
		expect(details?.toolCalls.map(call => call.toolCallId).sort()).toEqual(TOOL_CALLS.map(call => call.id).sort());
	});

	it("separates executed scripts from incidental filenames and doubled MCP prefixes", async () => {
		const entries = [
			buildUserEntry("user-1", USER_TEXT),
			buildAssistantEntry({
				entryId: "asst-heuristics",
				parentId: "user-1",
				timestamp: TS3,
				content: [
					{ type: "toolCall", id: "call-git-add", name: "bash", arguments: { command: "git add report.py" } },
					{
						type: "toolCall",
						id: "call-glob",
						name: "bash",
						arguments: { command: "grep -rn --include=*.ts 'x'" },
					},
					{
						type: "toolCall",
						id: "call-direct",
						name: "bash",
						arguments: { command: "./scripts/deploy.sh --dry-run" },
					},
					{
						type: "toolCall",
						id: "call-flag",
						name: "bash",
						arguments: { command: "python3 -u scripts/report.py --limit 5" },
					},
					{
						type: "toolCall",
						id: "call-doubled",
						name: "mcp__serena_serena_write_memory",
						arguments: { memory_name: "notes" },
					},
				],
			}),
		];
		await writeSessionFile(entries);
		await syncAllSessions({ workers: 1 });

		const calls = await getRecentToolCalls(20, "all");
		// A filename that another command mentions is not an executed script.
		expect(callRow(calls, "call-git-add").kind).toBe("builtin");
		expect(callRow(calls, "call-glob").kind).toBe("builtin");
		// An interpreter (even behind flags) or a direct path does execute one.
		expect(callRow(calls, "call-direct").script).toBe("deploy.sh");
		expect(callRow(calls, "call-flag").script).toBe("report.py");
		// A doubled server prefix identifies the server without a config entry.
		const doubled = callRow(calls, "call-doubled");
		expect(doubled.server).toBe("serena");
		expect(doubled.target).toBe("serena/serena_write_memory");
	});

	it("derives the MCP server from the tool name when no config is available", async () => {
		const entries = [
			buildUserEntry("user-1", USER_TEXT),
			buildAssistantEntry({
				entryId: "asst-nocfg",
				parentId: "user-1",
				timestamp: TS3,
				content: [
					{
						type: "toolCall",
						id: "call-nocfg",
						name: "mcp__sequential_thinking_sequentialthinking",
						arguments: {},
					},
				],
			}),
		];
		await writeSessionFile(entries);
		await syncAllSessions({ workers: 1 });

		const call = callRow(await getRecentToolCalls(20, "all"), "call-nocfg");
		expect(call.kind).toBe("mcp");
		// Without the configured server list the split can only report the
		// sanitized name the tool embeds; the last-underscore boundary keeps
		// multi-word servers together.
		expect(call.server).toBe("sequential_thinking");
		expect(call.target).toBe("sequential_thinking/sequentialthinking");
	});
});
