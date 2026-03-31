import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REGISTRY_DIR = path.resolve(__dirname, "../registry");

interface CssMapping {
  component: string;
  cssFile: string;
}

async function getCssMappings(): Promise<CssMapping[]> {
  const componentsDir = path.join(REGISTRY_DIR, "components");
  if (!(await fs.pathExists(componentsDir))) {
    console.log("No components directory found. Skipping CSS injection.");
    return [];
  }

  const files = await fs.readdir(componentsDir);
  const mappings: CssMapping[] = [];

  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const meta = await fs.readJson(path.join(componentsDir, file));
    if (meta.css && meta.css.length > 0) {
      mappings.push({
        component: meta.name,
        cssFile: meta.css[0], // Primary CSS file
      });
    }
  }

  return mappings;
}

function injectStyleBlock(
  content: string,
  css: string,
  framework: "svelte" | "vue"
): string {
  const styleTag =
    framework === "vue" ? "<style scoped>" : "<style>";
  const styleEndTag = "</style>";

  // Pattern: find <style> or <style scoped> block with injection comment
  const styleRegex =
    framework === "vue"
      ? /<style scoped>[\s\S]*?<\/style>/
      : /<style>[\s\S]*?<\/style>/;

  const newStyleBlock = `${styleTag}\n${css}\n${styleEndTag}`;

  if (styleRegex.test(content)) {
    return content.replace(styleRegex, newStyleBlock);
  }

  // If no style block exists, append one
  return content.trimEnd() + "\n\n" + newStyleBlock + "\n";
}

async function injectCssForFramework(
  framework: "svelte" | "vue",
  mappings: CssMapping[]
): Promise<void> {
  const frameworkDir = path.join(REGISTRY_DIR, framework);
  if (!(await fs.pathExists(frameworkDir))) {
    console.log(`No ${framework} directory found. Skipping.`);
    return;
  }

  for (const mapping of mappings) {
    const cssPath = path.join(REGISTRY_DIR, mapping.cssFile);
    if (!(await fs.pathExists(cssPath))) {
      console.warn(`CSS file not found: ${cssPath}`);
      continue;
    }

    const css = (await fs.readFile(cssPath, "utf-8")).trim();
    const componentDir = path.join(frameworkDir, mapping.component);

    if (!(await fs.pathExists(componentDir))) {
      continue;
    }

    const files = await fs.readdir(componentDir);
    for (const file of files) {
      const filePath = path.join(componentDir, file);
      const ext = path.extname(file);

      // Only process .svelte and .vue files
      if (
        (framework === "svelte" && ext !== ".svelte") ||
        (framework === "vue" && ext !== ".vue")
      ) {
        continue;
      }

      const content = await fs.readFile(filePath, "utf-8");
      const injected = injectStyleBlock(content, css, framework);

      if (injected !== content) {
        await fs.writeFile(filePath, injected, "utf-8");
        console.log(`  Injected CSS into ${framework}/${mapping.component}/${file}`);
      }
    }
  }
}

async function main(): Promise<void> {
  console.log("Injecting CSS into Svelte and Vue components...\n");

  const mappings = await getCssMappings();
  if (mappings.length === 0) {
    console.log("No CSS mappings found.");
    return;
  }

  console.log(`Found ${mappings.length} component(s) with CSS.\n`);

  await injectCssForFramework("svelte", mappings);
  await injectCssForFramework("vue", mappings);

  console.log("\nCSS injection complete.");
}

main().catch((err) => {
  console.error("CSS injection failed:", err);
  process.exit(1);
});
