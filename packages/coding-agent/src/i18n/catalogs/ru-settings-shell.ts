import type { TranslationCatalog } from "@oh-my-pi/pi-utils/i18n";

/** Russian copy for the shell settings tab. */
export const ruSettingsShell: TranslationCatalog = {
	"omp.setting.bash.enabled.label": "Bash",
	"omp.setting.bash.enabled.description": "Включать инструмент bash для выполнения команд оболочки",
	"omp.setting.bash.allowCompoundCommands.label": "Allow Compound Commands",
	"omp.setting.bash.allowCompoundCommands.description":
		"Вычислять литеральные цепочки && для каждой команды; для неподходящих команд используются обычная политика и режим разрешений bash",
	"omp.setting.bash.autoBackground.enabled.label": "Bash Auto-Background",
	"omp.setting.bash.autoBackground.enabled.description":
		"Автоматически переводить длительные команды bash в фон и доставлять результат позже",
	"omp.setting.bash.gitGuard.label": "Git Guard",
	"omp.setting.bash.gitGuard.description":
		"Запрещать команды git, которые отбрасывают или перемещают общую работу в основном рабочем каталоге репозитория: stash, reset --hard или на другой коммит, а также checkout/switch/restore вне конфликта слияния или rebase. В связанном worktree они выполняются, предварительно сохраняя отбрасываемые незакоммиченные изменения",
	"omp.setting.bash.patterns.label": "Bash Approval Patterns",
	"omp.setting.bash.patterns.description":
		"Упорядоченные правила разрешений для команд bash. Каждый элемент имеет поля match и approval; поддерживаются только подстановочные знаки '*'.",
	"omp.setting.bashInterceptor.enabled.label": "Bash Interceptor",
	"omp.setting.bashInterceptor.enabled.description":
		"Блокировать команды оболочки, для которых есть отдельные инструменты",
	"omp.setting.bash.direnv.label": "direnv Auto-Load",
	"omp.setting.bash.direnv.description":
		"Автоматически загружать `.envrc` репозитория из direnv/devenv в сессию bash, чтобы инструменты и переменные окружения devenv были доступны без ручного `direnv exec`. Учитывает список разрешённых direnv: `.envrc`, для которого вы не выполняли `direnv allow`, никогда не исполняется",
	"omp.setting.bash.direnvLoadTimeoutMs.label": "direnv Load Timeout (ms)",
	"omp.setting.bash.direnvLoadTimeoutMs.description":
		"Максимальное ожидание первого `direnv export` (холодная оболочка devenv может запускаться медленно); при тайм-ауте сессия работает без окружения direnv",
	"omp.setting.shellMinimizer.enabled.label": "Shell Minimizer",
	"omp.setting.shellMinimizer.enabled.description":
		"Сжимать подробный вывод оболочки (git, npm, cargo и т. д.) перед возвратом его агенту",
	"omp.setting.shellMinimizer.sourceOutlineLevel.label": "Shell Minimizer Source Outline",
	"omp.setting.shellMinimizer.sourceOutlineLevel.description":
		"Режим структуры исходников для cat/read файлов исходного кода: default или aggressive",
	"omp.setting.eval.py.label": "Python Eval Backend",
	"omp.setting.eval.py.description": "Разрешать инструменту eval отправлять ячейки Python в ядро IPython",
	"omp.setting.eval.js.label": "JavaScript Eval Backend",
	"omp.setting.eval.js.description":
		"Разрешать инструменту eval отправлять ячейки JavaScript во внутрипроцессный рантайм",
	"omp.setting.eval.autoProvision.label": "Eval Environment Provisioning",
	"omp.setting.eval.autoProvision.description":
		"Автоматически создавать управляемое окружение пакета для JavaScript eval при первой установке",
	"omp.setting.eval.tools.enabled.label": "Eval-Defined Tools",
	"omp.setting.eval.tools.enabled.description":
		"Позволять ячейкам eval определять инструменты (@tool в Python, tool(fn) в JS), которые могут вызывать субагенты task, agent() и workpool()",
	"omp.setting.eval.workpool.freshAgents.label": "Fresh Workpool Agents",
	"omp.setting.eval.workpool.freshAgents.description":
		"Запускать новый субагент для каждого элемента workpool вместо повторного использования воркеров или объединения элементов из очереди в пакеты",
	"omp.setting.eval.autoBackground.enabled.label": "Eval Auto-Background",
	"omp.setting.eval.autoBackground.enabled.description":
		"Автоматически переводить длительные ячейки eval в фон и доставлять результат позже",
	"omp.setting.python.kernelMode.label": "Python Kernel Mode",
	"omp.setting.python.kernelMode.description":
		"Сохранять ядро IPython между вызовами eval или запускать новое каждый раз",
	"omp.setting.python.interpreter.label": "Python Interpreter",
	"omp.setting.python.interpreter.description":
		"Необязательный путь к конкретному исполняемому файлу Python. Если задан, автоматический поиск среды выполнения Python пропускается.",
};
