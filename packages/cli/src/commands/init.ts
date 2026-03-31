import { Command } from "commander";
import pc from "picocolors";
import { detectFramework, type Framework } from "../utils/detect-framework.js";
import { saveConfig } from "../utils/file-writer.js";

export interface InitOptions {
  cwd: string;
  framework: Framework | undefined;
  typescript: boolean;
  componentDir: string | undefined;
  cssDir: string | undefined;
  nonInteractive?: boolean;
}

export async function runInit(options: InitOptions): Promise<void> {
  const {
    cwd,
    typescript,
    nonInteractive = false,
  } = options;

  let framework = options.framework ?? null;
  const componentDir = options.componentDir ?? "src/components/win7ui";
  const cssDir = options.cssDir ?? `${componentDir}/css`;

  // Auto-detect framework if not provided
  if (!framework) {
    const detected = await detectFramework(cwd);
    if (detected) {
      framework = detected;
    } else if (nonInteractive) {
      throw new Error(
        "Could not detect framework. Please specify with --framework <react|svelte|vue>"
      );
    } else {
      // In interactive mode, would use @clack/prompts to ask
      // For now, throw -- interactive prompt will be wired up separately
      throw new Error(
        "Could not detect framework. Please specify with --framework <react|svelte|vue>"
      );
    }
  }

  const config = {
    framework,
    typescript,
    componentDir,
    cssDir,
  };

  await saveConfig(cwd, config);

  if (!nonInteractive) {
    console.log(
      pc.green("done") + " Created " + pc.bold("win7ui.config.json")
    );
    console.log();
    console.log(`  Framework:    ${pc.cyan(framework)}`);
    console.log(`  TypeScript:   ${pc.cyan(String(typescript))}`);
    console.log(`  Components:   ${pc.cyan(componentDir)}`);
    console.log(`  CSS:          ${pc.cyan(cssDir)}`);
    console.log();
    console.log(
      `Run ${pc.bold("npx win7ui add <component>")} to add components.`
    );
  }
}

export const initCommand = new Command("init")
  .description("Initialize win7ui in your project")
  .option(
    "-f, --framework <framework>",
    "Framework to use (react, svelte, vue)"
  )
  .option("--typescript", "Use TypeScript (default: true)", true)
  .option("--no-typescript", "Use JavaScript")
  .option("--component-dir <dir>", "Component output directory")
  .option("--css-dir <dir>", "CSS output directory")
  .action(async (opts) => {
    try {
      await runInit({
        cwd: process.cwd(),
        framework: opts.framework,
        typescript: opts.typescript,
        componentDir: opts.componentDir,
        cssDir: opts.cssDir,
      });
    } catch (err) {
      console.error(pc.red("Error:"), (err as Error).message);
      process.exit(1);
    }
  });
