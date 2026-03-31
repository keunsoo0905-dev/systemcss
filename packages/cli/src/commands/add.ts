import { Command } from "commander";
import fs from "fs-extra";
import path from "path";
import pc from "picocolors";
import {
  loadConfig,
  copyFile,
  updateBarrelFile,
} from "../utils/file-writer.js";
import {
  loadRegistryIndex,
  loadComponentDetail,
  getRegistryFilePath,
  type RegistryIndex,
  type ComponentDetail,
} from "../utils/registry.js";

export interface AddOptions {
  cwd: string;
  components: string[];
  registryPath?: string;
  overwrite: boolean;
  nonInteractive?: boolean;
}

async function loadRegistryIndexFrom(
  registryPath: string
): Promise<RegistryIndex> {
  const indexPath = path.join(registryPath, "index.json");
  return fs.readJson(indexPath);
}

async function loadComponentDetailFrom(
  registryPath: string,
  componentName: string
): Promise<ComponentDetail> {
  const componentPath = path.join(
    registryPath,
    "components",
    `${componentName}.json`
  );
  if (!(await fs.pathExists(componentPath))) {
    throw new Error(`Component "${componentName}" not found in registry`);
  }
  return fs.readJson(componentPath);
}

export async function runAdd(options: AddOptions): Promise<void> {
  const { cwd, components, registryPath, overwrite, nonInteractive = false } = options;

  // Load config
  const config = await loadConfig(cwd);
  if (!config) {
    throw new Error(
      'win7ui not initialized. Run "npx win7ui init" first.'
    );
  }

  const { framework, typescript, componentDir, cssDir } = config;
  const absComponentDir = path.resolve(cwd, componentDir);
  const absCssDir = path.resolve(cwd, cssDir);

  // Load registry index
  let registryIndex: RegistryIndex;
  if (registryPath) {
    registryIndex = await loadRegistryIndexFrom(registryPath);
  } else {
    registryIndex = await loadRegistryIndex();
  }

  // Install base.css if not already present
  const baseCssPath = path.join(absCssDir, "base.css");
  if (!(await fs.pathExists(baseCssPath))) {
    for (const baseCssFile of registryIndex.base.css) {
      const srcPath = registryPath
        ? path.join(registryPath, baseCssFile)
        : getRegistryFilePath(baseCssFile);
      await copyFile(srcPath, path.join(absCssDir, path.basename(baseCssFile)));
    }
    if (!nonInteractive) {
      console.log(pc.green("done") + " Installed " + pc.bold("base.css"));
    }
  }

  // Collect all components to install (including dependencies)
  const toInstall = new Set<string>();
  for (const name of components) {
    const found = registryIndex.components.find((c) => c.name === name);
    if (!found) {
      const available = registryIndex.components.map((c) => c.name);
      throw new Error(
        `Component "${name}" not found. Available: ${available.join(", ")}`
      );
    }
    toInstall.add(name);
    for (const dep of found.dependencies) {
      toInstall.add(dep);
    }
  }

  const installed: string[] = [];

  for (const componentName of toInstall) {
    let detail: ComponentDetail;
    if (registryPath) {
      detail = await loadComponentDetailFrom(registryPath, componentName);
    } else {
      detail = await loadComponentDetail(componentName);
    }

    // Determine which files to copy
    const langKey = typescript ? "ts" : "js";
    const frameworkFiles = detail.files[framework];
    const filesToCopy = frameworkFiles[langKey];

    if (filesToCopy.length === 0) {
      if (!nonInteractive) {
        console.log(
          pc.yellow("!") +
            ` No ${framework}/${langKey} files for ${componentName}. Skipping.`
        );
      }
      continue;
    }

    // Determine destination filename
    const pascalName =
      componentName.charAt(0).toUpperCase() + componentName.slice(1);
    let destExt: string;
    if (framework === "react") {
      destExt = typescript ? ".tsx" : ".jsx";
    } else if (framework === "svelte") {
      destExt = typescript ? ".svelte" : ".js.svelte";
    } else {
      destExt = typescript ? ".vue" : ".js.vue";
    }
    const destFilename = `${pascalName}${destExt}`;
    const destPath = path.join(absComponentDir, destFilename);

    // Check if already installed
    if ((await fs.pathExists(destPath)) && !overwrite) {
      if (!nonInteractive) {
        console.log(
          pc.yellow("!") +
            ` ${destFilename} already exists. Use --overwrite to replace.`
        );
      }
      // Still track as installed for barrel file
      installed.push(componentName);
      continue;
    }

    // Copy component file(s)
    for (const relFile of filesToCopy) {
      const srcPath = registryPath
        ? path.join(registryPath, relFile)
        : getRegistryFilePath(relFile);
      await copyFile(srcPath, destPath);
    }

    // Copy CSS files
    for (const cssFile of detail.css) {
      const srcCssPath = registryPath
        ? path.join(registryPath, cssFile)
        : getRegistryFilePath(cssFile);

      // For React, rename to .module.css
      let destCssFilename = path.basename(cssFile);
      if (framework === "react") {
        destCssFilename = destCssFilename.replace(".css", ".module.css");
      }

      const destCssPath = path.join(absCssDir, destCssFilename);
      if (!(await fs.pathExists(destCssPath)) || overwrite) {
        await copyFile(srcCssPath, destCssPath);
      }
    }

    installed.push(componentName);
    if (!nonInteractive) {
      console.log(pc.green("done") + " Installed " + pc.bold(destFilename));
    }
  }

  // Update barrel file
  if (installed.length > 0) {
    // Read existing barrel to find already-installed components
    const barrelExt = typescript ? "ts" : "js";
    const barrelPath = path.join(absComponentDir, `index.${barrelExt}`);
    const existingComponents = new Set<string>();

    if (await fs.pathExists(barrelPath)) {
      const content = await fs.readFile(barrelPath, "utf-8");
      const exportRegex = /export\s+\{[^}]+\}\s+from\s+"\.\/(\w+)"/g;
      let match;
      while ((match = exportRegex.exec(content)) !== null) {
        existingComponents.add(match[1].toLowerCase());
      }
    }

    for (const name of installed) {
      existingComponents.add(name);
    }

    await updateBarrelFile(
      absComponentDir,
      Array.from(existingComponents),
      typescript
    );
  }
}

export const addCommand = new Command("add")
  .description("Add components to your project")
  .argument("<components...>", "Component names to add")
  .option("--overwrite", "Overwrite existing files", false)
  .option("--typescript", "Use TypeScript")
  .option("--no-typescript", "Use JavaScript")
  .action(async (components: string[], opts) => {
    try {
      await runAdd({
        cwd: process.cwd(),
        components,
        overwrite: opts.overwrite,
      });
    } catch (err) {
      console.error(pc.red("Error:"), (err as Error).message);
      process.exit(1);
    }
  });
