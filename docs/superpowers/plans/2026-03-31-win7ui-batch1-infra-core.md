# win7ui Batch 1: Infrastructure + Core Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** win7ui 모노레포 인프라를 구축하고, CLI 핵심 명령어(init/add/list/remove)를 구현하며, 5개 기초 컴포넌트(button, textbox, checkbox, radiobutton, groupbox)를 React/Svelte/Vue x TS/JS 전체 변형으로 작성한다.

**Architecture:** pnpm workspace + Turborepo 기반 모노레포. CLI 패키지(`packages/cli`)는 Commander.js + @clack/prompts로 구성하며 tsup으로 번들링. `registry/` 디렉토리에 CSS 단일 소스와 프레임워크별 컴포넌트 소스를 관리. `scripts/inject-css.ts`가 CSS를 Svelte/Vue의 `<style>` 블록에 자동 주입하고, `scripts/build-registry.ts`가 레지스트리 JSON을 자동 생성한다.

**Tech Stack:** pnpm, Turborepo, TypeScript, Commander.js, @clack/prompts, fs-extra, picocolors, diff, tsup, Vitest

---

## Task 1: 모노레포 Scaffolding

> pnpm workspace, Turborepo, root package.json, .gitignore 설정

### 1.1 root package.json 생성

- [ ] 파일: `package.json` (프로젝트 루트)

```json
{
  "name": "win7ui-monorepo",
  "version": "0.0.0",
  "private": true,
  "description": "Windows 7 UI component library - shadcn/ui style",
  "packageManager": "pnpm@9.15.4",
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "dev": "turbo run dev",
    "inject-css": "tsx scripts/inject-css.ts",
    "build-registry": "tsx scripts/build-registry.ts",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^2.4.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0",
    "vitest": "^3.0.0"
  }
}
```

### 1.2 pnpm-workspace.yaml 생성

- [ ] 파일: `pnpm-workspace.yaml`

```yaml
packages:
  - "packages/*"
```

### 1.3 turbo.json 생성

- [ ] 파일: `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "cache": false
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    }
  }
}
```

### 1.4 .gitignore 업데이트

- [ ] 파일: `.gitignore`

```gitignore
# Dependencies
node_modules/

# Build outputs
dist/
*.tsbuildinfo

# Turbo
.turbo/

# OS
.DS_Store

# IDE
.vscode/
.idea/

# Environment
.env
.env.local

# Test coverage
coverage/

# Temporary
*.bak
tmp/
```

### 1.5 tsconfig.json (루트)

- [ ] 파일: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "exclude": ["node_modules", "dist"]
}
```

### 실행 및 검증

```bash
cd win7ui
pnpm install
pnpm turbo --version
```

**예상 출력:**
```
Packages: +N
.....
turbo 2.x.x
```

---

## Task 2: CLI 패키지 셋업

> packages/cli 디렉토리에 CLI 패키지 기본 구조 생성

### 2.1 CLI package.json

- [ ] 파일: `packages/cli/package.json`

```json
{
  "name": "win7ui",
  "version": "0.1.0",
  "description": "Windows 7 UI component library - add components to your project",
  "type": "module",
  "bin": {
    "win7ui": "./dist/index.js"
  },
  "files": [
    "dist",
    "registry"
  ],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "commander": "^13.1.0",
    "@clack/prompts": "^0.9.1",
    "fs-extra": "^11.3.0",
    "picocolors": "^1.1.0",
    "diff": "^7.0.0",
    "semver": "^7.7.0"
  },
  "devDependencies": {
    "@types/fs-extra": "^11.0.4",
    "@types/diff": "^6.0.0",
    "@types/node": "^22.12.0",
    "@types/semver": "^7.5.8",
    "tsup": "^8.4.0",
    "typescript": "^5.7.0",
    "vitest": "^3.0.0"
  },
  "keywords": ["windows-7", "ui", "components", "react", "svelte", "vue", "css"],
  "license": "MIT"
}
```

### 2.2 CLI tsconfig.json

- [ ] 파일: `packages/cli/tsconfig.json`

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### 2.3 CLI tsup.config.ts

- [ ] 파일: `packages/cli/tsup.config.ts`

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node18",
  clean: true,
  dts: true,
  splitting: false,
  sourcemap: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
});
```

### 2.4 CLI 엔트리 포인트 (스텁)

- [ ] 파일: `packages/cli/src/index.ts`

```ts
import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { addCommand } from "./commands/add.js";
import { listCommand } from "./commands/list.js";
import { removeCommand } from "./commands/remove.js";

const program = new Command();

program
  .name("win7ui")
  .description("Add Windows 7 UI components to your project")
  .version("0.1.0");

program.addCommand(initCommand);
program.addCommand(addCommand);
program.addCommand(listCommand);
program.addCommand(removeCommand);

program.parse();
```

### 2.5 유틸리티 모듈 스텁

- [ ] 파일: `packages/cli/src/utils/detect-framework.ts`

```ts
import fs from "fs-extra";
import path from "path";

export type Framework = "react" | "svelte" | "vue";

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export async function detectFramework(cwd: string): Promise<Framework | null> {
  const pkgPath = path.join(cwd, "package.json");
  if (!(await fs.pathExists(pkgPath))) {
    return null;
  }

  const pkg: PackageJson = await fs.readJson(pkgPath);
  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  const frameworks: { name: Framework; packages: string[] }[] = [
    { name: "react", packages: ["react", "react-dom", "next"] },
    { name: "svelte", packages: ["svelte", "@sveltejs/kit"] },
    { name: "vue", packages: ["vue", "nuxt"] },
  ];

  const detected: Framework[] = [];
  for (const fw of frameworks) {
    if (fw.packages.some((pkg) => pkg in allDeps)) {
      detected.push(fw.name);
    }
  }

  if (detected.length === 1) {
    return detected[0];
  }

  return null;
}
```

- [ ] 파일: `packages/cli/src/utils/registry.ts`

```ts
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ComponentMeta {
  name: string;
  displayName: string;
  description: string;
  dependencies: string[];
}

export interface RegistryIndex {
  registryVersion: string;
  minCliVersion: string;
  maxCliVersion: string;
  base: {
    css: string[];
  };
  components: ComponentMeta[];
}

export interface ComponentDetail {
  name: string;
  displayName: string;
  description: string;
  dependencies: string[];
  css: string[];
  files: {
    react: { ts: string[]; js: string[] };
    svelte: { ts: string[]; js: string[] };
    vue: { ts: string[]; js: string[] };
  };
}

function getRegistryPath(): string {
  // In development: ../../registry (relative to src/utils/)
  // In production (bundled): ../registry (relative to dist/)
  const devPath = path.resolve(__dirname, "../../../../registry");
  const prodPath = path.resolve(__dirname, "../registry");

  if (fs.existsSync(devPath)) {
    return devPath;
  }
  return prodPath;
}

export async function loadRegistryIndex(): Promise<RegistryIndex> {
  const registryPath = getRegistryPath();
  const indexPath = path.join(registryPath, "index.json");

  if (!(await fs.pathExists(indexPath))) {
    throw new Error(`Registry index not found at ${indexPath}`);
  }

  return fs.readJson(indexPath);
}

export async function loadComponentDetail(
  componentName: string
): Promise<ComponentDetail> {
  const registryPath = getRegistryPath();
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

export function getRegistryFilePath(relativePath: string): string {
  const registryPath = getRegistryPath();
  return path.join(registryPath, relativePath);
}
```

- [ ] 파일: `packages/cli/src/utils/file-writer.ts`

```ts
import fs from "fs-extra";
import path from "path";
import type { Framework } from "./detect-framework.js";

export interface WriteConfig {
  framework: Framework;
  typescript: boolean;
  componentDir: string;
  cssDir: string;
}

export interface Win7uiConfig {
  framework: Framework;
  typescript: boolean;
  componentDir: string;
  cssDir: string;
}

const CONFIG_FILENAME = "win7ui.config.json";

export async function loadConfig(cwd: string): Promise<Win7uiConfig | null> {
  const configPath = path.join(cwd, CONFIG_FILENAME);
  if (!(await fs.pathExists(configPath))) {
    return null;
  }
  return fs.readJson(configPath);
}

export async function saveConfig(
  cwd: string,
  config: Win7uiConfig
): Promise<void> {
  const configPath = path.join(cwd, CONFIG_FILENAME);
  await fs.writeJson(configPath, config, { spaces: 2 });
}

export async function copyComponentFile(
  srcPath: string,
  destDir: string,
  destFilename: string
): Promise<void> {
  await fs.ensureDir(destDir);
  const destPath = path.join(destDir, destFilename);
  await fs.copy(srcPath, destPath);
}

export async function copyFile(
  srcPath: string,
  destPath: string
): Promise<void> {
  await fs.ensureDir(path.dirname(destPath));
  await fs.copy(srcPath, destPath);
}

export async function removeFile(filePath: string): Promise<boolean> {
  if (await fs.pathExists(filePath)) {
    await fs.remove(filePath);
    return true;
  }
  return false;
}

export async function updateBarrelFile(
  componentDir: string,
  installedComponents: string[],
  typescript: boolean
): Promise<void> {
  const ext = typescript ? "ts" : "js";
  const barrelPath = path.join(componentDir, `index.${ext}`);

  const lines = installedComponents
    .sort()
    .map((name) => {
      const pascalName = name.charAt(0).toUpperCase() + name.slice(1);
      const fileName = pascalName;
      return `export { ${pascalName} } from "./${fileName}";`;
    });

  const content = lines.join("\n") + "\n";
  await fs.writeFile(barrelPath, content, "utf-8");
}
```

- [ ] 파일: `packages/cli/src/utils/version-check.ts`

```ts
import semver from "semver";
import type { RegistryIndex } from "./registry.js";

export interface VersionCheckResult {
  compatible: boolean;
  message?: string;
}

export function checkCliRegistryCompatibility(
  cliVersion: string,
  registry: RegistryIndex
): VersionCheckResult {
  const { minCliVersion, maxCliVersion } = registry;

  if (semver.lt(cliVersion, minCliVersion)) {
    return {
      compatible: false,
      message: `CLI version ${cliVersion} is too old for this registry (requires >= ${minCliVersion}). Please update: npm install -g win7ui@latest`,
    };
  }

  if (!semver.satisfies(cliVersion, maxCliVersion)) {
    return {
      compatible: false,
      message: `CLI version ${cliVersion} may not be compatible with this registry (supports up to ${maxCliVersion}). Consider updating: npm install -g win7ui@latest`,
    };
  }

  return { compatible: true };
}
```

### 실행 및 검증

```bash
cd win7ui
pnpm install
pnpm --filter win7ui build
```

**예상 출력:**
```
CLI DTS ✓
CLI CJS ✓  (or ESM ✓)
```

---

## Task 3: Registry 구조 + base.css

> registry/ 디렉토리 구조 생성 및 base.css 배치

### 3.1 base.css

- [ ] 파일: `registry/css/base.css`

```css
a{color:#06c;text-decoration:none}a:focus-visible{outline:1px dotted #06c}a:focus,a:hover{color:#39f;text-decoration:underline}.instruction{color:#000;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;font-weight:400;margin:0 0 20px}.instruction-primary{color:#039;font-size:12pt}.header{font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;font-weight:400}.header-document{color:#000;font-family:Calibri,Noto Sans,sans-serif;font-size:17pt}.header-group{color:#039;font-size:11pt}
```

### 3.2 button.css

- [ ] 파일: `registry/css/button.css`

```css
[role=button],button{background:linear-gradient(#f2f2f2 45%,#ebebeb 0,#cfcfcf);border:1px solid #8e8f8f;border-radius:3px;box-shadow:inset 0 0 0 1px #fffc;box-sizing:border-box;color:#222;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;min-height:23px;min-width:75px;padding:0 12px;position:relative;text-align:center;z-index:0}input[type=file]::file-selector-button{background:linear-gradient(#f2f2f2 45%,#ebebeb 0,#cfcfcf);border:1px solid #8e8f8f;border-radius:3px;box-shadow:inset 0 0 0 1px #fffc;box-sizing:border-box;color:#222;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;min-height:23px;min-width:75px;padding:0 12px;position:relative;text-align:center;z-index:0}[role=button]:before,button:before{background:linear-gradient(#eaf6fd 45%,#bee6fd 0,#a7d9f5);border-radius:3px;box-shadow:inset 0 0 0 1px #fffc;content:"";height:100%;left:0;margin:0;opacity:0;padding:0;position:absolute;top:0;transition:opacity .3s;width:100%;z-index:-1}[role=button]:after,button:after{background:linear-gradient(#e5f4fc,#c4e5f6 30% 50%,#98d1ef 50%,#68b3db);border-radius:2px;box-shadow:inset 1px 1px 0 #0003,inset -1px 1px 0 #0001;content:"";height:100%;left:0;margin:0;opacity:0;padding:0;position:absolute;top:0;transition:opacity .3s;width:100%;z-index:-1}[role=button]:disabled,button:disabled{background:#f4f4f4;border-color:#adb2b5;color:#838383}[role=button]:not(:disabled):hover,button:not(:disabled):hover{border-color:#3c7fb1;transition:border-color .3s}[role=button]:not(:disabled):hover:before,button:not(:disabled):hover:before{opacity:1;transition:opacity .3s}[role=button]:not(:disabled):not(:hover),button:not(:disabled):not(:hover){border-color:#8e8f8f;transition:border-color 1s linear}[role=button]:not(:disabled):not(:hover):before,button:not(:disabled):not(:hover):before{opacity:0;transition:opacity 1s linear}[role=button]:not(:disabled).active,[role=button]:not(:disabled):active,button:not(:disabled).active,button:not(:disabled):active{border-color:#6d91ab;transition:border-color .3s}[role=button]:not(:disabled).active:after,[role=button]:not(:disabled):active:after,button:not(:disabled).active:after,button:not(:disabled):active:after{opacity:1;transition:opacity .3s}[role=button].focused,[role=button]:focus-visible,button.focused,button:focus-visible{box-shadow:inset 0 0 0 2px #98d1ef;outline:1px dotted #000;outline-offset:-4px}[role=button].default,[role=button].focused,[role=button]:focus,button.default,button.focused,button:focus{-webkit-animation:pulse-anim 1s ease infinite alternate;animation:pulse-anim 1s ease infinite alternate;background-image:linear-gradient(#eaf6fd 45%,#bee6fd 0,#a7d9f5);border-color:#5586a3}label[role=button]{align-items:center;display:inline-flex}label[role=button]>input[type=file]{display:none}@-webkit-keyframes pulse-anim{0%{box-shadow:inset 0 0 3px 1px #34deffdd}to{box-shadow:inset 0 0 1px 1px #34deffdd}}@keyframes pulse-anim{0%{box-shadow:inset 0 0 3px 1px #34deffdd}to{box-shadow:inset 0 0 1px 1px #34deffdd}}
```

### 3.3 textbox.css

- [ ] 파일: `registry/css/textbox.css`

```css
input[type=email],input[type=number],input[type=password],input[type=text],input[type=url]{height:23px}input[type=email],input[type=number],input[type=password],input[type=text],input[type=url],textarea{background-color:#fff;border-color:#abadb3 #dbdfe6 #e3e9ef #e2e3ea;border-radius:2px;border-style:solid;border-width:1px;box-sizing:border-box;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;padding:3px 4px 5px;transition:border-color .5s}input[type=email]:hover,input[type=number]:hover,input[type=password]:hover,input[type=text]:hover,input[type=url]:hover,textarea:hover{border-color:#5794bf #b7d5ea #c7e2f1 #c5daed;transition:border-color .3s}input[type=email]:focus,input[type=number]:focus,input[type=password]:focus,input[type=text]:focus,input[type=url]:focus,textarea:focus{border-color:#3d7bad #a4c9e3 #b7d9ed #b5cfe7;outline:none}input[type=email]:disabled,input[type=number]:disabled,input[type=password]:disabled,input[type=text]:disabled,input[type=url]:disabled,textarea:disabled{background:#f0f0f0;border-color:#afafaf;box-shadow:inset 0 0 0 1px #fff}
```

### 3.4 checkbox.css

- [ ] 파일: `registry/css/checkbox.css`

```css
input[type=checkbox]{appearance:none;-webkit-appearance:none;-moz-appearance:none;background:none;border:none;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;margin:0;opacity:0}input[type=checkbox]+label{align-items:center;display:inline-flex;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;position:relative}input[type=checkbox]+label:before{background:#f6f6f6;border:1px solid #8e8f8f;box-shadow:inset 0 0 0 1px #f4f4f4,inset 1px 1px 0 1px #aeaeae,inset -1px -1px 0 1px #ddd,inset 3px 3px 6px #ccc;box-sizing:border-box;content:"";display:inline-block;height:14px;margin-right:6px;transition:.4s;width:14px}input[type=checkbox]+label:hover:before{background:#e9f7fe;border-color:#3c7fb1;box-shadow:inset 0 0 0 1px #def9fa,inset 1px 1px 0 1px #79c6f9,inset -1px -1px 0 1px #c6e9fc,inset 3px 3px 6px #b1dffd}input[type=checkbox]:focus-visible+label{outline:1px dotted #000}input[type=checkbox]:checked+label:after{color:#4a5f97;content:"\2714";display:block;font-weight:700;left:2px;position:absolute;top:0}input[type=checkbox]:disabled+label{color:#6d6d6d}input[type=checkbox]:disabled+label:before{background:linear-gradient(to bottom right,#f0f0f0,#fbfbfb);border:1px solid #b1b1b1;box-shadow:none;content:"";display:inline-block;height:14px;margin-right:6px;width:14px}input[type=checkbox]:disabled+label:after{color:#bfbfbf}
```

### 3.5 radiobutton.css

- [ ] 파일: `registry/css/radiobutton.css`

```css
input[type=radio]{appearance:none;-webkit-appearance:none;-moz-appearance:none;background:0;border:none;margin:0;opacity:0;position:fixed}input[type=radio]+label{align-items:center;display:inline-flex;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;margin-left:20px;position:relative}input[type=radio]+label:before{background:#f6f6f6;border:1px solid #8e8f8f;border-radius:50%;box-shadow:inset 0 0 0 1.5px #f4f4f4,inset 1px 1px 0 1.5px #aeaeae,inset -1px 0 0 1.5px #ddd,inset 3px 3px 6px #ccc;box-sizing:border-box;content:"";display:inline-block;height:14px;left:-20px;margin-right:6px;position:absolute;top:0;transition:.4s;width:14px}input[type=radio]+label:hover:before{border-color:#3c7fb1;box-shadow:inset 0 0 0 1.5px #def9fa,inset 1px 1px 0 1.5px #79c6f9,inset -1px -1px 0 1.5px #c6e9fc,inset 3px 3px 6px #b1dffd}input[type=radio]:checked+label:after{background:#7cd3eb;border:1.5px solid #27506d;border-radius:50%;box-shadow:inset -1px -1px 0 .5px #16638f,inset -1px -1px 0 1px #1985c0;box-sizing:border-box;content:"";display:block;height:8px;left:-17px;position:absolute;top:3px;width:8px}input[type=radio]:focus-visible+label{outline:1px dotted #000}input[type=radio]:disabled+label{filter:grayscale(1);opacity:.6}input[type=radio]:disabled:not(:checked)+label:before{opacity:.5}
```

### 3.6 groupbox.css

- [ ] 파일: `registry/css/groupbox.css`

```css
fieldset{border:1px solid #cdd7db;border-radius:3px;box-shadow:inset 0 0 0 1px #fff;margin:0;padding:8px 10px 10px}fieldset legend{font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif}.group,fieldset{display:flex;flex-direction:column;gap:6px}.group+.group{margin-top:6px}
```

### 3.7 디렉토리 구조 확인

```bash
find registry/ -type f | sort
```

**예상 출력:**
```
registry/css/base.css
registry/css/button.css
registry/css/checkbox.css
registry/css/groupbox.css
registry/css/radiobutton.css
registry/css/textbox.css
```

---

## Task 4: CSS Inject 스크립트

> Svelte/Vue 컴포넌트의 `<style>` 블록에 CSS를 자동 주입하는 스크립트

- [ ] 파일: `scripts/inject-css.ts`

```ts
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
```

### 실행 및 검증

```bash
cd win7ui
pnpm inject-css
```

**예상 출력:**
```
Injecting CSS into Svelte and Vue components...

Found 5 component(s) with CSS.

  Injected CSS into svelte/button/Button.svelte
  Injected CSS into svelte/button/Button.js.svelte
  ...
  Injected CSS into vue/button/Button.vue
  Injected CSS into vue/button/Button.js.vue
  ...

CSS injection complete.
```

---

## Task 5: Registry 빌드 스크립트

> 디렉토리 스캔을 통해 index.json과 컴포넌트별 JSON을 자동 생성하는 스크립트

- [ ] 파일: `scripts/build-registry.ts`

```ts
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REGISTRY_DIR = path.resolve(__dirname, "../registry");

interface ComponentConfig {
  name: string;
  displayName: string;
  description: string;
  dependencies: string[];
}

const COMPONENT_CONFIGS: ComponentConfig[] = [
  {
    name: "button",
    displayName: "Button",
    description: "Windows 7 스타일 푸시 버튼",
    dependencies: [],
  },
  {
    name: "textbox",
    displayName: "TextBox",
    description: "Windows 7 스타일 텍스트 입력 필드",
    dependencies: [],
  },
  {
    name: "checkbox",
    displayName: "Checkbox",
    description: "Windows 7 스타일 체크박스",
    dependencies: [],
  },
  {
    name: "radiobutton",
    displayName: "RadioButton",
    description: "Windows 7 스타일 라디오 버튼",
    dependencies: [],
  },
  {
    name: "groupbox",
    displayName: "GroupBox",
    description: "Windows 7 스타일 그룹 박스 (fieldset)",
    dependencies: [],
  },
];

interface FrameworkFiles {
  ts: string[];
  js: string[];
}

async function discoverFrameworkFiles(
  framework: string,
  componentName: string
): Promise<FrameworkFiles> {
  const dir = path.join(REGISTRY_DIR, framework, componentName);
  const result: FrameworkFiles = { ts: [], js: [] };

  if (!(await fs.pathExists(dir))) {
    return result;
  }

  const files = await fs.readdir(dir);

  for (const file of files) {
    const relativePath = `${framework}/${componentName}/${file}`;

    if (framework === "react") {
      if (file.endsWith(".tsx")) {
        result.ts.push(relativePath);
      } else if (file.endsWith(".jsx")) {
        result.js.push(relativePath);
      }
    } else if (framework === "svelte") {
      // Button.svelte = TS, Button.js.svelte = JS
      if (file.endsWith(".js.svelte")) {
        result.js.push(relativePath);
      } else if (file.endsWith(".svelte")) {
        result.ts.push(relativePath);
      }
    } else if (framework === "vue") {
      // Button.vue = TS, Button.js.vue = JS
      if (file.endsWith(".js.vue")) {
        result.js.push(relativePath);
      } else if (file.endsWith(".vue")) {
        result.ts.push(relativePath);
      }
    }
  }

  return result;
}

async function buildComponentJson(config: ComponentConfig): Promise<void> {
  const cssFile = `css/${config.name}.css`;
  const cssPath = path.join(REGISTRY_DIR, cssFile);
  const hasCss = await fs.pathExists(cssPath);

  const react = await discoverFrameworkFiles("react", config.name);
  const svelte = await discoverFrameworkFiles("svelte", config.name);
  const vue = await discoverFrameworkFiles("vue", config.name);

  const componentJson = {
    name: config.name,
    displayName: config.displayName,
    description: config.description,
    dependencies: config.dependencies,
    css: hasCss ? [cssFile] : [],
    files: {
      react,
      svelte,
      vue,
    },
  };

  const outputPath = path.join(
    REGISTRY_DIR,
    "components",
    `${config.name}.json`
  );
  await fs.ensureDir(path.dirname(outputPath));
  await fs.writeJson(outputPath, componentJson, { spaces: 2 });
  console.log(`  Built: components/${config.name}.json`);
}

async function buildIndexJson(): Promise<void> {
  const components = COMPONENT_CONFIGS.map((config) => ({
    name: config.name,
    displayName: config.displayName,
    description: config.description,
    dependencies: config.dependencies,
  }));

  const indexJson = {
    registryVersion: "1.0.0",
    minCliVersion: "0.1.0",
    maxCliVersion: "0.x.x",
    base: {
      css: ["css/base.css"],
    },
    components,
  };

  const outputPath = path.join(REGISTRY_DIR, "index.json");
  await fs.writeJson(outputPath, indexJson, { spaces: 2 });
  console.log(`  Built: index.json`);
}

async function main(): Promise<void> {
  console.log("Building registry...\n");

  // Build component JSONs
  for (const config of COMPONENT_CONFIGS) {
    await buildComponentJson(config);
  }

  // Build index.json
  await buildIndexJson();

  console.log("\nRegistry build complete.");
}

main().catch((err) => {
  console.error("Registry build failed:", err);
  process.exit(1);
});
```

### 실행 및 검증

```bash
cd win7ui
pnpm build-registry
```

**예상 출력:**
```
Building registry...

  Built: components/button.json
  Built: components/textbox.json
  Built: components/checkbox.json
  Built: components/radiobutton.json
  Built: components/groupbox.json
  Built: index.json

Registry build complete.
```

---

## Task 6: CLI init 명령어 (TDD)

### 6.1 테스트 작성

- [ ] 파일: `packages/cli/src/commands/__tests__/init.test.ts`

```ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import os from "os";

describe("init command", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "win7ui-test-init-"));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it("should create win7ui.config.json with detected framework", async () => {
    // Setup: Create a package.json with react dependency
    await fs.writeJson(path.join(tmpDir, "package.json"), {
      dependencies: { react: "^18.0.0", "react-dom": "^18.0.0" },
    });

    const { runInit } = await import("../init.js");
    await runInit({
      cwd: tmpDir,
      framework: undefined,
      typescript: true,
      componentDir: undefined,
      cssDir: undefined,
      nonInteractive: true,
    });

    const configPath = path.join(tmpDir, "win7ui.config.json");
    expect(await fs.pathExists(configPath)).toBe(true);

    const config = await fs.readJson(configPath);
    expect(config.framework).toBe("react");
    expect(config.typescript).toBe(true);
    expect(config.componentDir).toBe("src/components/win7ui");
    expect(config.cssDir).toBe("src/components/win7ui/css");
  });

  it("should use explicitly provided framework over auto-detect", async () => {
    await fs.writeJson(path.join(tmpDir, "package.json"), {
      dependencies: { react: "^18.0.0" },
    });

    const { runInit } = await import("../init.js");
    await runInit({
      cwd: tmpDir,
      framework: "svelte",
      typescript: false,
      componentDir: undefined,
      cssDir: undefined,
      nonInteractive: true,
    });

    const config = await fs.readJson(path.join(tmpDir, "win7ui.config.json"));
    expect(config.framework).toBe("svelte");
    expect(config.typescript).toBe(false);
  });

  it("should use custom componentDir and cssDir", async () => {
    await fs.writeJson(path.join(tmpDir, "package.json"), {
      dependencies: { vue: "^3.0.0" },
    });

    const { runInit } = await import("../init.js");
    await runInit({
      cwd: tmpDir,
      framework: undefined,
      typescript: true,
      componentDir: "lib/ui",
      cssDir: "lib/ui/styles",
      nonInteractive: true,
    });

    const config = await fs.readJson(path.join(tmpDir, "win7ui.config.json"));
    expect(config.framework).toBe("vue");
    expect(config.componentDir).toBe("lib/ui");
    expect(config.cssDir).toBe("lib/ui/styles");
  });

  it("should fail gracefully when no framework detected and none provided", async () => {
    // No package.json at all
    const { runInit } = await import("../init.js");

    await expect(
      runInit({
        cwd: tmpDir,
        framework: undefined,
        typescript: true,
        componentDir: undefined,
        cssDir: undefined,
        nonInteractive: true,
      })
    ).rejects.toThrow("Could not detect framework");
  });
});
```

### 6.2 init 명령어 구현

- [ ] 파일: `packages/cli/src/commands/init.ts`

```ts
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
```

### 6.3 테스트 실행

```bash
cd win7ui
pnpm --filter win7ui test -- --reporter=verbose src/commands/__tests__/init.test.ts
```

**예상 출력:**
```
 ✓ init command > should create win7ui.config.json with detected framework
 ✓ init command > should use explicitly provided framework over auto-detect
 ✓ init command > should use custom componentDir and cssDir
 ✓ init command > should fail gracefully when no framework detected and none provided

 4 passed
```

---

## Task 7: CLI add 명령어 (TDD)

### 7.1 테스트 작성

- [ ] 파일: `packages/cli/src/commands/__tests__/add.test.ts`

```ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import os from "os";

describe("add command", () => {
  let tmpDir: string;
  let registryDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "win7ui-test-add-"));

    // Create win7ui.config.json
    await fs.writeJson(path.join(tmpDir, "win7ui.config.json"), {
      framework: "react",
      typescript: true,
      componentDir: "src/components/win7ui",
      cssDir: "src/components/win7ui/css",
    });

    // Setup a mock registry
    registryDir = path.join(tmpDir, "__registry__");

    // base.css
    await fs.ensureDir(path.join(registryDir, "css"));
    await fs.writeFile(
      path.join(registryDir, "css", "base.css"),
      "a{color:#06c;text-decoration:none}"
    );

    // button.css
    await fs.writeFile(
      path.join(registryDir, "css", "button.css"),
      "[role=button],button{background:linear-gradient(#f2f2f2 45%,#ebebeb 0,#cfcfcf)}"
    );

    // index.json
    await fs.writeJson(path.join(registryDir, "index.json"), {
      registryVersion: "1.0.0",
      minCliVersion: "0.1.0",
      maxCliVersion: "0.x.x",
      base: { css: ["css/base.css"] },
      components: [
        {
          name: "button",
          displayName: "Button",
          description: "Windows 7 button",
          dependencies: [],
        },
      ],
    });

    // component JSON
    await fs.ensureDir(path.join(registryDir, "components"));
    await fs.writeJson(path.join(registryDir, "components", "button.json"), {
      name: "button",
      displayName: "Button",
      description: "Windows 7 button",
      dependencies: [],
      css: ["css/button.css"],
      files: {
        react: {
          ts: ["react/button/button.tsx"],
          js: ["react/button/button.jsx"],
        },
        svelte: { ts: [], js: [] },
        vue: { ts: [], js: [] },
      },
    });

    // React TS source
    await fs.ensureDir(path.join(registryDir, "react", "button"));
    await fs.writeFile(
      path.join(registryDir, "react", "button", "button.tsx"),
      'import React from "react";\nexport function Button() { return <button>Click</button>; }\n'
    );
    await fs.writeFile(
      path.join(registryDir, "react", "button", "button.jsx"),
      'import React from "react";\nexport function Button() { return <button>Click</button>; }\n'
    );
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it("should copy component files and CSS to target directory", async () => {
    const { runAdd } = await import("../add.js");

    await runAdd({
      cwd: tmpDir,
      components: ["button"],
      registryPath: registryDir,
      overwrite: false,
      nonInteractive: true,
    });

    // Component file should exist
    const componentPath = path.join(
      tmpDir,
      "src/components/win7ui",
      "Button.tsx"
    );
    expect(await fs.pathExists(componentPath)).toBe(true);

    // CSS module file should exist
    const cssPath = path.join(
      tmpDir,
      "src/components/win7ui/css",
      "button.module.css"
    );
    expect(await fs.pathExists(cssPath)).toBe(true);

    // base.css should be auto-installed
    const baseCssPath = path.join(
      tmpDir,
      "src/components/win7ui/css",
      "base.css"
    );
    expect(await fs.pathExists(baseCssPath)).toBe(true);
  });

  it("should create barrel file (index.ts)", async () => {
    const { runAdd } = await import("../add.js");

    await runAdd({
      cwd: tmpDir,
      components: ["button"],
      registryPath: registryDir,
      overwrite: false,
      nonInteractive: true,
    });

    const barrelPath = path.join(
      tmpDir,
      "src/components/win7ui",
      "index.ts"
    );
    expect(await fs.pathExists(barrelPath)).toBe(true);

    const content = await fs.readFile(barrelPath, "utf-8");
    expect(content).toContain('export { Button } from "./Button"');
  });

  it("should skip already installed component", async () => {
    const { runAdd } = await import("../add.js");

    // First install
    await runAdd({
      cwd: tmpDir,
      components: ["button"],
      registryPath: registryDir,
      overwrite: false,
      nonInteractive: true,
    });

    // Second install should not throw
    await runAdd({
      cwd: tmpDir,
      components: ["button"],
      registryPath: registryDir,
      overwrite: false,
      nonInteractive: true,
    });

    // File should still exist
    const componentPath = path.join(
      tmpDir,
      "src/components/win7ui",
      "Button.tsx"
    );
    expect(await fs.pathExists(componentPath)).toBe(true);
  });

  it("should throw if config not found", async () => {
    await fs.remove(path.join(tmpDir, "win7ui.config.json"));

    const { runAdd } = await import("../add.js");

    await expect(
      runAdd({
        cwd: tmpDir,
        components: ["button"],
        registryPath: registryDir,
        overwrite: false,
        nonInteractive: true,
      })
    ).rejects.toThrow();
  });
});
```

### 7.2 add 명령어 구현

- [ ] 파일: `packages/cli/src/commands/add.ts`

```ts
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
```

### 7.3 테스트 실행

```bash
cd win7ui
pnpm --filter win7ui test -- --reporter=verbose src/commands/__tests__/add.test.ts
```

**예상 출력:**
```
 ✓ add command > should copy component files and CSS to target directory
 ✓ add command > should create barrel file (index.ts)
 ✓ add command > should skip already installed component
 ✓ add command > should throw if config not found

 4 passed
```

---

## Task 8: CLI list 명령어 (TDD)

### 8.1 테스트 작성

- [ ] 파일: `packages/cli/src/commands/__tests__/list.test.ts`

```ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import os from "os";

describe("list command", () => {
  let tmpDir: string;
  let registryDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "win7ui-test-list-"));

    // Create config
    await fs.writeJson(path.join(tmpDir, "win7ui.config.json"), {
      framework: "react",
      typescript: true,
      componentDir: "src/components/win7ui",
      cssDir: "src/components/win7ui/css",
    });

    // Mock registry
    registryDir = path.join(tmpDir, "__registry__");
    await fs.writeJson(path.join(registryDir, "index.json"), {
      registryVersion: "1.0.0",
      minCliVersion: "0.1.0",
      maxCliVersion: "0.x.x",
      base: { css: ["css/base.css"] },
      components: [
        {
          name: "button",
          displayName: "Button",
          description: "Windows 7 button",
          dependencies: [],
        },
        {
          name: "textbox",
          displayName: "TextBox",
          description: "Windows 7 textbox",
          dependencies: [],
        },
      ],
    });
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it("should return all components with installed status", async () => {
    // Install button
    const componentDir = path.join(tmpDir, "src/components/win7ui");
    await fs.ensureDir(componentDir);
    await fs.writeFile(
      path.join(componentDir, "Button.tsx"),
      "export function Button() {}"
    );

    const { runList } = await import("../list.js");
    const result = await runList({
      cwd: tmpDir,
      registryPath: registryDir,
    });

    expect(result).toHaveLength(2);

    const button = result.find((c) => c.name === "button");
    expect(button).toBeDefined();
    expect(button!.installed).toBe(true);

    const textbox = result.find((c) => c.name === "textbox");
    expect(textbox).toBeDefined();
    expect(textbox!.installed).toBe(false);
  });

  it("should work without config (shows all as not installed)", async () => {
    await fs.remove(path.join(tmpDir, "win7ui.config.json"));

    const { runList } = await import("../list.js");
    const result = await runList({
      cwd: tmpDir,
      registryPath: registryDir,
    });

    expect(result).toHaveLength(2);
    expect(result.every((c) => !c.installed)).toBe(true);
  });
});
```

### 8.2 list 명령어 구현

- [ ] 파일: `packages/cli/src/commands/list.ts`

```ts
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
```

### 8.3 테스트 실행

```bash
cd win7ui
pnpm --filter win7ui test -- --reporter=verbose src/commands/__tests__/list.test.ts
```

**예상 출력:**
```
 ✓ list command > should return all components with installed status
 ✓ list command > should work without config (shows all as not installed)

 2 passed
```

---

## Task 9: CLI remove 명령어 (TDD)

### 9.1 테스트 작성

- [ ] 파일: `packages/cli/src/commands/__tests__/remove.test.ts`

```ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import os from "os";

describe("remove command", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "win7ui-test-remove-"));

    // Create config
    await fs.writeJson(path.join(tmpDir, "win7ui.config.json"), {
      framework: "react",
      typescript: true,
      componentDir: "src/components/win7ui",
      cssDir: "src/components/win7ui/css",
    });

    // Simulate installed components
    const componentDir = path.join(tmpDir, "src/components/win7ui");
    const cssDir = path.join(tmpDir, "src/components/win7ui/css");
    await fs.ensureDir(componentDir);
    await fs.ensureDir(cssDir);

    await fs.writeFile(
      path.join(componentDir, "Button.tsx"),
      'export function Button() { return <button>Click</button>; }\n'
    );
    await fs.writeFile(
      path.join(componentDir, "Textbox.tsx"),
      'export function Textbox() { return <input />; }\n'
    );
    await fs.writeFile(
      path.join(cssDir, "button.module.css"),
      "button{color:red}"
    );
    await fs.writeFile(
      path.join(cssDir, "textbox.module.css"),
      "input{color:blue}"
    );
    await fs.writeFile(
      path.join(componentDir, "index.ts"),
      'export { Button } from "./Button";\nexport { Textbox } from "./Textbox";\n'
    );
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it("should remove component file and CSS", async () => {
    const { runRemove } = await import("../remove.js");

    await runRemove({
      cwd: tmpDir,
      components: ["button"],
      force: false,
      nonInteractive: true,
    });

    const componentPath = path.join(
      tmpDir,
      "src/components/win7ui",
      "Button.tsx"
    );
    const cssPath = path.join(
      tmpDir,
      "src/components/win7ui/css",
      "button.module.css"
    );

    expect(await fs.pathExists(componentPath)).toBe(false);
    expect(await fs.pathExists(cssPath)).toBe(false);
  });

  it("should update barrel file after removal", async () => {
    const { runRemove } = await import("../remove.js");

    await runRemove({
      cwd: tmpDir,
      components: ["button"],
      force: false,
      nonInteractive: true,
    });

    const barrelPath = path.join(
      tmpDir,
      "src/components/win7ui",
      "index.ts"
    );
    const content = await fs.readFile(barrelPath, "utf-8");

    expect(content).not.toContain("Button");
    expect(content).toContain("Textbox");
  });

  it("should handle removing non-existent component gracefully", async () => {
    const { runRemove } = await import("../remove.js");

    // Should not throw
    await runRemove({
      cwd: tmpDir,
      components: ["nonexistent"],
      force: false,
      nonInteractive: true,
    });
  });

  it("should throw if config not found", async () => {
    await fs.remove(path.join(tmpDir, "win7ui.config.json"));

    const { runRemove } = await import("../remove.js");

    await expect(
      runRemove({
        cwd: tmpDir,
        components: ["button"],
        force: false,
        nonInteractive: true,
      })
    ).rejects.toThrow();
  });
});
```

### 9.2 remove 명령어 구현

- [ ] 파일: `packages/cli/src/commands/remove.ts`

```ts
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
```

### 9.3 테스트 실행

```bash
cd win7ui
pnpm --filter win7ui test -- --reporter=verbose src/commands/__tests__/remove.test.ts
```

**예상 출력:**
```
 ✓ remove command > should remove component file and CSS
 ✓ remove command > should update barrel file after removal
 ✓ remove command > should handle removing non-existent component gracefully
 ✓ remove command > should throw if config not found

 4 passed
```

---

## Task 10: Button 컴포넌트

> React TS/JS, Svelte TS/JS, Vue TS/JS + component JSON + CSS

### 10.1 CSS (이미 Task 3에서 생성)

파일: `registry/css/button.css` (Task 3.2 참조)

### 10.2 React TypeScript

- [ ] 파일: `registry/react/button/button.tsx`

```tsx
import React from "react";
import styles from "../css/button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary";
}

export function Button({
  variant = "default",
  className,
  children,
  ...props
}: ButtonProps) {
  const classNames = [
    styles.button,
    variant === "primary" ? styles.primary : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classNames} {...props}>
      {children}
    </button>
  );
}
```

### 10.3 React JavaScript

- [ ] 파일: `registry/react/button/button.jsx`

```jsx
import React from "react";
import styles from "../css/button.module.css";

export function Button({
  variant = "default",
  className,
  children,
  ...props
}) {
  const classNames = [
    styles.button,
    variant === "primary" ? styles.primary : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classNames} {...props}>
      {children}
    </button>
  );
}
```

### 10.4 Svelte TypeScript

- [ ] 파일: `registry/svelte/button/Button.svelte`

```svelte
<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";

  interface Props extends HTMLButtonAttributes {
    variant?: "default" | "primary";
  }

  let { variant = "default", class: className, children, ...rest }: Props = $props();
</script>

<button
  class="button {variant === 'primary' ? 'primary' : ''} {className ?? ''}"
  {...rest}
>
  {@render children?.()}
</button>

<style>
[role=button],button{background:linear-gradient(#f2f2f2 45%,#ebebeb 0,#cfcfcf);border:1px solid #8e8f8f;border-radius:3px;box-shadow:inset 0 0 0 1px #fffc;box-sizing:border-box;color:#222;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;min-height:23px;min-width:75px;padding:0 12px;position:relative;text-align:center;z-index:0}input[type=file]::file-selector-button{background:linear-gradient(#f2f2f2 45%,#ebebeb 0,#cfcfcf);border:1px solid #8e8f8f;border-radius:3px;box-shadow:inset 0 0 0 1px #fffc;box-sizing:border-box;color:#222;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;min-height:23px;min-width:75px;padding:0 12px;position:relative;text-align:center;z-index:0}[role=button]:before,button:before{background:linear-gradient(#eaf6fd 45%,#bee6fd 0,#a7d9f5);border-radius:3px;box-shadow:inset 0 0 0 1px #fffc;content:"";height:100%;left:0;margin:0;opacity:0;padding:0;position:absolute;top:0;transition:opacity .3s;width:100%;z-index:-1}[role=button]:after,button:after{background:linear-gradient(#e5f4fc,#c4e5f6 30% 50%,#98d1ef 50%,#68b3db);border-radius:2px;box-shadow:inset 1px 1px 0 #0003,inset -1px 1px 0 #0001;content:"";height:100%;left:0;margin:0;opacity:0;padding:0;position:absolute;top:0;transition:opacity .3s;width:100%;z-index:-1}[role=button]:disabled,button:disabled{background:#f4f4f4;border-color:#adb2b5;color:#838383}[role=button]:not(:disabled):hover,button:not(:disabled):hover{border-color:#3c7fb1;transition:border-color .3s}[role=button]:not(:disabled):hover:before,button:not(:disabled):hover:before{opacity:1;transition:opacity .3s}[role=button]:not(:disabled):not(:hover),button:not(:disabled):not(:hover){border-color:#8e8f8f;transition:border-color 1s linear}[role=button]:not(:disabled):not(:hover):before,button:not(:disabled):not(:hover):before{opacity:0;transition:opacity 1s linear}[role=button]:not(:disabled).active,[role=button]:not(:disabled):active,button:not(:disabled).active,button:not(:disabled):active{border-color:#6d91ab;transition:border-color .3s}[role=button]:not(:disabled).active:after,[role=button]:not(:disabled):active:after,button:not(:disabled).active:after,button:not(:disabled):active:after{opacity:1;transition:opacity .3s}[role=button].focused,[role=button]:focus-visible,button.focused,button:focus-visible{box-shadow:inset 0 0 0 2px #98d1ef;outline:1px dotted #000;outline-offset:-4px}[role=button].default,[role=button].focused,[role=button]:focus,button.default,button.focused,button:focus{-webkit-animation:pulse-anim 1s ease infinite alternate;animation:pulse-anim 1s ease infinite alternate;background-image:linear-gradient(#eaf6fd 45%,#bee6fd 0,#a7d9f5);border-color:#5586a3}label[role=button]{align-items:center;display:inline-flex}label[role=button]>input[type=file]{display:none}@-webkit-keyframes pulse-anim{0%{box-shadow:inset 0 0 3px 1px #34deffdd}to{box-shadow:inset 0 0 1px 1px #34deffdd}}@keyframes pulse-anim{0%{box-shadow:inset 0 0 3px 1px #34deffdd}to{box-shadow:inset 0 0 1px 1px #34deffdd}}
</style>
```

### 10.5 Svelte JavaScript

- [ ] 파일: `registry/svelte/button/Button.js.svelte`

```svelte
<script>
  let { variant = "default", class: className, children, ...rest } = $props();
</script>

<button
  class="button {variant === 'primary' ? 'primary' : ''} {className ?? ''}"
  {...rest}
>
  {@render children?.()}
</button>

<style>
[role=button],button{background:linear-gradient(#f2f2f2 45%,#ebebeb 0,#cfcfcf);border:1px solid #8e8f8f;border-radius:3px;box-shadow:inset 0 0 0 1px #fffc;box-sizing:border-box;color:#222;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;min-height:23px;min-width:75px;padding:0 12px;position:relative;text-align:center;z-index:0}input[type=file]::file-selector-button{background:linear-gradient(#f2f2f2 45%,#ebebeb 0,#cfcfcf);border:1px solid #8e8f8f;border-radius:3px;box-shadow:inset 0 0 0 1px #fffc;box-sizing:border-box;color:#222;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;min-height:23px;min-width:75px;padding:0 12px;position:relative;text-align:center;z-index:0}[role=button]:before,button:before{background:linear-gradient(#eaf6fd 45%,#bee6fd 0,#a7d9f5);border-radius:3px;box-shadow:inset 0 0 0 1px #fffc;content:"";height:100%;left:0;margin:0;opacity:0;padding:0;position:absolute;top:0;transition:opacity .3s;width:100%;z-index:-1}[role=button]:after,button:after{background:linear-gradient(#e5f4fc,#c4e5f6 30% 50%,#98d1ef 50%,#68b3db);border-radius:2px;box-shadow:inset 1px 1px 0 #0003,inset -1px 1px 0 #0001;content:"";height:100%;left:0;margin:0;opacity:0;padding:0;position:absolute;top:0;transition:opacity .3s;width:100%;z-index:-1}[role=button]:disabled,button:disabled{background:#f4f4f4;border-color:#adb2b5;color:#838383}[role=button]:not(:disabled):hover,button:not(:disabled):hover{border-color:#3c7fb1;transition:border-color .3s}[role=button]:not(:disabled):hover:before,button:not(:disabled):hover:before{opacity:1;transition:opacity .3s}[role=button]:not(:disabled):not(:hover),button:not(:disabled):not(:hover){border-color:#8e8f8f;transition:border-color 1s linear}[role=button]:not(:disabled):not(:hover):before,button:not(:disabled):not(:hover):before{opacity:0;transition:opacity 1s linear}[role=button]:not(:disabled).active,[role=button]:not(:disabled):active,button:not(:disabled).active,button:not(:disabled):active{border-color:#6d91ab;transition:border-color .3s}[role=button]:not(:disabled).active:after,[role=button]:not(:disabled):active:after,button:not(:disabled).active:after,button:not(:disabled):active:after{opacity:1;transition:opacity .3s}[role=button].focused,[role=button]:focus-visible,button.focused,button:focus-visible{box-shadow:inset 0 0 0 2px #98d1ef;outline:1px dotted #000;outline-offset:-4px}[role=button].default,[role=button].focused,[role=button]:focus,button.default,button.focused,button:focus{-webkit-animation:pulse-anim 1s ease infinite alternate;animation:pulse-anim 1s ease infinite alternate;background-image:linear-gradient(#eaf6fd 45%,#bee6fd 0,#a7d9f5);border-color:#5586a3}label[role=button]{align-items:center;display:inline-flex}label[role=button]>input[type=file]{display:none}@-webkit-keyframes pulse-anim{0%{box-shadow:inset 0 0 3px 1px #34deffdd}to{box-shadow:inset 0 0 1px 1px #34deffdd}}@keyframes pulse-anim{0%{box-shadow:inset 0 0 3px 1px #34deffdd}to{box-shadow:inset 0 0 1px 1px #34deffdd}}
</style>
```

### 10.6 Vue TypeScript

- [ ] 파일: `registry/vue/button/Button.vue`

```vue
<script setup lang="ts">
interface Props {
  variant?: "default" | "primary";
  class?: string;
}

const { variant = "default", class: className } = defineProps<Props>();
</script>

<template>
  <button
    :class="['button', variant === 'primary' && 'primary', className]"
  >
    <slot />
  </button>
</template>

<style scoped>
[role=button],button{background:linear-gradient(#f2f2f2 45%,#ebebeb 0,#cfcfcf);border:1px solid #8e8f8f;border-radius:3px;box-shadow:inset 0 0 0 1px #fffc;box-sizing:border-box;color:#222;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;min-height:23px;min-width:75px;padding:0 12px;position:relative;text-align:center;z-index:0}input[type=file]::file-selector-button{background:linear-gradient(#f2f2f2 45%,#ebebeb 0,#cfcfcf);border:1px solid #8e8f8f;border-radius:3px;box-shadow:inset 0 0 0 1px #fffc;box-sizing:border-box;color:#222;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;min-height:23px;min-width:75px;padding:0 12px;position:relative;text-align:center;z-index:0}[role=button]:before,button:before{background:linear-gradient(#eaf6fd 45%,#bee6fd 0,#a7d9f5);border-radius:3px;box-shadow:inset 0 0 0 1px #fffc;content:"";height:100%;left:0;margin:0;opacity:0;padding:0;position:absolute;top:0;transition:opacity .3s;width:100%;z-index:-1}[role=button]:after,button:after{background:linear-gradient(#e5f4fc,#c4e5f6 30% 50%,#98d1ef 50%,#68b3db);border-radius:2px;box-shadow:inset 1px 1px 0 #0003,inset -1px 1px 0 #0001;content:"";height:100%;left:0;margin:0;opacity:0;padding:0;position:absolute;top:0;transition:opacity .3s;width:100%;z-index:-1}[role=button]:disabled,button:disabled{background:#f4f4f4;border-color:#adb2b5;color:#838383}[role=button]:not(:disabled):hover,button:not(:disabled):hover{border-color:#3c7fb1;transition:border-color .3s}[role=button]:not(:disabled):hover:before,button:not(:disabled):hover:before{opacity:1;transition:opacity .3s}[role=button]:not(:disabled):not(:hover),button:not(:disabled):not(:hover){border-color:#8e8f8f;transition:border-color 1s linear}[role=button]:not(:disabled):not(:hover):before,button:not(:disabled):not(:hover):before{opacity:0;transition:opacity 1s linear}[role=button]:not(:disabled).active,[role=button]:not(:disabled):active,button:not(:disabled).active,button:not(:disabled):active{border-color:#6d91ab;transition:border-color .3s}[role=button]:not(:disabled).active:after,[role=button]:not(:disabled):active:after,button:not(:disabled).active:after,button:not(:disabled):active:after{opacity:1;transition:opacity .3s}[role=button].focused,[role=button]:focus-visible,button.focused,button:focus-visible{box-shadow:inset 0 0 0 2px #98d1ef;outline:1px dotted #000;outline-offset:-4px}[role=button].default,[role=button].focused,[role=button]:focus,button.default,button.focused,button:focus{-webkit-animation:pulse-anim 1s ease infinite alternate;animation:pulse-anim 1s ease infinite alternate;background-image:linear-gradient(#eaf6fd 45%,#bee6fd 0,#a7d9f5);border-color:#5586a3}label[role=button]{align-items:center;display:inline-flex}label[role=button]>input[type=file]{display:none}@-webkit-keyframes pulse-anim{0%{box-shadow:inset 0 0 3px 1px #34deffdd}to{box-shadow:inset 0 0 1px 1px #34deffdd}}@keyframes pulse-anim{0%{box-shadow:inset 0 0 3px 1px #34deffdd}to{box-shadow:inset 0 0 1px 1px #34deffdd}}
</style>
```

### 10.7 Vue JavaScript

- [ ] 파일: `registry/vue/button/Button.js.vue`

```vue
<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: "default",
  },
  class: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <button
    :class="['button', variant === 'primary' && 'primary', props.class]"
  >
    <slot />
  </button>
</template>

<style scoped>
[role=button],button{background:linear-gradient(#f2f2f2 45%,#ebebeb 0,#cfcfcf);border:1px solid #8e8f8f;border-radius:3px;box-shadow:inset 0 0 0 1px #fffc;box-sizing:border-box;color:#222;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;min-height:23px;min-width:75px;padding:0 12px;position:relative;text-align:center;z-index:0}input[type=file]::file-selector-button{background:linear-gradient(#f2f2f2 45%,#ebebeb 0,#cfcfcf);border:1px solid #8e8f8f;border-radius:3px;box-shadow:inset 0 0 0 1px #fffc;box-sizing:border-box;color:#222;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;min-height:23px;min-width:75px;padding:0 12px;position:relative;text-align:center;z-index:0}[role=button]:before,button:before{background:linear-gradient(#eaf6fd 45%,#bee6fd 0,#a7d9f5);border-radius:3px;box-shadow:inset 0 0 0 1px #fffc;content:"";height:100%;left:0;margin:0;opacity:0;padding:0;position:absolute;top:0;transition:opacity .3s;width:100%;z-index:-1}[role=button]:after,button:after{background:linear-gradient(#e5f4fc,#c4e5f6 30% 50%,#98d1ef 50%,#68b3db);border-radius:2px;box-shadow:inset 1px 1px 0 #0003,inset -1px 1px 0 #0001;content:"";height:100%;left:0;margin:0;opacity:0;padding:0;position:absolute;top:0;transition:opacity .3s;width:100%;z-index:-1}[role=button]:disabled,button:disabled{background:#f4f4f4;border-color:#adb2b5;color:#838383}[role=button]:not(:disabled):hover,button:not(:disabled):hover{border-color:#3c7fb1;transition:border-color .3s}[role=button]:not(:disabled):hover:before,button:not(:disabled):hover:before{opacity:1;transition:opacity .3s}[role=button]:not(:disabled):not(:hover),button:not(:disabled):not(:hover){border-color:#8e8f8f;transition:border-color 1s linear}[role=button]:not(:disabled):not(:hover):before,button:not(:disabled):not(:hover):before{opacity:0;transition:opacity 1s linear}[role=button]:not(:disabled).active,[role=button]:not(:disabled):active,button:not(:disabled).active,button:not(:disabled):active{border-color:#6d91ab;transition:border-color .3s}[role=button]:not(:disabled).active:after,[role=button]:not(:disabled):active:after,button:not(:disabled).active:after,button:not(:disabled):active:after{opacity:1;transition:opacity .3s}[role=button].focused,[role=button]:focus-visible,button.focused,button:focus-visible{box-shadow:inset 0 0 0 2px #98d1ef;outline:1px dotted #000;outline-offset:-4px}[role=button].default,[role=button].focused,[role=button]:focus,button.default,button.focused,button:focus{-webkit-animation:pulse-anim 1s ease infinite alternate;animation:pulse-anim 1s ease infinite alternate;background-image:linear-gradient(#eaf6fd 45%,#bee6fd 0,#a7d9f5);border-color:#5586a3}label[role=button]{align-items:center;display:inline-flex}label[role=button]>input[type=file]{display:none}@-webkit-keyframes pulse-anim{0%{box-shadow:inset 0 0 3px 1px #34deffdd}to{box-shadow:inset 0 0 1px 1px #34deffdd}}@keyframes pulse-anim{0%{box-shadow:inset 0 0 3px 1px #34deffdd}to{box-shadow:inset 0 0 1px 1px #34deffdd}}
</style>
```

### 10.8 Component JSON (build-registry.ts가 자동 생성하지만, 기대 결과 명시)

파일: `registry/components/button.json` (build-registry.ts 실행 시 자동 생성)

```json
{
  "name": "button",
  "displayName": "Button",
  "description": "Windows 7 스타일 푸시 버튼",
  "dependencies": [],
  "css": ["css/button.css"],
  "files": {
    "react": {
      "ts": ["react/button/button.tsx"],
      "js": ["react/button/button.jsx"]
    },
    "svelte": {
      "ts": ["svelte/button/Button.svelte"],
      "js": ["svelte/button/Button.js.svelte"]
    },
    "vue": {
      "ts": ["vue/button/Button.vue"],
      "js": ["vue/button/Button.js.vue"]
    }
  }
}
```

### 검증

```bash
ls -la registry/react/button/ registry/svelte/button/ registry/vue/button/
```

**예상 출력:**
```
registry/react/button/:
button.tsx  button.jsx

registry/svelte/button/:
Button.svelte  Button.js.svelte

registry/vue/button/:
Button.vue  Button.js.vue
```

---

## Task 11: TextBox 컴포넌트

> React TS/JS, Svelte TS/JS, Vue TS/JS + CSS

### 11.1 CSS (이미 Task 3에서 생성)

파일: `registry/css/textbox.css` (Task 3.3 참조)

### 11.2 React TypeScript

- [ ] 파일: `registry/react/textbox/textbox.tsx`

```tsx
import React from "react";
import styles from "../css/textbox.module.css";

interface TextBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  multiline?: false;
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  multiline: true;
}

type Props = TextBoxProps | TextAreaProps;

export function TextBox(props: Props) {
  if (props.multiline) {
    const { multiline, className, ...rest } = props;
    return (
      <textarea
        className={`${styles.textbox} ${className ?? ""}`}
        {...rest}
      />
    );
  }

  const { multiline, className, type = "text", ...rest } = props;
  return (
    <input
      type={type}
      className={`${styles.textbox} ${className ?? ""}`}
      {...rest}
    />
  );
}
```

### 11.3 React JavaScript

- [ ] 파일: `registry/react/textbox/textbox.jsx`

```jsx
import React from "react";
import styles from "../css/textbox.module.css";

export function TextBox({ multiline = false, className, type = "text", ...rest }) {
  if (multiline) {
    return (
      <textarea
        className={`${styles.textbox} ${className ?? ""}`}
        {...rest}
      />
    );
  }

  return (
    <input
      type={type}
      className={`${styles.textbox} ${className ?? ""}`}
      {...rest}
    />
  );
}
```

### 11.4 Svelte TypeScript

- [ ] 파일: `registry/svelte/textbox/TextBox.svelte`

```svelte
<script lang="ts">
  import type { HTMLInputAttributes, HTMLTextareaAttributes } from "svelte/elements";

  interface BaseProps {
    multiline?: boolean;
    class?: string;
  }

  type Props = BaseProps & (HTMLInputAttributes | HTMLTextareaAttributes);

  let { multiline = false, class: className, type = "text", ...rest }: Props = $props();
</script>

{#if multiline}
  <textarea class="textbox {className ?? ''}" {...rest}></textarea>
{:else}
  <input {type} class="textbox {className ?? ''}" {...rest} />
{/if}

<style>
input[type=email],input[type=number],input[type=password],input[type=text],input[type=url]{height:23px}input[type=email],input[type=number],input[type=password],input[type=text],input[type=url],textarea{background-color:#fff;border-color:#abadb3 #dbdfe6 #e3e9ef #e2e3ea;border-radius:2px;border-style:solid;border-width:1px;box-sizing:border-box;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;padding:3px 4px 5px;transition:border-color .5s}input[type=email]:hover,input[type=number]:hover,input[type=password]:hover,input[type=text]:hover,input[type=url]:hover,textarea:hover{border-color:#5794bf #b7d5ea #c7e2f1 #c5daed;transition:border-color .3s}input[type=email]:focus,input[type=number]:focus,input[type=password]:focus,input[type=text]:focus,input[type=url]:focus,textarea:focus{border-color:#3d7bad #a4c9e3 #b7d9ed #b5cfe7;outline:none}input[type=email]:disabled,input[type=number]:disabled,input[type=password]:disabled,input[type=text]:disabled,input[type=url]:disabled,textarea:disabled{background:#f0f0f0;border-color:#afafaf;box-shadow:inset 0 0 0 1px #fff}
</style>
```

### 11.5 Svelte JavaScript

- [ ] 파일: `registry/svelte/textbox/TextBox.js.svelte`

```svelte
<script>
  let { multiline = false, class: className, type = "text", ...rest } = $props();
</script>

{#if multiline}
  <textarea class="textbox {className ?? ''}" {...rest}></textarea>
{:else}
  <input {type} class="textbox {className ?? ''}" {...rest} />
{/if}

<style>
input[type=email],input[type=number],input[type=password],input[type=text],input[type=url]{height:23px}input[type=email],input[type=number],input[type=password],input[type=text],input[type=url],textarea{background-color:#fff;border-color:#abadb3 #dbdfe6 #e3e9ef #e2e3ea;border-radius:2px;border-style:solid;border-width:1px;box-sizing:border-box;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;padding:3px 4px 5px;transition:border-color .5s}input[type=email]:hover,input[type=number]:hover,input[type=password]:hover,input[type=text]:hover,input[type=url]:hover,textarea:hover{border-color:#5794bf #b7d5ea #c7e2f1 #c5daed;transition:border-color .3s}input[type=email]:focus,input[type=number]:focus,input[type=password]:focus,input[type=text]:focus,input[type=url]:focus,textarea:focus{border-color:#3d7bad #a4c9e3 #b7d9ed #b5cfe7;outline:none}input[type=email]:disabled,input[type=number]:disabled,input[type=password]:disabled,input[type=text]:disabled,input[type=url]:disabled,textarea:disabled{background:#f0f0f0;border-color:#afafaf;box-shadow:inset 0 0 0 1px #fff}
</style>
```

### 11.6 Vue TypeScript

- [ ] 파일: `registry/vue/textbox/TextBox.vue`

```vue
<script setup lang="ts">
interface Props {
  multiline?: boolean;
  type?: string;
  class?: string;
}

const { multiline = false, type = "text", class: className } = defineProps<Props>();
</script>

<template>
  <textarea
    v-if="multiline"
    :class="['textbox', className]"
    v-bind="$attrs"
  />
  <input
    v-else
    :type="type"
    :class="['textbox', className]"
    v-bind="$attrs"
  />
</template>

<style scoped>
input[type=email],input[type=number],input[type=password],input[type=text],input[type=url]{height:23px}input[type=email],input[type=number],input[type=password],input[type=text],input[type=url],textarea{background-color:#fff;border-color:#abadb3 #dbdfe6 #e3e9ef #e2e3ea;border-radius:2px;border-style:solid;border-width:1px;box-sizing:border-box;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;padding:3px 4px 5px;transition:border-color .5s}input[type=email]:hover,input[type=number]:hover,input[type=password]:hover,input[type=text]:hover,input[type=url]:hover,textarea:hover{border-color:#5794bf #b7d5ea #c7e2f1 #c5daed;transition:border-color .3s}input[type=email]:focus,input[type=number]:focus,input[type=password]:focus,input[type=text]:focus,input[type=url]:focus,textarea:focus{border-color:#3d7bad #a4c9e3 #b7d9ed #b5cfe7;outline:none}input[type=email]:disabled,input[type=number]:disabled,input[type=password]:disabled,input[type=text]:disabled,input[type=url]:disabled,textarea:disabled{background:#f0f0f0;border-color:#afafaf;box-shadow:inset 0 0 0 1px #fff}
</style>
```

### 11.7 Vue JavaScript

- [ ] 파일: `registry/vue/textbox/TextBox.js.vue`

```vue
<script setup>
const props = defineProps({
  multiline: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: "text",
  },
  class: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <textarea
    v-if="multiline"
    :class="['textbox', props.class]"
    v-bind="$attrs"
  />
  <input
    v-else
    :type="type"
    :class="['textbox', props.class]"
    v-bind="$attrs"
  />
</template>

<style scoped>
input[type=email],input[type=number],input[type=password],input[type=text],input[type=url]{height:23px}input[type=email],input[type=number],input[type=password],input[type=text],input[type=url],textarea{background-color:#fff;border-color:#abadb3 #dbdfe6 #e3e9ef #e2e3ea;border-radius:2px;border-style:solid;border-width:1px;box-sizing:border-box;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;padding:3px 4px 5px;transition:border-color .5s}input[type=email]:hover,input[type=number]:hover,input[type=password]:hover,input[type=text]:hover,input[type=url]:hover,textarea:hover{border-color:#5794bf #b7d5ea #c7e2f1 #c5daed;transition:border-color .3s}input[type=email]:focus,input[type=number]:focus,input[type=password]:focus,input[type=text]:focus,input[type=url]:focus,textarea:focus{border-color:#3d7bad #a4c9e3 #b7d9ed #b5cfe7;outline:none}input[type=email]:disabled,input[type=number]:disabled,input[type=password]:disabled,input[type=text]:disabled,input[type=url]:disabled,textarea:disabled{background:#f0f0f0;border-color:#afafaf;box-shadow:inset 0 0 0 1px #fff}
</style>
```

### 검증

```bash
ls -la registry/react/textbox/ registry/svelte/textbox/ registry/vue/textbox/
```

**예상 출력:**
```
registry/react/textbox/:
textbox.tsx  textbox.jsx

registry/svelte/textbox/:
TextBox.svelte  TextBox.js.svelte

registry/vue/textbox/:
TextBox.vue  TextBox.js.vue
```

---

## Task 12: Checkbox 컴포넌트

> React TS/JS, Svelte TS/JS, Vue TS/JS + CSS

### 12.1 CSS (이미 Task 3에서 생성)

파일: `registry/css/checkbox.css` (Task 3.4 참조)

### 12.2 React TypeScript

- [ ] 파일: `registry/react/checkbox/checkbox.tsx`

```tsx
import React, { useId } from "react";
import styles from "../css/checkbox.module.css";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

export function Checkbox({ label, className, id, ...props }: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <span className={className}>
      <input
        type="checkbox"
        id={inputId}
        className={styles.checkbox}
        {...props}
      />
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
    </span>
  );
}
```

### 12.3 React JavaScript

- [ ] 파일: `registry/react/checkbox/checkbox.jsx`

```jsx
import React, { useId } from "react";
import styles from "../css/checkbox.module.css";

export function Checkbox({ label, className, id, ...props }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <span className={className}>
      <input
        type="checkbox"
        id={inputId}
        className={styles.checkbox}
        {...props}
      />
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
    </span>
  );
}
```

### 12.4 Svelte TypeScript

- [ ] 파일: `registry/svelte/checkbox/Checkbox.svelte`

```svelte
<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLInputAttributes, "type"> {
    label: string;
    checked?: boolean;
    class?: string;
  }

  let { label, checked = $bindable(false), class: className, id, ...rest }: Props = $props();

  const generatedId = crypto.randomUUID();
  const inputId = id ?? generatedId;
</script>

<span class={className ?? ""}>
  <input
    type="checkbox"
    id={inputId}
    class="checkbox"
    bind:checked
    {...rest}
  />
  <label for={inputId} class="label">{label}</label>
</span>

<style>
input[type=checkbox]{appearance:none;-webkit-appearance:none;-moz-appearance:none;background:none;border:none;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;margin:0;opacity:0}input[type=checkbox]+label{align-items:center;display:inline-flex;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;position:relative}input[type=checkbox]+label:before{background:#f6f6f6;border:1px solid #8e8f8f;box-shadow:inset 0 0 0 1px #f4f4f4,inset 1px 1px 0 1px #aeaeae,inset -1px -1px 0 1px #ddd,inset 3px 3px 6px #ccc;box-sizing:border-box;content:"";display:inline-block;height:14px;margin-right:6px;transition:.4s;width:14px}input[type=checkbox]+label:hover:before{background:#e9f7fe;border-color:#3c7fb1;box-shadow:inset 0 0 0 1px #def9fa,inset 1px 1px 0 1px #79c6f9,inset -1px -1px 0 1px #c6e9fc,inset 3px 3px 6px #b1dffd}input[type=checkbox]:focus-visible+label{outline:1px dotted #000}input[type=checkbox]:checked+label:after{color:#4a5f97;content:"\2714";display:block;font-weight:700;left:2px;position:absolute;top:0}input[type=checkbox]:disabled+label{color:#6d6d6d}input[type=checkbox]:disabled+label:before{background:linear-gradient(to bottom right,#f0f0f0,#fbfbfb);border:1px solid #b1b1b1;box-shadow:none;content:"";display:inline-block;height:14px;margin-right:6px;width:14px}input[type=checkbox]:disabled+label:after{color:#bfbfbf}
</style>
```

### 12.5 Svelte JavaScript

- [ ] 파일: `registry/svelte/checkbox/Checkbox.js.svelte`

```svelte
<script>
  let { label, checked = $bindable(false), class: className, id, ...rest } = $props();

  const generatedId = crypto.randomUUID();
  const inputId = id ?? generatedId;
</script>

<span class={className ?? ""}>
  <input
    type="checkbox"
    id={inputId}
    class="checkbox"
    bind:checked
    {...rest}
  />
  <label for={inputId} class="label">{label}</label>
</span>

<style>
input[type=checkbox]{appearance:none;-webkit-appearance:none;-moz-appearance:none;background:none;border:none;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;margin:0;opacity:0}input[type=checkbox]+label{align-items:center;display:inline-flex;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;position:relative}input[type=checkbox]+label:before{background:#f6f6f6;border:1px solid #8e8f8f;box-shadow:inset 0 0 0 1px #f4f4f4,inset 1px 1px 0 1px #aeaeae,inset -1px -1px 0 1px #ddd,inset 3px 3px 6px #ccc;box-sizing:border-box;content:"";display:inline-block;height:14px;margin-right:6px;transition:.4s;width:14px}input[type=checkbox]+label:hover:before{background:#e9f7fe;border-color:#3c7fb1;box-shadow:inset 0 0 0 1px #def9fa,inset 1px 1px 0 1px #79c6f9,inset -1px -1px 0 1px #c6e9fc,inset 3px 3px 6px #b1dffd}input[type=checkbox]:focus-visible+label{outline:1px dotted #000}input[type=checkbox]:checked+label:after{color:#4a5f97;content:"\2714";display:block;font-weight:700;left:2px;position:absolute;top:0}input[type=checkbox]:disabled+label{color:#6d6d6d}input[type=checkbox]:disabled+label:before{background:linear-gradient(to bottom right,#f0f0f0,#fbfbfb);border:1px solid #b1b1b1;box-shadow:none;content:"";display:inline-block;height:14px;margin-right:6px;width:14px}input[type=checkbox]:disabled+label:after{color:#bfbfbf}
</style>
```

### 12.6 Vue TypeScript

- [ ] 파일: `registry/vue/checkbox/Checkbox.vue`

```vue
<script setup lang="ts">
import { useId } from "vue";

interface Props {
  label: string;
  modelValue?: boolean;
  disabled?: boolean;
  class?: string;
  id?: string;
}

const { label, modelValue = false, disabled = false, class: className, id } = defineProps<Props>();
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const generatedId = useId();
const inputId = id ?? generatedId;
</script>

<template>
  <span :class="className">
    <input
      type="checkbox"
      :id="inputId"
      class="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <label :for="inputId" class="label">{{ label }}</label>
  </span>
</template>

<style scoped>
input[type=checkbox]{appearance:none;-webkit-appearance:none;-moz-appearance:none;background:none;border:none;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;margin:0;opacity:0}input[type=checkbox]+label{align-items:center;display:inline-flex;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;position:relative}input[type=checkbox]+label:before{background:#f6f6f6;border:1px solid #8e8f8f;box-shadow:inset 0 0 0 1px #f4f4f4,inset 1px 1px 0 1px #aeaeae,inset -1px -1px 0 1px #ddd,inset 3px 3px 6px #ccc;box-sizing:border-box;content:"";display:inline-block;height:14px;margin-right:6px;transition:.4s;width:14px}input[type=checkbox]+label:hover:before{background:#e9f7fe;border-color:#3c7fb1;box-shadow:inset 0 0 0 1px #def9fa,inset 1px 1px 0 1px #79c6f9,inset -1px -1px 0 1px #c6e9fc,inset 3px 3px 6px #b1dffd}input[type=checkbox]:focus-visible+label{outline:1px dotted #000}input[type=checkbox]:checked+label:after{color:#4a5f97;content:"\2714";display:block;font-weight:700;left:2px;position:absolute;top:0}input[type=checkbox]:disabled+label{color:#6d6d6d}input[type=checkbox]:disabled+label:before{background:linear-gradient(to bottom right,#f0f0f0,#fbfbfb);border:1px solid #b1b1b1;box-shadow:none;content:"";display:inline-block;height:14px;margin-right:6px;width:14px}input[type=checkbox]:disabled+label:after{color:#bfbfbf}
</style>
```

### 12.7 Vue JavaScript

- [ ] 파일: `registry/vue/checkbox/Checkbox.js.vue`

```vue
<script setup>
import { useId } from "vue";

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  class: {
    type: String,
    default: "",
  },
  id: {
    type: String,
    default: undefined,
  },
});

const emit = defineEmits(["update:modelValue"]);

const generatedId = useId();
const inputId = props.id ?? generatedId;
</script>

<template>
  <span :class="props.class">
    <input
      type="checkbox"
      :id="inputId"
      class="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="emit('update:modelValue', $event.target.checked)"
    />
    <label :for="inputId" class="label">{{ label }}</label>
  </span>
</template>

<style scoped>
input[type=checkbox]{appearance:none;-webkit-appearance:none;-moz-appearance:none;background:none;border:none;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;margin:0;opacity:0}input[type=checkbox]+label{align-items:center;display:inline-flex;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;position:relative}input[type=checkbox]+label:before{background:#f6f6f6;border:1px solid #8e8f8f;box-shadow:inset 0 0 0 1px #f4f4f4,inset 1px 1px 0 1px #aeaeae,inset -1px -1px 0 1px #ddd,inset 3px 3px 6px #ccc;box-sizing:border-box;content:"";display:inline-block;height:14px;margin-right:6px;transition:.4s;width:14px}input[type=checkbox]+label:hover:before{background:#e9f7fe;border-color:#3c7fb1;box-shadow:inset 0 0 0 1px #def9fa,inset 1px 1px 0 1px #79c6f9,inset -1px -1px 0 1px #c6e9fc,inset 3px 3px 6px #b1dffd}input[type=checkbox]:focus-visible+label{outline:1px dotted #000}input[type=checkbox]:checked+label:after{color:#4a5f97;content:"\2714";display:block;font-weight:700;left:2px;position:absolute;top:0}input[type=checkbox]:disabled+label{color:#6d6d6d}input[type=checkbox]:disabled+label:before{background:linear-gradient(to bottom right,#f0f0f0,#fbfbfb);border:1px solid #b1b1b1;box-shadow:none;content:"";display:inline-block;height:14px;margin-right:6px;width:14px}input[type=checkbox]:disabled+label:after{color:#bfbfbf}
</style>
```

### 검증

```bash
ls -la registry/react/checkbox/ registry/svelte/checkbox/ registry/vue/checkbox/
```

**예상 출력:**
```
registry/react/checkbox/:
checkbox.tsx  checkbox.jsx

registry/svelte/checkbox/:
Checkbox.svelte  Checkbox.js.svelte

registry/vue/checkbox/:
Checkbox.vue  Checkbox.js.vue
```

---

## Task 13: RadioButton 컴포넌트

> React TS/JS, Svelte TS/JS, Vue TS/JS + CSS

### 13.1 CSS (이미 Task 3에서 생성)

파일: `registry/css/radiobutton.css` (Task 3.5 참조)

### 13.2 React TypeScript

- [ ] 파일: `registry/react/radiobutton/radiobutton.tsx`

```tsx
import React, { useId } from "react";
import styles from "../css/radiobutton.module.css";

interface RadioButtonProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

export function RadioButton({ label, className, id, ...props }: RadioButtonProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <span className={className}>
      <input
        type="radio"
        id={inputId}
        className={styles.radio}
        {...props}
      />
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
    </span>
  );
}
```

### 13.3 React JavaScript

- [ ] 파일: `registry/react/radiobutton/radiobutton.jsx`

```jsx
import React, { useId } from "react";
import styles from "../css/radiobutton.module.css";

export function RadioButton({ label, className, id, ...props }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <span className={className}>
      <input
        type="radio"
        id={inputId}
        className={styles.radio}
        {...props}
      />
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
    </span>
  );
}
```

### 13.4 Svelte TypeScript

- [ ] 파일: `registry/svelte/radiobutton/RadioButton.svelte`

```svelte
<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLInputAttributes, "type"> {
    label: string;
    group?: string;
    value?: string;
    class?: string;
  }

  let { label, group = $bindable(""), value, class: className, id, ...rest }: Props = $props();

  const generatedId = crypto.randomUUID();
  const inputId = id ?? generatedId;
</script>

<span class={className ?? ""}>
  <input
    type="radio"
    id={inputId}
    class="radio"
    bind:group
    {value}
    {...rest}
  />
  <label for={inputId} class="label">{label}</label>
</span>

<style>
input[type=radio]{appearance:none;-webkit-appearance:none;-moz-appearance:none;background:0;border:none;margin:0;opacity:0;position:fixed}input[type=radio]+label{align-items:center;display:inline-flex;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;margin-left:20px;position:relative}input[type=radio]+label:before{background:#f6f6f6;border:1px solid #8e8f8f;border-radius:50%;box-shadow:inset 0 0 0 1.5px #f4f4f4,inset 1px 1px 0 1.5px #aeaeae,inset -1px 0 0 1.5px #ddd,inset 3px 3px 6px #ccc;box-sizing:border-box;content:"";display:inline-block;height:14px;left:-20px;margin-right:6px;position:absolute;top:0;transition:.4s;width:14px}input[type=radio]+label:hover:before{border-color:#3c7fb1;box-shadow:inset 0 0 0 1.5px #def9fa,inset 1px 1px 0 1.5px #79c6f9,inset -1px -1px 0 1.5px #c6e9fc,inset 3px 3px 6px #b1dffd}input[type=radio]:checked+label:after{background:#7cd3eb;border:1.5px solid #27506d;border-radius:50%;box-shadow:inset -1px -1px 0 .5px #16638f,inset -1px -1px 0 1px #1985c0;box-sizing:border-box;content:"";display:block;height:8px;left:-17px;position:absolute;top:3px;width:8px}input[type=radio]:focus-visible+label{outline:1px dotted #000}input[type=radio]:disabled+label{filter:grayscale(1);opacity:.6}input[type=radio]:disabled:not(:checked)+label:before{opacity:.5}
</style>
```

### 13.5 Svelte JavaScript

- [ ] 파일: `registry/svelte/radiobutton/RadioButton.js.svelte`

```svelte
<script>
  let { label, group = $bindable(""), value, class: className, id, ...rest } = $props();

  const generatedId = crypto.randomUUID();
  const inputId = id ?? generatedId;
</script>

<span class={className ?? ""}>
  <input
    type="radio"
    id={inputId}
    class="radio"
    bind:group
    {value}
    {...rest}
  />
  <label for={inputId} class="label">{label}</label>
</span>

<style>
input[type=radio]{appearance:none;-webkit-appearance:none;-moz-appearance:none;background:0;border:none;margin:0;opacity:0;position:fixed}input[type=radio]+label{align-items:center;display:inline-flex;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;margin-left:20px;position:relative}input[type=radio]+label:before{background:#f6f6f6;border:1px solid #8e8f8f;border-radius:50%;box-shadow:inset 0 0 0 1.5px #f4f4f4,inset 1px 1px 0 1.5px #aeaeae,inset -1px 0 0 1.5px #ddd,inset 3px 3px 6px #ccc;box-sizing:border-box;content:"";display:inline-block;height:14px;left:-20px;margin-right:6px;position:absolute;top:0;transition:.4s;width:14px}input[type=radio]+label:hover:before{border-color:#3c7fb1;box-shadow:inset 0 0 0 1.5px #def9fa,inset 1px 1px 0 1.5px #79c6f9,inset -1px -1px 0 1.5px #c6e9fc,inset 3px 3px 6px #b1dffd}input[type=radio]:checked+label:after{background:#7cd3eb;border:1.5px solid #27506d;border-radius:50%;box-shadow:inset -1px -1px 0 .5px #16638f,inset -1px -1px 0 1px #1985c0;box-sizing:border-box;content:"";display:block;height:8px;left:-17px;position:absolute;top:3px;width:8px}input[type=radio]:focus-visible+label{outline:1px dotted #000}input[type=radio]:disabled+label{filter:grayscale(1);opacity:.6}input[type=radio]:disabled:not(:checked)+label:before{opacity:.5}
</style>
```

### 13.6 Vue TypeScript

- [ ] 파일: `registry/vue/radiobutton/RadioButton.vue`

```vue
<script setup lang="ts">
import { useId } from "vue";

interface Props {
  label: string;
  modelValue?: string;
  value?: string;
  disabled?: boolean;
  name?: string;
  class?: string;
  id?: string;
}

const { label, modelValue, value, disabled = false, name, class: className, id } = defineProps<Props>();
const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const generatedId = useId();
const inputId = id ?? generatedId;
</script>

<template>
  <span :class="className">
    <input
      type="radio"
      :id="inputId"
      class="radio"
      :name="name"
      :value="value"
      :checked="modelValue === value"
      :disabled="disabled"
      @change="emit('update:modelValue', value ?? '')"
    />
    <label :for="inputId" class="label">{{ label }}</label>
  </span>
</template>

<style scoped>
input[type=radio]{appearance:none;-webkit-appearance:none;-moz-appearance:none;background:0;border:none;margin:0;opacity:0;position:fixed}input[type=radio]+label{align-items:center;display:inline-flex;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;margin-left:20px;position:relative}input[type=radio]+label:before{background:#f6f6f6;border:1px solid #8e8f8f;border-radius:50%;box-shadow:inset 0 0 0 1.5px #f4f4f4,inset 1px 1px 0 1.5px #aeaeae,inset -1px 0 0 1.5px #ddd,inset 3px 3px 6px #ccc;box-sizing:border-box;content:"";display:inline-block;height:14px;left:-20px;margin-right:6px;position:absolute;top:0;transition:.4s;width:14px}input[type=radio]+label:hover:before{border-color:#3c7fb1;box-shadow:inset 0 0 0 1.5px #def9fa,inset 1px 1px 0 1.5px #79c6f9,inset -1px -1px 0 1.5px #c6e9fc,inset 3px 3px 6px #b1dffd}input[type=radio]:checked+label:after{background:#7cd3eb;border:1.5px solid #27506d;border-radius:50%;box-shadow:inset -1px -1px 0 .5px #16638f,inset -1px -1px 0 1px #1985c0;box-sizing:border-box;content:"";display:block;height:8px;left:-17px;position:absolute;top:3px;width:8px}input[type=radio]:focus-visible+label{outline:1px dotted #000}input[type=radio]:disabled+label{filter:grayscale(1);opacity:.6}input[type=radio]:disabled:not(:checked)+label:before{opacity:.5}
</style>
```

### 13.7 Vue JavaScript

- [ ] 파일: `registry/vue/radiobutton/RadioButton.js.vue`

```vue
<script setup>
import { useId } from "vue";

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  modelValue: {
    type: String,
    default: "",
  },
  value: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    default: undefined,
  },
  class: {
    type: String,
    default: "",
  },
  id: {
    type: String,
    default: undefined,
  },
});

const emit = defineEmits(["update:modelValue"]);

const generatedId = useId();
const inputId = props.id ?? generatedId;
</script>

<template>
  <span :class="props.class">
    <input
      type="radio"
      :id="inputId"
      class="radio"
      :name="name"
      :value="value"
      :checked="modelValue === value"
      :disabled="disabled"
      @change="emit('update:modelValue', value)"
    />
    <label :for="inputId" class="label">{{ label }}</label>
  </span>
</template>

<style scoped>
input[type=radio]{appearance:none;-webkit-appearance:none;-moz-appearance:none;background:0;border:none;margin:0;opacity:0;position:fixed}input[type=radio]+label{align-items:center;display:inline-flex;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;margin-left:20px;position:relative}input[type=radio]+label:before{background:#f6f6f6;border:1px solid #8e8f8f;border-radius:50%;box-shadow:inset 0 0 0 1.5px #f4f4f4,inset 1px 1px 0 1.5px #aeaeae,inset -1px 0 0 1.5px #ddd,inset 3px 3px 6px #ccc;box-sizing:border-box;content:"";display:inline-block;height:14px;left:-20px;margin-right:6px;position:absolute;top:0;transition:.4s;width:14px}input[type=radio]+label:hover:before{border-color:#3c7fb1;box-shadow:inset 0 0 0 1.5px #def9fa,inset 1px 1px 0 1.5px #79c6f9,inset -1px -1px 0 1.5px #c6e9fc,inset 3px 3px 6px #b1dffd}input[type=radio]:checked+label:after{background:#7cd3eb;border:1.5px solid #27506d;border-radius:50%;box-shadow:inset -1px -1px 0 .5px #16638f,inset -1px -1px 0 1px #1985c0;box-sizing:border-box;content:"";display:block;height:8px;left:-17px;position:absolute;top:3px;width:8px}input[type=radio]:focus-visible+label{outline:1px dotted #000}input[type=radio]:disabled+label{filter:grayscale(1);opacity:.6}input[type=radio]:disabled:not(:checked)+label:before{opacity:.5}
</style>
```

### 검증

```bash
ls -la registry/react/radiobutton/ registry/svelte/radiobutton/ registry/vue/radiobutton/
```

**예상 출력:**
```
registry/react/radiobutton/:
radiobutton.tsx  radiobutton.jsx

registry/svelte/radiobutton/:
RadioButton.svelte  RadioButton.js.svelte

registry/vue/radiobutton/:
RadioButton.vue  RadioButton.js.vue
```

---

## Task 14: GroupBox 컴포넌트

> React TS/JS, Svelte TS/JS, Vue TS/JS + CSS

### 14.1 CSS (이미 Task 3에서 생성)

파일: `registry/css/groupbox.css` (Task 3.6 참조)

### 14.2 React TypeScript

- [ ] 파일: `registry/react/groupbox/groupbox.tsx`

```tsx
import React from "react";
import styles from "../css/groupbox.module.css";

interface GroupBoxProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  legend?: string;
}

export function GroupBox({ legend, className, children, ...props }: GroupBoxProps) {
  return (
    <fieldset
      className={`${styles.groupbox} ${className ?? ""}`}
      {...props}
    >
      {legend && <legend className={styles.legend}>{legend}</legend>}
      {children}
    </fieldset>
  );
}
```

### 14.3 React JavaScript

- [ ] 파일: `registry/react/groupbox/groupbox.jsx`

```jsx
import React from "react";
import styles from "../css/groupbox.module.css";

export function GroupBox({ legend, className, children, ...props }) {
  return (
    <fieldset
      className={`${styles.groupbox} ${className ?? ""}`}
      {...props}
    >
      {legend && <legend className={styles.legend}>{legend}</legend>}
      {children}
    </fieldset>
  );
}
```

### 14.4 Svelte TypeScript

- [ ] 파일: `registry/svelte/groupbox/GroupBox.svelte`

```svelte
<script lang="ts">
  import type { HTMLFieldsetAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";

  interface Props extends HTMLFieldsetAttributes {
    legend?: string;
    children?: Snippet;
    class?: string;
  }

  let { legend, children, class: className, ...rest }: Props = $props();
</script>

<fieldset class="groupbox {className ?? ''}" {...rest}>
  {#if legend}
    <legend class="legend">{legend}</legend>
  {/if}
  {#if children}
    {@render children()}
  {/if}
</fieldset>

<style>
fieldset{border:1px solid #cdd7db;border-radius:3px;box-shadow:inset 0 0 0 1px #fff;margin:0;padding:8px 10px 10px}fieldset legend{font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif}.group,fieldset{display:flex;flex-direction:column;gap:6px}.group+.group{margin-top:6px}
</style>
```

### 14.5 Svelte JavaScript

- [ ] 파일: `registry/svelte/groupbox/GroupBox.js.svelte`

```svelte
<script>
  let { legend, children, class: className, ...rest } = $props();
</script>

<fieldset class="groupbox {className ?? ''}" {...rest}>
  {#if legend}
    <legend class="legend">{legend}</legend>
  {/if}
  {#if children}
    {@render children()}
  {/if}
</fieldset>

<style>
fieldset{border:1px solid #cdd7db;border-radius:3px;box-shadow:inset 0 0 0 1px #fff;margin:0;padding:8px 10px 10px}fieldset legend{font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif}.group,fieldset{display:flex;flex-direction:column;gap:6px}.group+.group{margin-top:6px}
</style>
```

### 14.6 Vue TypeScript

- [ ] 파일: `registry/vue/groupbox/GroupBox.vue`

```vue
<script setup lang="ts">
interface Props {
  legend?: string;
  class?: string;
}

const { legend, class: className } = defineProps<Props>();
</script>

<template>
  <fieldset :class="['groupbox', className]">
    <legend v-if="legend" class="legend">{{ legend }}</legend>
    <slot />
  </fieldset>
</template>

<style scoped>
fieldset{border:1px solid #cdd7db;border-radius:3px;box-shadow:inset 0 0 0 1px #fff;margin:0;padding:8px 10px 10px}fieldset legend{font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif}.group,fieldset{display:flex;flex-direction:column;gap:6px}.group+.group{margin-top:6px}
</style>
```

### 14.7 Vue JavaScript

- [ ] 파일: `registry/vue/groupbox/GroupBox.js.vue`

```vue
<script setup>
const props = defineProps({
  legend: {
    type: String,
    default: undefined,
  },
  class: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <fieldset :class="['groupbox', props.class]">
    <legend v-if="legend" class="legend">{{ legend }}</legend>
    <slot />
  </fieldset>
</template>

<style scoped>
fieldset{border:1px solid #cdd7db;border-radius:3px;box-shadow:inset 0 0 0 1px #fff;margin:0;padding:8px 10px 10px}fieldset legend{font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif}.group,fieldset{display:flex;flex-direction:column;gap:6px}.group+.group{margin-top:6px}
</style>
```

### 검증

```bash
ls -la registry/react/groupbox/ registry/svelte/groupbox/ registry/vue/groupbox/
```

**예상 출력:**
```
registry/react/groupbox/:
groupbox.tsx  groupbox.jsx

registry/svelte/groupbox/:
GroupBox.svelte  GroupBox.js.svelte

registry/vue/groupbox/:
GroupBox.vue  GroupBox.js.vue
```

---

## Task 15: 전체 통합 테스트 (E2E)

> init -> add -> list -> remove 전체 플로우 검증

- [ ] 파일: `packages/cli/src/__tests__/e2e.test.ts`

```ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import os from "os";

describe("E2E: init -> add -> list -> remove", () => {
  let tmpDir: string;
  let registryDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "win7ui-e2e-"));

    // Simulate user project with React
    await fs.writeJson(path.join(tmpDir, "package.json"), {
      name: "test-project",
      dependencies: { react: "^18.0.0", "react-dom": "^18.0.0" },
    });

    // Use real registry from project
    registryDir = path.resolve(__dirname, "../../../../registry");
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it("full workflow: init -> add button -> add textbox -> list -> remove button -> list", async () => {
    // ---- Step 1: init ----
    const { runInit } = await import("../commands/init.js");
    await runInit({
      cwd: tmpDir,
      framework: "react",
      typescript: true,
      componentDir: undefined,
      cssDir: undefined,
      nonInteractive: true,
    });

    // Verify config created
    const config = await fs.readJson(path.join(tmpDir, "win7ui.config.json"));
    expect(config.framework).toBe("react");
    expect(config.typescript).toBe(true);

    // ---- Step 2: add button ----
    const { runAdd } = await import("../commands/add.js");
    await runAdd({
      cwd: tmpDir,
      components: ["button"],
      registryPath: registryDir,
      overwrite: false,
      nonInteractive: true,
    });

    // Verify button installed
    const buttonPath = path.join(tmpDir, "src/components/win7ui", "Button.tsx");
    expect(await fs.pathExists(buttonPath)).toBe(true);

    const buttonCssPath = path.join(
      tmpDir,
      "src/components/win7ui/css",
      "button.module.css"
    );
    expect(await fs.pathExists(buttonCssPath)).toBe(true);

    const baseCssPath = path.join(
      tmpDir,
      "src/components/win7ui/css",
      "base.css"
    );
    expect(await fs.pathExists(baseCssPath)).toBe(true);

    // ---- Step 3: add textbox ----
    await runAdd({
      cwd: tmpDir,
      components: ["textbox"],
      registryPath: registryDir,
      overwrite: false,
      nonInteractive: true,
    });

    const textboxPath = path.join(
      tmpDir,
      "src/components/win7ui",
      "Textbox.tsx"
    );
    expect(await fs.pathExists(textboxPath)).toBe(true);

    // ---- Step 4: list ----
    const { runList } = await import("../commands/list.js");
    const listResult = await runList({
      cwd: tmpDir,
      registryPath: registryDir,
    });

    const buttonStatus = listResult.find((c) => c.name === "button");
    expect(buttonStatus?.installed).toBe(true);

    const textboxStatus = listResult.find((c) => c.name === "textbox");
    expect(textboxStatus?.installed).toBe(true);

    // Verify barrel file contains both
    const barrelPath = path.join(
      tmpDir,
      "src/components/win7ui",
      "index.ts"
    );
    const barrelContent = await fs.readFile(barrelPath, "utf-8");
    expect(barrelContent).toContain("Button");
    expect(barrelContent).toContain("Textbox");

    // ---- Step 5: remove button ----
    const { runRemove } = await import("../commands/remove.js");
    await runRemove({
      cwd: tmpDir,
      components: ["button"],
      force: false,
      nonInteractive: true,
    });

    // Verify button removed
    expect(await fs.pathExists(buttonPath)).toBe(false);
    expect(await fs.pathExists(buttonCssPath)).toBe(false);

    // Verify textbox still exists
    expect(await fs.pathExists(textboxPath)).toBe(true);

    // ---- Step 6: list after removal ----
    const listResult2 = await runList({
      cwd: tmpDir,
      registryPath: registryDir,
    });

    const buttonStatus2 = listResult2.find((c) => c.name === "button");
    expect(buttonStatus2?.installed).toBe(false);

    const textboxStatus2 = listResult2.find((c) => c.name === "textbox");
    expect(textboxStatus2?.installed).toBe(true);

    // Verify barrel file updated
    const barrelContent2 = await fs.readFile(barrelPath, "utf-8");
    expect(barrelContent2).not.toContain("Button");
    expect(barrelContent2).toContain("Textbox");
  });

  it("should handle Svelte framework", async () => {
    const { runInit } = await import("../commands/init.js");
    await runInit({
      cwd: tmpDir,
      framework: "svelte",
      typescript: true,
      componentDir: undefined,
      cssDir: undefined,
      nonInteractive: true,
    });

    const { runAdd } = await import("../commands/add.js");
    await runAdd({
      cwd: tmpDir,
      components: ["button"],
      registryPath: registryDir,
      overwrite: false,
      nonInteractive: true,
    });

    // Svelte TS component: Button.svelte
    const svelteButtonPath = path.join(
      tmpDir,
      "src/components/win7ui",
      "Button.svelte"
    );
    expect(await fs.pathExists(svelteButtonPath)).toBe(true);

    // Svelte does NOT have separate CSS module files (CSS is in <style>)
    // base.css is still installed
    const baseCssPath = path.join(
      tmpDir,
      "src/components/win7ui/css",
      "base.css"
    );
    expect(await fs.pathExists(baseCssPath)).toBe(true);
  });

  it("should handle Vue framework with JavaScript", async () => {
    const { runInit } = await import("../commands/init.js");
    await runInit({
      cwd: tmpDir,
      framework: "vue",
      typescript: false,
      componentDir: undefined,
      cssDir: undefined,
      nonInteractive: true,
    });

    const { runAdd } = await import("../commands/add.js");
    await runAdd({
      cwd: tmpDir,
      components: ["checkbox"],
      registryPath: registryDir,
      overwrite: false,
      nonInteractive: true,
    });

    // Vue JS component: Checkbox.js.vue
    const vueCheckboxPath = path.join(
      tmpDir,
      "src/components/win7ui",
      "Checkbox.js.vue"
    );
    expect(await fs.pathExists(vueCheckboxPath)).toBe(true);
  });

  it("should add multiple components at once", async () => {
    const { runInit } = await import("../commands/init.js");
    await runInit({
      cwd: tmpDir,
      framework: "react",
      typescript: true,
      componentDir: undefined,
      cssDir: undefined,
      nonInteractive: true,
    });

    const { runAdd } = await import("../commands/add.js");
    await runAdd({
      cwd: tmpDir,
      components: ["button", "textbox", "checkbox", "radiobutton", "groupbox"],
      registryPath: registryDir,
      overwrite: false,
      nonInteractive: true,
    });

    // All 5 components should be installed
    const componentDir = path.join(tmpDir, "src/components/win7ui");
    expect(await fs.pathExists(path.join(componentDir, "Button.tsx"))).toBe(true);
    expect(await fs.pathExists(path.join(componentDir, "Textbox.tsx"))).toBe(true);
    expect(await fs.pathExists(path.join(componentDir, "Checkbox.tsx"))).toBe(true);
    expect(await fs.pathExists(path.join(componentDir, "Radiobutton.tsx"))).toBe(true);
    expect(await fs.pathExists(path.join(componentDir, "Groupbox.tsx"))).toBe(true);

    // Barrel file should contain all 5
    const barrelContent = await fs.readFile(
      path.join(componentDir, "index.ts"),
      "utf-8"
    );
    expect(barrelContent).toContain("Button");
    expect(barrelContent).toContain("Textbox");
    expect(barrelContent).toContain("Checkbox");
    expect(barrelContent).toContain("Radiobutton");
    expect(barrelContent).toContain("Groupbox");
  });
});
```

### 테스트 실행

```bash
cd win7ui
pnpm --filter win7ui test -- --reporter=verbose src/__tests__/e2e.test.ts
```

**예상 출력:**
```
 ✓ E2E: init -> add -> list -> remove > full workflow: init -> add button -> add textbox -> list -> remove button -> list
 ✓ E2E: init -> add -> list -> remove > should handle Svelte framework
 ✓ E2E: init -> add -> list -> remove > should handle Vue framework with JavaScript
 ✓ E2E: init -> add -> list -> remove > should add multiple components at once

 4 passed
```

---

## 전체 빌드 및 검증 명령어

모든 Task 완료 후 실행:

```bash
cd win7ui

# 1. 의존성 설치
pnpm install

# 2. 레지스트리 빌드 (index.json + component JSONs 생성)
pnpm build-registry

# 3. CSS 주입 (Svelte/Vue 컴포넌트에 CSS 반영)
pnpm inject-css

# 4. CLI 빌드
pnpm --filter win7ui build

# 5. 전체 테스트
pnpm --filter win7ui test

# 6. 구조 확인
find registry/ -type f | sort
find packages/cli/src/ -type f -name "*.ts" | sort
```

**예상 파일 트리:**
```
registry/
├── components/
│   ├── button.json
│   ├── checkbox.json
│   ├── groupbox.json
│   ├── radiobutton.json
│   └── textbox.json
├── css/
│   ├── base.css
│   ├── button.css
│   ├── checkbox.css
│   ├── groupbox.css
│   ├── radiobutton.css
│   └── textbox.css
├── index.json
├── react/
│   ├── button/
│   │   ├── button.jsx
│   │   └── button.tsx
│   ├── checkbox/
│   │   ├── checkbox.jsx
│   │   └── checkbox.tsx
│   ├── groupbox/
│   │   ├── groupbox.jsx
│   │   └── groupbox.tsx
│   ├── radiobutton/
│   │   ├── radiobutton.jsx
│   │   └── radiobutton.tsx
│   └── textbox/
│       ├── textbox.jsx
│       └── textbox.tsx
├── svelte/
│   ├── button/
│   │   ├── Button.js.svelte
│   │   └── Button.svelte
│   ├── checkbox/
│   │   ├── Checkbox.js.svelte
│   │   └── Checkbox.svelte
│   ├── groupbox/
│   │   ├── GroupBox.js.svelte
│   │   └── GroupBox.svelte
│   ├── radiobutton/
│   │   ├── RadioButton.js.svelte
│   │   └── RadioButton.svelte
│   └── textbox/
│       ├── TextBox.js.svelte
│       └── TextBox.svelte
└── vue/
    ├── button/
    │   ├── Button.js.vue
    │   └── Button.vue
    ├── checkbox/
    │   ├── Checkbox.js.vue
    │   └── Checkbox.vue
    ├── groupbox/
    │   ├── GroupBox.js.vue
    │   └── GroupBox.vue
    ├── radiobutton/
    │   ├── RadioButton.js.vue
    │   └── RadioButton.vue
    └── textbox/
        ├── TextBox.js.vue
        └── TextBox.vue
```

**총 파일 수:**
- CSS 파일: 6개 (base + 5 컴포넌트)
- Component JSON: 5개
- Index JSON: 1개
- React 컴포넌트: 10개 (5 x TS/JS)
- Svelte 컴포넌트: 10개 (5 x TS/JS)
- Vue 컴포넌트: 10개 (5 x TS/JS)
- CLI 소스 파일: ~12개
- 테스트 파일: 5개
- 설정 파일: ~8개
- 스크립트 파일: 2개
