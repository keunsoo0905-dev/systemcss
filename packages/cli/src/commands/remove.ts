import { Command } from "commander";
import fs from "fs-extra";
import path from "path";
import pc from "picocolors";
import {
  loadConfig,
  removeFile,
  updateBarrelFile,
} from "../utils/file-writer.js";

export interface RemoveOptions {
  cwd: string;
  components: string[];
  force: boolean;
  nonInteractive?: boolean;
}

function getExpectedFilename(
  componentName: string,
  framework: string,
  typescript: boolean
): string {
  const pascalName =
    componentName.charAt(0).toUpperCase() + componentName.slice(1);
  let ext: string;
  if (framework === "react") {
    ext = typescript ? ".tsx" : ".jsx";
  } else if (framework === "svelte") {
    ext = typescript ? ".svelte" : ".js.svelte";
  } else {
    ext = typescript ? ".vue" : ".js.vue";
  }
  return `${pascalName}${ext}`;
}

function getCssFilename(
  componentName: string,
  framework: string
): string {
  if (framework === "react") {
    return `${componentName}.module.css`;
  }
  // Svelte/Vue have CSS injected in the component; no separate CSS file to remove
  return "";
}

export async function runRemove(options: RemoveOptions): Promise<void> {
  const { cwd, components, force, nonInteractive = false } = options;

  const config = await loadConfig(cwd);
  if (!config) {
    throw new Error(
      'win7ui not initialized. Run "npx win7ui init" first.'
    );
  }

  const { framework, typescript, componentDir, cssDir } = config;
  const absComponentDir = path.resolve(cwd, componentDir);
  const absCssDir = path.resolve(cwd, cssDir);

  const removed: string[] = [];

  for (const componentName of components) {
    const filename = getExpectedFilename(componentName, framework, typescript);
    const componentPath = path.join(absComponentDir, filename);

    if (!(await fs.pathExists(componentPath))) {
      if (!nonInteractive) {
        console.log(
          pc.yellow("!") +
            ` ${componentName} is not installed. Skipping.`
        );
      }
      continue;
    }

    // Remove component file
    await removeFile(componentPath);

    // Remove CSS file (React only has separate CSS files)
    const cssFilename = getCssFilename(componentName, framework);
    if (cssFilename) {
      const cssPath = path.join(absCssDir, cssFilename);
      await removeFile(cssPath);
    }

    removed.push(componentName);

    if (!nonInteractive) {
      console.log(pc.green("done") + " Removed " + pc.bold(filename));
    }
  }

  // Update barrel file
  if (removed.length > 0) {
    // Scan remaining components in directory
    const remainingComponents: string[] = [];
    if (await fs.pathExists(absComponentDir)) {
      const files = await fs.readdir(absComponentDir);
      for (const file of files) {
        // Skip barrel file and non-component files
        if (file.startsWith("index.")) continue;
        if (file.endsWith(".css")) continue;

        // Extract component name from filename
        const baseName = file
          .replace(/\.(tsx|jsx|svelte|js\.svelte|vue|js\.vue)$/, "")
          .toLowerCase();
        if (baseName) {
          remainingComponents.push(baseName);
        }
      }
    }

    await updateBarrelFile(absComponentDir, remainingComponents, typescript);
  }
}

export const removeCommand = new Command("remove")
  .description("Remove components from your project")
  .argument("<components...>", "Component names to remove")
  .option("--force", "Force removal without dependency check", false)
  .action(async (components: string[], opts) => {
    try {
      await runRemove({
        cwd: process.cwd(),
        components,
        force: opts.force,
      });
    } catch (err) {
      console.error(pc.red("Error:"), (err as Error).message);
      process.exit(1);
    }
  });
