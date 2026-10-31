import { describe, expect, it } from "bun:test";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { getRecentToolCalls, getRequestDetails, syncAllSessions } from "@oh-my-pi/omp-stats/aggregator";
import { getRecentRequests } from "@oh-my-pi/omp-stats/db";
import { getOverallStats, getTimeSeries } from "@oh-my-pi/omp-stats/rollup";
import type { MessageStats, ToolCallDetail } from "@oh-my-pi/omp-stats/types";
import { getAgentDir, getSessionsDir } from "@oh-my-pi/pi-utils";
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

/** Serialized size of one session payload, in KB with two decimals (the ingest rule). */
function kbOf(value: unknown): number {
	return Math.round((Buffer.byteLength(JSON.stringify(value)) / 1024) * 100) / 100;
}

/** The ingest estimate: prompt tokens at 4 bytes each, in KB with two decimals. */
function estimateKb(promptTokens: number): number {
	return Math.round(((promptTokens * 4) / 1024) * 100) / 100;
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
	it("records request-context and response sizes per turn and exposes them in aggregates", async () => {
		const entries = buildEntries();
		await writeSessionFile(entries);
		await syncAllSessions({ workers: 1 });

		const requests = getRecentRequests(10);
		const first = requestRow(requests, "asst-1");
		// The request size is estimated from the prompt tokens; the response size
		// is the exact serialized assistant message.
		expect(first.requestKb).toBe(estimateKb(100));
		expect(first.responseKb).toBe(kbOf((entries[1] as { message: unknown }).message));
		expect(first.responseKb).toBeGreaterThan(0);

		// Aggregates add the same two values up; no other rows exist in the fixture.
		const overall = getOverallStats();
		expect(overall.totalRequestKb).toBeCloseTo(first.requestKb ?? 0, 6);
		expect(overall.totalResponseKb).toBeCloseTo(first.responseKb ?? 0, 6);

		const series = getTimeSeries({ cutoff: null, bucketMs: 24 * 60 * 60 * 1000 });
		expect(series).toHaveLength(1);
		expect(series[0].requestKb).toBeCloseTo(first.requestKb ?? 0, 6);
		expect(series[0].responseKb).toBeCloseTo(first.responseKb ?? 0, 6);
	});

	it("counts cache reads and writes toward the request estimate", async () => {
		const entries = buildEntries();
		const cached = buildAssistantEntry({
			entryId: "asst-cached",
			parentId: "tr-4",
			timestamp: TS2,
			content: [{ type: "text", text: "Done." }],
			usage: { input: 100, cacheRead: 900, cacheWrite: 0 },
		});
		await writeSessionFile([...entries, cached]);
		await syncAllSessions({ workers: 1 });

		// 100 uncached + 900 cache-read + 0 cache-write = 1000 prompt tokens.
		const row = requestRow(getRecentRequests(10), "asst-cached");
		expect(row.requestKb).toBe(estimateKb(1000));
		expect(row.requestKb).toBe(3.91);
		expect(row.responseKb).toBe(kbOf((cached as { message: unknown }).message));
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
