import { Command } from "commander";
import fs from "fs-extra";
import path from "path";
import pc from "picocolors";
import { loadConfig } from "../utils/file-writer.js";
import {
  loadRegistryIndex,
  type RegistryIndex,
} from "../utils/registry.js";

export interface ListOptions {
  cwd: string;
  registryPath?: string;
}

export interface ComponentStatus {
  name: string;
  displayName: string;
  description: string;
  installed: boolean;
}

async function loadRegistryIndexFrom(
  registryPath: string
): Promise<RegistryIndex> {
  const indexPath = path.join(registryPath, "index.json");
  return fs.readJson(indexPath);
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

export async function runList(options: ListOptions): Promise<ComponentStatus[]> {
  const { cwd, registryPath } = options;

  // Load registry
  let registryIndex: RegistryIndex;
  if (registryPath) {
    registryIndex = await loadRegistryIndexFrom(registryPath);
  } else {
    registryIndex = await loadRegistryIndex();
  }

  // Load config (optional for list)
  const config = await loadConfig(cwd);

  const results: ComponentStatus[] = [];

  for (const component of registryIndex.components) {
    let installed = false;

    if (config) {
      const absComponentDir = path.resolve(cwd, config.componentDir);
      const filename = getExpectedFilename(
        component.name,
        config.framework,
        config.typescript
      );
      installed = await fs.pathExists(
        path.join(absComponentDir, filename)
      );
    }

    results.push({
      name: component.name,
      displayName: component.displayName,
      description: component.description,
      installed,
    });
  }

  return results;
}

export const listCommand = new Command("list")
  .description("List available components and their install status")
  .action(async () => {
    try {
      const results = await runList({ cwd: process.cwd() });

      console.log(pc.bold("\nAvailable components:\n"));

      for (const comp of results) {
        const status = comp.installed
          ? pc.green("installed")
          : pc.dim("not installed");
        console.log(
          `  ${pc.bold(comp.displayName.padEnd(16))} ${status}  ${pc.dim(comp.description)}`
        );
      }

      console.log();

      const installedCount = results.filter((c) => c.installed).length;
      console.log(
        pc.dim(
          `${installedCount}/${results.length} components installed`
        )
      );
      console.log();
    } catch (err) {
      console.error(pc.red("Error:"), (err as Error).message);
      process.exit(1);
    }
  });
