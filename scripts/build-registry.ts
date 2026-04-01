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
  {
    name: "dropdown",
    displayName: "Dropdown",
    description: "Windows 7 스타일 드롭다운 선택 컴포넌트",
    dependencies: [],
  },
  {
    name: "combobox",
    displayName: "ComboBox",
    description: "Windows 7 스타일 콤보박스 (텍스트 입력 + 드롭다운 목록)",
    dependencies: [],
  },
  {
    name: "listbox",
    displayName: "ListBox",
    description: "Windows 7 스타일 스크롤 가능한 선택 목록",
    dependencies: [],
  },
  {
    name: "listview",
    displayName: "ListView",
    description: "Windows 7 스타일 테이블 기반 데이터 목록",
    dependencies: [],
  },
  {
    name: "searchbox",
    displayName: "SearchBox",
    description: "Windows 7 스타일 검색 입력 컴포넌트",
    dependencies: [],
  },
  {
    name: "tabs",
    displayName: "Tabs",
    description: "Windows 7 스타일 탭 내비게이션",
    dependencies: [],
  },
  {
    name: "menu",
    displayName: "Menu",
    description: "Windows 7 스타일 컨텍스트 메뉴",
    dependencies: [],
  },
  {
    name: "menubar",
    displayName: "MenuBar",
    description: "Windows 7 스타일 수평 메뉴 바",
    dependencies: ["menu"],
  },
  {
    name: "collapse",
    displayName: "Collapse",
    description: "Windows 7 스타일 접기/펼치기",
    dependencies: [],
  },
  {
    name: "progressbar",
    displayName: "ProgressBar",
    description: "Windows 7 스타일 프로그래스 바",
    dependencies: [],
  },
  {
    name: "slider",
    displayName: "Slider",
    description: "Windows 7 스타일 슬라이더 (input[type=range]). 수평/수직 모드, box indicator 변형 지원.",
    dependencies: [],
  },
  {
    name: "spinner",
    displayName: "Spinner",
    description: "Windows 7 스타일 로딩 스피너. 정적/애니메이션 모드, 크기 변형 지원.",
    dependencies: [],
  },
  {
    name: "treeview",
    displayName: "TreeView",
    description: "Windows 7 스타일 트리뷰. 재귀 트리 구조, container/collapse-button/connector 변형 지원.",
    dependencies: [],
  },
  {
    name: "window",
    displayName: "Window",
    description: "Windows 7 윈도우 프레임. TitleBar, WindowBody, StatusBar, GlassFrame, DialogBox 하위 컴포넌트 포함.",
    dependencies: [],
  },
  {
    name: "scrollbar",
    displayName: "Scrollbar",
    description: "Windows 7 스타일 커스텀 스크롤바. 적용 영역에 스크롤바 CSS를 부여하는 래퍼 컴포넌트.",
    dependencies: [],
  },
  {
    name: "balloon",
    displayName: "Balloon",
    description: "Windows 7 스타일 말풍선 툴팁. 위치 변형(top/bottom) 및 화살표 정렬(left/right) 지원.",
    dependencies: [],
  },
  {
    name: "typography",
    displayName: "Typography",
    description: "Windows 7 스타일 기본 텍스트 스타일. Link, Instruction, Header 컴포넌트 제공.",
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
