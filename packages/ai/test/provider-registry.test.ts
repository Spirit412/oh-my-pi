import { Database } from "bun:sqlite";
import { afterEach, describe, expect, test, vi } from "bun:test";
import { AuthStorage, SqliteAuthCredentialStore } from "@oh-my-pi/pi-ai/auth-storage";
import { PASTE_CODE_LOGIN_PROVIDERS } from "@oh-my-pi/pi-ai/registry";
import {
	getOAuthProviders,
	refreshOAuthToken,
	registerOAuthProvider,
	unregisterOAuthProviders,
} from "@oh-my-pi/pi-ai/registry/oauth";
import type { OAuthCredentials, OAuthProvider } from "@oh-my-pi/pi-ai/registry/oauth/types";
import { getEnvApiKey } from "@oh-my-pi/pi-ai/env-api-key";

const FIXTURE_SOURCE = "provider-registry-test";
const ENV_KEYS = [
	"COREWEAVE_API_KEY",
	"ZENMUX_API_KEY",
	"EXA_API_KEY",
	"XAI_OAUTH_TOKEN",
	"UMANS_AI_CODING_PLAN_API_KEY",
	"LLAMA_CPP_API_KEY",
	"WANDB_API_KEY",
] as const;
const originalEnv = new Map(ENV_KEYS.map(key => [key, Bun.env[key]]));

afterEach(() => {
	unregisterOAuthProviders(FIXTURE_SOURCE);
	for (const key of ENV_KEYS) {
		const original = originalEnv.get(key);
		if (original === undefined) {
			delete Bun.env[key];
		} else {
			Bun.env[key] = original;
		}
	}
	vi.restoreAllMocks();
});

describe("provider registry auth surface", () => {
	test("env-key map merges catalog names, registry defs, and legacy keys", () => {
		Bun.env.ZENMUX_API_KEY = "zenmux-env";
		Bun.env.EXA_API_KEY = "exa-env";
		// Plain name derived from the catalog table's `envVars`.
		expect(getEnvApiKey("zenmux")).toBe("zenmux-env");
		Bun.env.UMANS_AI_CODING_PLAN_API_KEY = "umans-env";
		expect(getEnvApiKey("umans")).toBe("umans-env");
		Bun.env.LLAMA_CPP_API_KEY = "llama-env";
		expect(getEnvApiKey("llama.cpp")).toBe("llama-env");
		// Exa is derived from the provider registry's `envKeys` definition.
		expect(getEnvApiKey("exa")).toBe("exa-env");
	});

	test("multi-var catalog env fallback picks names in order", () => {
		Bun.env.XAI_OAUTH_TOKEN = "xai-oauth-env";
		expect(getEnvApiKey("xai-oauth")).toBe("xai-oauth-env");

		Bun.env.WANDB_API_KEY = "wandb-env";
		expect(getEnvApiKey("coreweave")).toBe("wandb-env");
		Bun.env.COREWEAVE_API_KEY = "coreweave-env";
		expect(getEnvApiKey("coreweave")).toBe("coreweave-env");
	});

	test("login list contains loginable providers and excludes env-only model providers", () => {
		const ids = getOAuthProviders().map(provider => provider.id);
		expect(ids).toContain("zenmux");
		expect(ids).toContain("kagi");
		expect(ids).toContain("exa");
		expect(ids).toContain("umans");
		expect(ids).toContain("llama.cpp");
		// openai has no interactive login flow.
		expect(ids).not.toContain("openai");
	});

	test("paste-code login set is derived from pasteCodeFlow", () => {
		expect([...PASTE_CODE_LOGIN_PROVIDERS].sort()).toEqual(
			[
				"anthropic",
				"devin",
				"gitlab-duo",
				"gitlab-duo-agent",
				"google-antigravity",
				"google-gemini-cli",
				"openai-codex",
				"openrouter",
				"snowflake",
				"stencil",
				"zai-coding-plan",
			].sort(),
		);
		expect(PASTE_CODE_LOGIN_PROVIDERS.has("zenmux")).toBe(false);
	});

	test("refresh dispatch returns api-key providers unchanged and routes real refreshers", async () => {
		const creds: OAuthCredentials = { refresh: "r", access: "a", expires: Date.now() + 60_000 };
		// zenmux has no refresher → returned as-is.
		expect(await refreshOAuthToken("zenmux", creds)).toBe(creds);

		const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(
				JSON.stringify({
					access_token: "a2",
					refresh_token: "r2",
					expires_in: 120,
					account: { uuid: "account", email_address: "user@example.com" },
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			),
		);
		const refreshed = await refreshOAuthToken("anthropic", creds);
		expect(refreshed.access).toBe("a2");
		expect(refreshed.refresh).toBe("r2");
		expect(fetchSpy).toHaveBeenCalledTimes(1);

		await expect(refreshOAuthToken("nonexistent-provider" as OAuthProvider, creds)).rejects.toThrow(
			"Unknown OAuth provider",
		);
	});

	test("login dispatcher handles runtime-registered extension providers", async () => {
		const store = new SqliteAuthCredentialStore(new Database(":memory:"));
		const storage = new AuthStorage(store);
		await storage.credentials.reload();
		registerOAuthProvider({
			id: "fixture-x",
			name: "Fixture X",
			sourceId: FIXTURE_SOURCE,
			login: async () => "fixture-key",
		});

		await storage.oauth.login("fixture-x", { onAuth: () => {}, onPrompt: async () => "" });

		expect(store.getApiKey("fixture-x")).toBe("fixture-key");
	});

	test("llama.cpp login stores a local no-auth token when no key is entered", async () => {
		const store = new SqliteAuthCredentialStore(new Database(":memory:"));
		const storage = new AuthStorage(store);
		await storage.credentials.reload();

		await storage.oauth.login("llama.cpp", { onAuth: () => {}, onPrompt: async () => "" });

		expect(store.getApiKey("llama.cpp")).toBe("llama-cpp-local");
	});

	test("kimi-code-ai signs in at auth.kimi.ai and stores the credential under kimi-code", async () => {
		const requested: string[] = [];
		const fetchMock = (async (input: string | URL | Request) => {
			const url = String(input);
			requested.push(url);
			if (url === "https://auth.kimi.ai/api/oauth/device_authorization") {
				return Response.json({
					user_code: "ABCD-EFGH",
					device_code: "ai-device-code",
					verification_uri: "https://www.kimi.ai/code/authorize_device",
					verification_uri_complete: "https://www.kimi.ai/code/authorize_device?user_code=ABCD-EFGH",
					expires_in: 1800,
					interval: 5,
				});
			}
			if (url === "https://auth.kimi.ai/api/oauth/token") {
				return Response.json({ access_token: "ai-access", refresh_token: "ai-refresh", expires_in: 3600 });
			}
			throw new Error(`unexpected request: ${url}`);
		}) as unknown as typeof fetch;

		const store = new SqliteAuthCredentialStore(new Database(":memory:"));
		const storage = new AuthStorage(store);
		await storage.credentials.reload();
		let authorization: { url: string; instructions?: string } | undefined;

		await storage.oauth.login("kimi-code-ai", {
			fetch: fetchMock,
			onAuth: info => {
				authorization = info;
			},
			onPrompt: async () => "",
		});

		// The device grant must never fall back to the .com front door.
		expect(requested).toEqual([
			"https://auth.kimi.ai/api/oauth/device_authorization",
			"https://auth.kimi.ai/api/oauth/token",
		]);
		expect(authorization?.url).toBe("https://www.kimi.ai/code/authorize_device?user_code=ABCD-EFGH");
		expect(authorization?.instructions).toBe("Enter code: ABCD-EFGH");
		// `store-as "kimi-code"` keeps one credential pool: models, discovery,
		// usage and web search all read the subscription from `kimi-code`.
		const stored = store.listAuthCredentials("kimi-code");
		expect(stored).toHaveLength(1);
		expect(stored[0].credential).toMatchObject({ access: "ai-access", refresh: "ai-refresh" });
		expect(store.listAuthCredentials("kimi-code-ai")).toHaveLength(0);
	});
});
