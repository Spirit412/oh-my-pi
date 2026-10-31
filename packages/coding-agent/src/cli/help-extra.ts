import "@oh-my-pi/pi-utils/env";
import chalk from "@oh-my-pi/pi-utils/chalk";
import { APP_NAME, CONFIG_DIR_NAME } from "@oh-my-pi/pi-utils/dirs";
import { t } from "../i18n";

export function getExtraHelpText(): string {
	return `${chalk.bold(t("omp.cli.help.envTitle", "Environment Variables:"))}
  ${chalk.dim(`# ${t("omp.cli.help.envGroup.core", "Core Providers")}`)}
  ANTHROPIC_API_KEY          - ${t("omp.cli.env.ANTHROPIC_API_KEY", "Anthropic Claude models")}
  ANTHROPIC_OAUTH_TOKEN      - ${t("omp.cli.env.ANTHROPIC_OAUTH_TOKEN", "Anthropic OAuth (takes precedence over API key)")}
  CLAUDE_CODE_USE_FOUNDRY    - ${t("omp.cli.env.CLAUDE_CODE_USE_FOUNDRY", "Enable Anthropic Foundry mode (uses Foundry endpoint + mTLS)")}
  FOUNDRY_BASE_URL           - ${t("omp.cli.env.FOUNDRY_BASE_URL", "Anthropic Foundry base URL (e.g., https://<foundry-host>)")}
  ANTHROPIC_FOUNDRY_API_KEY  - ${t("omp.cli.env.ANTHROPIC_FOUNDRY_API_KEY", "Anthropic token used as Authorization: Bearer <token> in Foundry mode")}
  ANTHROPIC_CUSTOM_HEADERS   - ${t("omp.cli.env.ANTHROPIC_CUSTOM_HEADERS", 'Extra headers for Foundry or any custom ANTHROPIC_BASE_URL gateway (e.g., "user-id: USERNAME")')}
  CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS - ${t("omp.cli.env.CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS", "Omit pre-release Anthropic fields (context_management, beta tool fields, task budgets, thinking.block_binding) for gateways that reject them")}
  CLAUDE_CODE_CLIENT_CERT    - ${t("omp.cli.env.CLAUDE_CODE_CLIENT_CERT", "Client certificate (PEM path or inline PEM) for mTLS")}
  CLAUDE_CODE_CLIENT_KEY     - ${t("omp.cli.env.CLAUDE_CODE_CLIENT_KEY", "Client private key (PEM path or inline PEM) for mTLS")}
  NODE_EXTRA_CA_CERTS        - ${t("omp.cli.env.NODE_EXTRA_CA_CERTS", "CA bundle path (or inline PEM) for server certificate validation")}
  OPENAI_API_KEY             - ${t("omp.cli.env.OPENAI_API_KEY", "OpenAI GPT models")}
  GEMINI_API_KEY             - ${t("omp.cli.env.GEMINI_API_KEY", "Google Gemini models")}
  COPILOT_GITHUB_TOKEN      - ${t("omp.cli.env.COPILOT_GITHUB_TOKEN", "GitHub Copilot")}

  ${chalk.dim(`# ${t("omp.cli.help.envGroup.additional", "Additional LLM Providers")}`)}
  AZURE_OPENAI_API_KEY       - ${t("omp.cli.env.AZURE_OPENAI_API_KEY", "Azure OpenAI models")}
  GROQ_API_KEY               - ${t("omp.cli.env.GROQ_API_KEY", "Groq models")}
  CEREBRAS_API_KEY           - ${t("omp.cli.env.CEREBRAS_API_KEY", "Cerebras models")}
  XAI_API_KEY                - ${t("omp.cli.env.XAI_API_KEY", "xAI Grok models")}
  OPENROUTER_API_KEY         - ${t("omp.cli.env.OPENROUTER_API_KEY", "OpenRouter aggregated models")}
  KILO_API_KEY               - ${t("omp.cli.env.KILO_API_KEY", "Kilo Gateway models")}
  MISTRAL_API_KEY            - ${t("omp.cli.env.MISTRAL_API_KEY", "Mistral models")}
  ZAI_API_KEY                - ${t("omp.cli.env.ZAI_API_KEY", "z.ai models (ZhipuAI/GLM)")}
  UMANS_AI_CODING_PLAN_API_KEY - ${t("omp.cli.env.UMANS_AI_CODING_PLAN_API_KEY", "Umans AI Coding Plan models")}
  ABLITERATION_API_KEY       - ${t("omp.cli.env.ABLITERATION_API_KEY", "Abliteration uncensored GLM models")}
  UMANS_WEBSEARCH_PROVIDER    - ${t("omp.cli.env.UMANS_WEBSEARCH_PROVIDER", "Umans gateway web search backend (native or exa)")}
  MINIMAX_API_KEY            - ${t("omp.cli.env.MINIMAX_API_KEY", "MiniMax models")}
  OPENCODE_API_KEY           - ${t("omp.cli.env.OPENCODE_API_KEY", "OpenCode Zen/OpenCode Go models")}
  CURSOR_ACCESS_TOKEN        - ${t("omp.cli.env.CURSOR_ACCESS_TOKEN", "Cursor AI models")}
  CLINE_API_KEY              - ${t("omp.cli.env.CLINE_API_KEY", "ClinePass subscription models")}
  COMMAND_CODE_API_KEY       - ${t("omp.cli.env.COMMAND_CODE_API_KEY", "Command Code Provider API models")}
  CHARM_HYPER_API_KEY        - ${t("omp.cli.env.CHARM_HYPER_API_KEY", "Charm Hyper inference gateway models")}
  AI_GATEWAY_API_KEY         - ${t("omp.cli.env.AI_GATEWAY_API_KEY", "Vercel AI Gateway")}
  STEPFUN_API_KEY            - ${t("omp.cli.env.STEPFUN_API_KEY", "StepFun Step models")}
  HELMCODE_API_KEY           - ${t("omp.cli.env.HELMCODE_API_KEY", "Helmcode private EU inference")}
  WAFER_SERVERLESS_API_KEY   - ${t("omp.cli.env.WAFER_SERVERLESS_API_KEY", "Wafer Serverless (pay-as-you-go)")}
  YOLO_AUTO_API_KEY          - ${t("omp.cli.env.YOLO_AUTO_API_KEY", "Yolo-Auto flat-rate Qwen models")}
  SINGULARITYAPI_DEV_API_KEY - ${t("omp.cli.env.SINGULARITYAPI_DEV_API_KEY", "SingularityAPI universal gateway (300+ models)")}
  SINGULARITYAPI_TECH_API_KEY - ${t("omp.cli.env.SINGULARITYAPI_TECH_API_KEY", "SingularityAPI reserved DeepSeek lanes")}

  ${chalk.dim(`# ${t("omp.cli.help.envGroup.cloud", "Cloud Providers")}`)}
  AWS_PROFILE                - ${t("omp.cli.env.AWS_PROFILE", "AWS Bedrock (or AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY)")}
  GOOGLE_CLOUD_PROJECT       - ${t("omp.cli.env.GOOGLE_CLOUD_PROJECT", "Google Vertex AI (requires GOOGLE_CLOUD_LOCATION)")}
  GOOGLE_APPLICATION_CREDENTIALS - ${t("omp.cli.env.GOOGLE_APPLICATION_CREDENTIALS", "Service account for Vertex AI")}

  ${chalk.dim(`# ${t("omp.cli.help.envGroup.search", "Search & Tools")}`)}
  EXA_API_KEY                - ${t("omp.cli.env.EXA_API_KEY", "Exa web search")}
  BRAVE_API_KEY              - ${t("omp.cli.env.BRAVE_API_KEY", "Brave web search")}
  PERPLEXITY_API_KEY         - ${t("omp.cli.env.PERPLEXITY_API_KEY", "Perplexity web search API key (optional; anonymous fallback)")}
  PERPLEXITY_COOKIES         - ${t("omp.cli.env.PERPLEXITY_COOKIES", "Perplexity web search (session cookie)")}
  TAVILY_API_KEY             - ${t("omp.cli.env.TAVILY_API_KEY", "Tavily web search")}
  TINYFISH_API_KEY           - ${t("omp.cli.env.TINYFISH_API_KEY", "TinyFish web search")}
  FIRECRAWL_API_KEY          - ${t("omp.cli.env.FIRECRAWL_API_KEY", "Firecrawl web search + fetch reader backend")}
  ANTHROPIC_SEARCH_API_KEY   - ${t("omp.cli.env.ANTHROPIC_SEARCH_API_KEY", "Anthropic web search (override; isolates search from main ANTHROPIC_API_KEY)")}
  ANTHROPIC_SEARCH_BASE_URL  - ${t("omp.cli.env.ANTHROPIC_SEARCH_BASE_URL", "Anthropic web search base URL (override; pairs with ANTHROPIC_SEARCH_API_KEY)")}
  TYPESAFE_API_KEY           - ${t("omp.cli.env.TYPESAFE_API_KEY", "TypeSafe System One judgments (auto thinking, unexpected-stop, AI staging, eval judge())")}

  ${chalk.dim(`# ${t("omp.cli.help.envGroup.configuration", "Configuration")}`)}
  OMP_PROFILE                 - ${t("omp.cli.env.OMP_PROFILE", "Named profile for isolated agent state (same as --profile)")}
  ${t("omp.cli.help.profileHint", "Use `omp --profile <name> --alias <command>` to create a shell shortcut for a profile")}
  PI_CODING_AGENT_DIR        - ${t("omp.cli.env.PI_CODING_AGENT_DIR", "Session storage directory (default: ~/{dir}/agent)", { dir: CONFIG_DIR_NAME })}
  PI_PACKAGE_DIR             - ${t("omp.cli.env.PI_PACKAGE_DIR", "Override package directory (for Nix/Guix store paths)")}
  PI_SMOL_MODEL              - ${t("omp.cli.env.PI_SMOL_MODEL", "Override smol/fast model (see --smol)")}
  PI_SLOW_MODEL              - ${t("omp.cli.env.PI_SLOW_MODEL", "Override slow/reasoning model (see --slow)")}
  PI_PLAN_MODEL              - ${t("omp.cli.env.PI_PLAN_MODEL", "Override planning model (see --plan)")}
  PI_NO_PTY                  - ${t("omp.cli.env.PI_NO_PTY", "Disable PTY-based interactive bash execution")}
  ${t("omp.cli.help.envDocs", "For complete environment variable reference, see:")}
  ${chalk.dim("docs/environment-variables.md")}
${chalk.bold(t("omp.cli.help.toolsTitle", "Available Tools (default-enabled unless noted):"))}
  read          - ${t("omp.cli.tool.read", "Read file contents")}
  bash          - ${t("omp.cli.tool.bash", "Execute bash commands")}
  edit          - ${t("omp.cli.tool.edit", "Edit files with find/replace")}
  grep          - ${t("omp.cli.tool.grep", "Search file contents")}
  glob          - ${t("omp.cli.tool.glob", "Find files by glob pattern")}
  lsp           - ${t("omp.cli.tool.lsp", "Language server protocol (code intelligence)")}
  python        - ${t("omp.cli.tool.python", "Execute Python code (requires: {app} setup python)", { app: APP_NAME })}
  browser       - ${t("omp.cli.tool.browser", "Browser automation (Puppeteer)")}
  computer      - ${t("omp.cli.tool.computer", "Native host desktop capture and input (disabled by default)")}
  task          - ${t("omp.cli.tool.task", "Launch sub-agents for parallel tasks")}
  todo          - ${t("omp.cli.tool.todo", "Manage todo/task lists")}
  web_search    - ${t("omp.cli.tool.web_search", "Search the web")}
  ask           - ${t("omp.cli.tool.ask", "Ask user questions (interactive mode only)")}

${chalk.bold(t("omp.cli.help.pluginTitle", "Plugin Options:"))}
  --plugin-dir <path>        - ${t("omp.cli.help.pluginDir", "Load plugin from directory (repeatable)")}

${chalk.bold(t("omp.cli.help.commandsTitle", "Useful Commands:"))}
  omp agents unpack           - ${t("omp.cli.help.agentsUnpack", "Export bundled subagents to ~/{dir}/agent/agents (default)", { dir: CONFIG_DIR_NAME })}
  omp agents unpack --project - ${t("omp.cli.help.agentsUnpackProject", "Export bundled subagents to ./{dir}/agents", { dir: CONFIG_DIR_NAME })}`;
}
