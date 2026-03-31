# Batch 4: Advanced Inputs (Slider, Spinner, TreeView) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Slider, Spinner, TreeView 3개 고급 입력 컴포넌트를 React/Svelte/Vue (TS/JS) 6가지 변형으로 구현하고, CSS 추출 및 JSON 메타데이터를 완성한다.
**Architecture:** 7.css 원본 CSS를 `registry/css/`에 단일 소스로 관리하며, React는 CSS Modules, Svelte/Vue는 `inject-css.ts`를 통해 `<style>` 블록에 자동 주입한다. TreeView는 Batch 3의 collapse 컴포넌트와 접기/펼치기 로직을 공유하며, Compound Component 패턴(TreeView + TreeItem)으로 재귀 트리를 구성한다.
**Tech Stack:** React 18+, Svelte 5 (runes), Vue 3 (Composition API), TypeScript, CSS Modules, Vitest

---

## 전제 조건

- Batch 1 인프라 완료: 모노레포, CLI, registry 스키마, base.css, CSS 주입 파이프라인, 프레임워크별 템플릿
- Batch 3 완료: collapse 컴포넌트 (`details/summary` 기반 접기/펼치기)
- `scripts/inject-css.ts` 동작 확인 완료
- `scripts/build-registry.ts` 동작 확인 완료

---

## Task 1: Slider CSS 추출 + JSON 메타데이터

### 1.1 CSS 추출

- [ ] 7.css npm 패키지에서 slider 관련 CSS 추출

```bash
# 7.css 패키지에서 slider CSS 추출
cd /Users/kim/projects/systemcss
node -e "
const fs = require('fs');
const path = require('path');
// 7.css dist/gui/ 에서 slider 관련 CSS 찾기
const sevenCssPath = require.resolve('7.css/dist/gui/slider.css');
const css = fs.readFileSync(sevenCssPath, 'utf8');
fs.mkdirSync('registry/css', { recursive: true });
fs.writeFileSync('registry/css/slider.css', css);
console.log('slider.css extracted:', css.length, 'bytes');
"
```

- [ ] 추출이 안 되는 경우 `7.css`의 minified 전체 CSS에서 `input[type=range]` 관련 규칙을 수동 추출

```bash
# 대안: 7.css 전체 CSS에서 slider 부분 수동 추출
# sync-7css.ts 스크립트 활용
pnpm sync-7css --component slider
```

- [ ] `registry/css/slider.css` 파일 생성 확인

slider.css에 포함되어야 하는 주요 CSS 규칙:

```css
/* registry/css/slider.css */

/* 공통 input[type=range] 스타일 */
input[type="range"] {
  -webkit-appearance: none;
  width: 100%;
  background: transparent;
  height: 21px;
}

/* Webkit Track */
input[type="range"]::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: linear-gradient(
    to bottom,
    #dedfe0 0%,
    #fbfbfb 100%
  );
  border: 1px solid #8e8f8f;
  border-radius: 0;
}

/* Webkit Thumb */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 11px;
  width: 11px;
  margin-top: -4px;
  /* base64 인코딩된 PNG thumb 이미지 - 7.css 원본에서 복사 */
  background: url("data:image/png;base64,...") no-repeat center;
  cursor: pointer;
}

/* Firefox Track */
input[type="range"]::-moz-range-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: linear-gradient(
    to bottom,
    #dedfe0 0%,
    #fbfbfb 100%
  );
  border: 1px solid #8e8f8f;
}

/* Firefox Thumb */
input[type="range"]::-moz-range-thumb {
  height: 11px;
  width: 11px;
  border: none;
  /* base64 인코딩된 PNG thumb 이미지 - 7.css 원본에서 복사 */
  background: url("data:image/png;base64,...") no-repeat center;
  cursor: pointer;
}

/* 수직 모드 */
input[type="range"].vertical {
  writing-mode: vertical-lr;
  direction: rtl;
  width: 21px;
  height: 160px;
}

/* has-box-indicator 변형 */
input[type="range"].has-box-indicator::-webkit-slider-thumb {
  height: 21px;
  width: 11px;
  border-radius: 0;
  /* box indicator용 base64 PNG - 7.css 원본에서 복사 */
  background: url("data:image/png;base64,...") no-repeat center;
}

input[type="range"].has-box-indicator::-moz-range-thumb {
  height: 21px;
  width: 11px;
  border-radius: 0;
  background: url("data:image/png;base64,...") no-repeat center;
}

/* 비활성화 상태 */
input[type="range"]:disabled::-webkit-slider-thumb {
  /* disabled용 base64 PNG - 7.css 원본에서 복사 */
  background: url("data:image/png;base64,...") no-repeat center;
}

input[type="range"]:disabled::-moz-range-thumb {
  background: url("data:image/png;base64,...") no-repeat center;
}
```

> **참고:** 위 CSS의 `base64,...` 부분은 실제 7.css 패키지의 원본 base64 인코딩된 PNG 이미지로 교체해야 한다. `pnpm sync-7css` 스크립트로 자동 추출하거나 `node_modules/7.css/dist/` 에서 직접 복사한다.

### 1.2 JSON 메타데이터

- [ ] `registry/components/slider.json` 생성

```json
{
  "name": "slider",
  "displayName": "Slider",
  "description": "Windows 7 스타일 슬라이더 (input[type=range]). 수평/수직 모드, box indicator 변형 지원.",
  "dependencies": [],
  "css": ["css/slider.css"],
  "files": {
    "react": {
      "ts": ["react/slider/slider.tsx"],
      "js": ["react/slider/slider.jsx"]
    },
    "svelte": {
      "ts": ["svelte/slider/Slider.svelte"],
      "js": ["svelte/slider/Slider.js.svelte"]
    },
    "vue": {
      "ts": ["vue/slider/Slider.vue"],
      "js": ["vue/slider/Slider.js.vue"]
    }
  }
}
```

### 1.3 검증

- [ ] CSS 파일이 base64 이미지를 정상 포함하는지 확인
- [ ] JSON 스키마가 기존 컴포넌트(button.json 등)와 일관적인지 확인

```bash
# registry 정합성 검증
pnpm build-registry
```

- [ ] 커밋

```bash
git add registry/css/slider.css registry/components/slider.json
git commit -m "feat(slider): extract CSS from 7.css and add component metadata"
```

---

## Task 2: Slider React TS/JS

### 2.1 테스트 먼저 작성 (TDD)

- [ ] `registry/react/slider/__tests__/slider.test.tsx` 작성

```tsx
// registry/react/slider/__tests__/slider.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Slider } from "../slider";

describe("Slider", () => {
  it("renders input[type=range] element", () => {
    render(<Slider aria-label="volume" />);
    const slider = screen.getByRole("slider");
    expect(slider).toBeDefined();
    expect(slider.getAttribute("type")).toBe("range");
  });

  it("applies default horizontal orientation", () => {
    render(<Slider aria-label="volume" />);
    const slider = screen.getByRole("slider");
    expect(slider.className).not.toContain("vertical");
  });

  it("applies vertical orientation class", () => {
    render(<Slider aria-label="volume" orientation="vertical" />);
    const slider = screen.getByRole("slider");
    expect(slider.className).toContain("vertical");
  });

  it("applies box-indicator variant class", () => {
    render(<Slider aria-label="volume" variant="box-indicator" />);
    const slider = screen.getByRole("slider");
    expect(slider.className).toContain("hasBoxIndicator");
  });

  it("forwards min, max, step, value props", () => {
    render(
      <Slider aria-label="volume" min={0} max={100} step={5} defaultValue={50} />
    );
    const slider = screen.getByRole("slider") as HTMLInputElement;
    expect(slider.min).toBe("0");
    expect(slider.max).toBe("100");
    expect(slider.step).toBe("5");
    expect(slider.value).toBe("50");
  });

  it("handles disabled state", () => {
    render(<Slider aria-label="volume" disabled />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveProperty("disabled", true);
  });

  it("calls onChange handler", () => {
    const handleChange = vi.fn();
    render(<Slider aria-label="volume" onChange={handleChange} />);
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "75" } });
    expect(handleChange).toHaveBeenCalled();
  });

  it("merges custom className", () => {
    render(<Slider aria-label="volume" className="my-custom" />);
    const slider = screen.getByRole("slider");
    expect(slider.className).toContain("my-custom");
  });
});
```

- [ ] 테스트 실행 - 실패 확인

```bash
cd /Users/kim/projects/systemcss
pnpm vitest run registry/react/slider/__tests__/slider.test.tsx
```

### 2.2 React TypeScript 구현

- [ ] `registry/react/slider/slider.tsx` 작성

```tsx
// registry/react/slider/slider.tsx
import React from "react";
import styles from "../css/slider.module.css";

type SliderOrientation = "horizontal" | "vertical";
type SliderVariant = "default" | "box-indicator";

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  orientation?: SliderOrientation;
  variant?: SliderVariant;
}

export function Slider({
  orientation = "horizontal",
  variant = "default",
  className,
  ...props
}: SliderProps) {
  const classNames = [
    styles.slider,
    orientation === "vertical" ? styles.vertical : "",
    variant === "box-indicator" ? styles.hasBoxIndicator : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return <input type="range" className={classNames} {...props} />;
}
```

- [ ] 테스트 실행 - 통과 확인

```bash
pnpm vitest run registry/react/slider/__tests__/slider.test.tsx
```

### 2.3 React JavaScript 구현

- [ ] `registry/react/slider/slider.jsx` 작성

```jsx
// registry/react/slider/slider.jsx
import React from "react";
import styles from "../css/slider.module.css";

/**
 * @param {Object} props
 * @param {"horizontal" | "vertical"} [props.orientation="horizontal"]
 * @param {"default" | "box-indicator"} [props.variant="default"]
 * @param {string} [props.className]
 */
export function Slider({
  orientation = "horizontal",
  variant = "default",
  className,
  ...props
}) {
  const classNames = [
    styles.slider,
    orientation === "vertical" ? styles.vertical : "",
    variant === "box-indicator" ? styles.hasBoxIndicator : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return <input type="range" className={classNames} {...props} />;
}
```

### 2.4 커밋

- [ ] 커밋

```bash
git add registry/react/slider/
git commit -m "feat(slider): implement React TS/JS component with orientation and variant props"
```

---

## Task 3: Slider Svelte TS/JS

### 3.1 테스트 먼저 작성 (TDD)

- [ ] `registry/svelte/slider/__tests__/Slider.test.ts` 작성

```ts
// registry/svelte/slider/__tests__/Slider.test.ts
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte";
import Slider from "../Slider.svelte";

describe("Slider (Svelte)", () => {
  it("renders input[type=range]", () => {
    const { container } = render(Slider, {
      props: { "aria-label": "volume" },
    });
    const input = container.querySelector('input[type="range"]');
    expect(input).not.toBeNull();
  });

  it("applies vertical class for vertical orientation", () => {
    const { container } = render(Slider, {
      props: { orientation: "vertical", "aria-label": "volume" },
    });
    const input = container.querySelector("input");
    expect(input?.classList.contains("vertical")).toBe(true);
  });

  it("applies has-box-indicator class for box-indicator variant", () => {
    const { container } = render(Slider, {
      props: { variant: "box-indicator", "aria-label": "volume" },
    });
    const input = container.querySelector("input");
    expect(input?.classList.contains("has-box-indicator")).toBe(true);
  });

  it("forwards min, max, step props", () => {
    const { container } = render(Slider, {
      props: { min: 0, max: 100, step: 5, "aria-label": "volume" },
    });
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.min).toBe("0");
    expect(input.max).toBe("100");
    expect(input.step).toBe("5");
  });

  it("handles disabled state", () => {
    const { container } = render(Slider, {
      props: { disabled: true, "aria-label": "volume" },
    });
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("merges custom class", () => {
    const { container } = render(Slider, {
      props: { class: "my-custom", "aria-label": "volume" },
    });
    const input = container.querySelector("input");
    expect(input?.classList.contains("my-custom")).toBe(true);
  });
});
```

- [ ] 테스트 실행 - 실패 확인

```bash
pnpm vitest run registry/svelte/slider/__tests__/Slider.test.ts
```

### 3.2 Svelte TypeScript 구현

- [ ] `registry/svelte/slider/Slider.svelte` 작성

```svelte
<!-- registry/svelte/slider/Slider.svelte -->
<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  interface Props extends HTMLInputAttributes {
    orientation?: "horizontal" | "vertical";
    variant?: "default" | "box-indicator";
    class?: string;
  }

  let {
    orientation = "horizontal",
    variant = "default",
    class: className,
    ...rest
  }: Props = $props();
</script>

<input
  type="range"
  class="slider {orientation === 'vertical' ? 'vertical' : ''} {variant === 'box-indicator' ? 'has-box-indicator' : ''} {className ?? ''}"
  {...rest}
/>

<style>
  /* inject-css.ts가 css/slider.css 내용을 여기에 자동 주입 */
</style>
```

- [ ] 테스트 실행 - 통과 확인

```bash
pnpm vitest run registry/svelte/slider/__tests__/Slider.test.ts
```

### 3.3 Svelte JavaScript 구현

- [ ] `registry/svelte/slider/Slider.js.svelte` 작성

```svelte
<!-- registry/svelte/slider/Slider.js.svelte -->
<script>
  /**
   * @type {{ orientation?: "horizontal" | "vertical", variant?: "default" | "box-indicator", class?: string, [key: string]: any }}
   */
  let {
    orientation = "horizontal",
    variant = "default",
    class: className,
    ...rest
  } = $props();
</script>

<input
  type="range"
  class="slider {orientation === 'vertical' ? 'vertical' : ''} {variant === 'box-indicator' ? 'has-box-indicator' : ''} {className ?? ''}"
  {...rest}
/>

<style>
  /* inject-css.ts가 css/slider.css 내용을 여기에 자동 주입 */
</style>
```

### 3.4 CSS 주입 실행

- [ ] inject-css.ts로 Svelte 파일에 CSS 자동 주입

```bash
pnpm inject-css --component slider --framework svelte
```

### 3.5 커밋

- [ ] 커밋

```bash
git add registry/svelte/slider/
git commit -m "feat(slider): implement Svelte TS/JS component with CSS injection"
```

---

## Task 4: Slider Vue TS/JS

### 4.1 테스트 먼저 작성 (TDD)

- [ ] `registry/vue/slider/__tests__/Slider.test.ts` 작성

```ts
// registry/vue/slider/__tests__/Slider.test.ts
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Slider from "../Slider.vue";

describe("Slider (Vue)", () => {
  it("renders input[type=range]", () => {
    const wrapper = mount(Slider, {
      props: { "aria-label": "volume" },
    });
    const input = wrapper.find('input[type="range"]');
    expect(input.exists()).toBe(true);
  });

  it("applies vertical class for vertical orientation", () => {
    const wrapper = mount(Slider, {
      props: { orientation: "vertical", "aria-label": "volume" },
    });
    const input = wrapper.find("input");
    expect(input.classes()).toContain("vertical");
  });

  it("applies has-box-indicator class for box-indicator variant", () => {
    const wrapper = mount(Slider, {
      props: { variant: "box-indicator", "aria-label": "volume" },
    });
    const input = wrapper.find("input");
    expect(input.classes()).toContain("has-box-indicator");
  });

  it("forwards min, max, step props", () => {
    const wrapper = mount(Slider, {
      props: { min: 0, max: 100, step: 5, "aria-label": "volume" },
    });
    const input = wrapper.find("input");
    expect(input.attributes("min")).toBe("0");
    expect(input.attributes("max")).toBe("100");
    expect(input.attributes("step")).toBe("5");
  });

  it("handles disabled state", () => {
    const wrapper = mount(Slider, {
      props: { disabled: true, "aria-label": "volume" },
    });
    const input = wrapper.find("input");
    expect(input.attributes("disabled")).toBeDefined();
  });

  it("emits update:modelValue on input", async () => {
    const wrapper = mount(Slider, {
      props: { modelValue: 50, "aria-label": "volume" },
    });
    const input = wrapper.find("input");
    await input.setValue("75");
    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
  });

  it("merges custom class", () => {
    const wrapper = mount(Slider, {
      props: { class: "my-custom", "aria-label": "volume" },
    });
    const input = wrapper.find("input");
    expect(input.classes()).toContain("my-custom");
  });
});
```

- [ ] 테스트 실행 - 실패 확인

```bash
pnpm vitest run registry/vue/slider/__tests__/Slider.test.ts
```

### 4.2 Vue TypeScript 구현

- [ ] `registry/vue/slider/Slider.vue` 작성

```vue
<!-- registry/vue/slider/Slider.vue -->
<script setup lang="ts">
interface Props {
  orientation?: "horizontal" | "vertical";
  variant?: "default" | "box-indicator";
  modelValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  orientation: "horizontal",
  variant: "default",
});

const emit = defineEmits<{
  "update:modelValue": [value: number];
}>();

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", Number(target.value));
}
</script>

<template>
  <input
    type="range"
    :class="[
      'slider',
      orientation === 'vertical' && 'vertical',
      variant === 'box-indicator' && 'has-box-indicator',
    ]"
    :min="props.min"
    :max="props.max"
    :step="props.step"
    :disabled="props.disabled"
    :value="props.modelValue"
    @input="onInput"
  />
</template>

<style scoped>
  /* inject-css.ts가 css/slider.css 내용을 여기에 자동 주입 */
</style>
```

- [ ] 테스트 실행 - 통과 확인

```bash
pnpm vitest run registry/vue/slider/__tests__/Slider.test.ts
```

### 4.3 Vue JavaScript 구현

- [ ] `registry/vue/slider/Slider.js.vue` 작성

```vue
<!-- registry/vue/slider/Slider.js.vue -->
<script setup>
const props = defineProps({
  orientation: {
    type: String,
    default: "horizontal",
    validator: (v) => ["horizontal", "vertical"].includes(v),
  },
  variant: {
    type: String,
    default: "default",
    validator: (v) => ["default", "box-indicator"].includes(v),
  },
  modelValue: { type: Number, default: undefined },
  min: { type: Number, default: undefined },
  max: { type: Number, default: undefined },
  step: { type: Number, default: undefined },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

function onInput(event) {
  emit("update:modelValue", Number(event.target.value));
}
</script>

<template>
  <input
    type="range"
    :class="[
      'slider',
      orientation === 'vertical' && 'vertical',
      variant === 'box-indicator' && 'has-box-indicator',
    ]"
    :min="props.min"
    :max="props.max"
    :step="props.step"
    :disabled="props.disabled"
    :value="props.modelValue"
    @input="onInput"
  />
</template>

<style scoped>
  /* inject-css.ts가 css/slider.css 내용을 여기에 자동 주입 */
</style>
```

### 4.4 CSS 주입 실행

- [ ] inject-css.ts로 Vue 파일에 CSS 자동 주입

```bash
pnpm inject-css --component slider --framework vue
```

### 4.5 커밋

- [ ] 커밋

```bash
git add registry/vue/slider/
git commit -m "feat(slider): implement Vue TS/JS component with v-model and CSS injection"
```

---

## Task 5: Slider 통합 테스트

### 5.1 전체 프레임워크 테스트 실행

- [ ] React 테스트 실행

```bash
pnpm vitest run registry/react/slider/
```

- [ ] Svelte 테스트 실행

```bash
pnpm vitest run registry/svelte/slider/
```

- [ ] Vue 테스트 실행

```bash
pnpm vitest run registry/vue/slider/
```

### 5.2 Registry 정합성 검증

- [ ] slider.json의 모든 파일 경로가 실제 존재하는지 확인

```bash
pnpm build-registry
node -e "
const meta = require('./registry/components/slider.json');
const fs = require('fs');
const missing = [];

// CSS 파일 검증
meta.css.forEach(f => {
  if (!fs.existsSync('registry/' + f)) missing.push(f);
});

// 프레임워크 파일 검증
for (const [fw, langs] of Object.entries(meta.files)) {
  for (const [lang, files] of Object.entries(langs)) {
    files.forEach(f => {
      if (!fs.existsSync('registry/' + f)) missing.push(f);
    });
  }
}

if (missing.length > 0) {
  console.error('Missing files:', missing);
  process.exit(1);
} else {
  console.log('All slider registry files verified.');
}
"
```

### 5.3 CSS Module 클래스명 일관성 검증

- [ ] React CSS Modules 클래스명과 Svelte/Vue 클래스명 매핑이 올바른지 확인

> React는 `styles.vertical`, `styles.hasBoxIndicator` (CSS Modules camelCase 변환),
> Svelte/Vue는 `vertical`, `has-box-indicator` (원본 CSS 클래스명 직접 사용)

### 5.4 커밋

- [ ] 커밋

```bash
git add -A
git commit -m "test(slider): add integration tests for all frameworks"
```

---

## Task 6: Spinner CSS + JSON + React/Svelte/Vue

### 6.1 CSS 추출

- [ ] 7.css npm 패키지에서 spinner 관련 CSS 추출

```bash
cd /Users/kim/projects/systemcss
node -e "
const fs = require('fs');
const sevenCssPath = require.resolve('7.css/dist/gui/spinner.css');
const css = fs.readFileSync(sevenCssPath, 'utf8');
fs.writeFileSync('registry/css/spinner.css', css);
console.log('spinner.css extracted:', css.length, 'bytes');
"
```

- [ ] `registry/css/spinner.css` 파일 생성 확인

spinner.css에 포함되어야 하는 주요 CSS 규칙:

```css
/* registry/css/spinner.css */

/* 정적 로더 (spinner 정지 상태) */
.spinner {
  display: inline-block;
  width: 32px;
  height: 32px;
  /* base64 인코딩된 정적 PNG - 7.css 원본에서 복사 */
  background: url("data:image/png;base64,...") no-repeat center;
  background-size: contain;
}

/* 애니메이션 로더 */
.spinner.animate {
  /* base64 인코딩된 애니메이션 GIF - 7.css 원본에서 복사 */
  background: url("data:image/gif;base64,...") no-repeat center;
  background-size: contain;
}

/* 크기 변형 */
.spinner.small {
  width: 16px;
  height: 16px;
}

.spinner.large {
  width: 48px;
  height: 48px;
}
```

> **참고:** 위 CSS의 `base64,...` 부분은 실제 7.css 패키지의 원본 base64 인코딩된 PNG/GIF 이미지로 교체해야 한다. spinner.css는 약 9.15kB로 대부분이 base64 이미지 데이터이다.

### 6.2 JSON 메타데이터

- [ ] `registry/components/spinner.json` 생성

```json
{
  "name": "spinner",
  "displayName": "Spinner",
  "description": "Windows 7 스타일 로딩 스피너. 정적/애니메이션 모드, 크기 변형 지원.",
  "dependencies": [],
  "css": ["css/spinner.css"],
  "files": {
    "react": {
      "ts": ["react/spinner/spinner.tsx"],
      "js": ["react/spinner/spinner.jsx"]
    },
    "svelte": {
      "ts": ["svelte/spinner/Spinner.svelte"],
      "js": ["svelte/spinner/Spinner.js.svelte"]
    },
    "vue": {
      "ts": ["vue/spinner/Spinner.vue"],
      "js": ["vue/spinner/Spinner.js.vue"]
    }
  }
}
```

### 6.3 테스트 먼저 작성 (TDD)

- [ ] `registry/react/spinner/__tests__/spinner.test.tsx` 작성

```tsx
// registry/react/spinner/__tests__/spinner.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "../spinner";

describe("Spinner", () => {
  it("renders a spinner element", () => {
    render(<Spinner aria-label="loading" />);
    const spinner = screen.getByRole("status");
    expect(spinner).toBeDefined();
  });

  it("has spinner base class", () => {
    render(<Spinner aria-label="loading" />);
    const spinner = screen.getByRole("status");
    expect(spinner.className).toContain("spinner");
  });

  it("applies animate class when animate prop is true", () => {
    render(<Spinner animate aria-label="loading" />);
    const spinner = screen.getByRole("status");
    expect(spinner.className).toContain("animate");
  });

  it("does not apply animate class by default", () => {
    render(<Spinner aria-label="loading" />);
    const spinner = screen.getByRole("status");
    expect(spinner.className).not.toContain("animate");
  });

  it("applies size class", () => {
    render(<Spinner size="small" aria-label="loading" />);
    const spinner = screen.getByRole("status");
    expect(spinner.className).toContain("small");
  });

  it("renders accessible label via aria-label", () => {
    render(<Spinner aria-label="Loading content" />);
    const spinner = screen.getByLabelText("Loading content");
    expect(spinner).toBeDefined();
  });

  it("merges custom className", () => {
    render(<Spinner className="my-custom" aria-label="loading" />);
    const spinner = screen.getByRole("status");
    expect(spinner.className).toContain("my-custom");
  });
});
```

- [ ] `registry/svelte/spinner/__tests__/Spinner.test.ts` 작성

```ts
// registry/svelte/spinner/__tests__/Spinner.test.ts
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte";
import Spinner from "../Spinner.svelte";

describe("Spinner (Svelte)", () => {
  it("renders a spinner element", () => {
    const { container } = render(Spinner, {
      props: { "aria-label": "loading" },
    });
    const spinner = container.querySelector('[role="status"]');
    expect(spinner).not.toBeNull();
  });

  it("applies animate class when animate is true", () => {
    const { container } = render(Spinner, {
      props: { animate: true, "aria-label": "loading" },
    });
    const spinner = container.querySelector('[role="status"]');
    expect(spinner?.classList.contains("animate")).toBe(true);
  });

  it("applies size class", () => {
    const { container } = render(Spinner, {
      props: { size: "large", "aria-label": "loading" },
    });
    const spinner = container.querySelector('[role="status"]');
    expect(spinner?.classList.contains("large")).toBe(true);
  });

  it("merges custom class", () => {
    const { container } = render(Spinner, {
      props: { class: "my-custom", "aria-label": "loading" },
    });
    const spinner = container.querySelector('[role="status"]');
    expect(spinner?.classList.contains("my-custom")).toBe(true);
  });
});
```

- [ ] `registry/vue/spinner/__tests__/Spinner.test.ts` 작성

```ts
// registry/vue/spinner/__tests__/Spinner.test.ts
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Spinner from "../Spinner.vue";

describe("Spinner (Vue)", () => {
  it("renders a spinner element", () => {
    const wrapper = mount(Spinner, {
      props: { "aria-label": "loading" },
    });
    const spinner = wrapper.find('[role="status"]');
    expect(spinner.exists()).toBe(true);
  });

  it("applies animate class when animate is true", () => {
    const wrapper = mount(Spinner, {
      props: { animate: true, "aria-label": "loading" },
    });
    const spinner = wrapper.find('[role="status"]');
    expect(spinner.classes()).toContain("animate");
  });

  it("applies size class", () => {
    const wrapper = mount(Spinner, {
      props: { size: "large", "aria-label": "loading" },
    });
    const spinner = wrapper.find('[role="status"]');
    expect(spinner.classes()).toContain("large");
  });

  it("merges custom class", () => {
    const wrapper = mount(Spinner, {
      props: { class: "my-custom", "aria-label": "loading" },
    });
    const spinner = wrapper.find('[role="status"]');
    expect(spinner.classes()).toContain("my-custom");
  });
});
```

- [ ] 모든 테스트 실행 - 실패 확인

```bash
pnpm vitest run registry/react/spinner/ registry/svelte/spinner/ registry/vue/spinner/
```

### 6.4 React TypeScript 구현

- [ ] `registry/react/spinner/spinner.tsx` 작성

```tsx
// registry/react/spinner/spinner.tsx
import React from "react";
import styles from "../css/spinner.module.css";

type SpinnerSize = "small" | "default" | "large";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  animate?: boolean;
  size?: SpinnerSize;
}

export function Spinner({
  animate = false,
  size = "default",
  className,
  ...props
}: SpinnerProps) {
  const classNames = [
    styles.spinner,
    animate ? styles.animate : "",
    size !== "default" ? styles[size] : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return <div role="status" className={classNames} {...props} />;
}
```

### 6.5 React JavaScript 구현

- [ ] `registry/react/spinner/spinner.jsx` 작성

```jsx
// registry/react/spinner/spinner.jsx
import React from "react";
import styles from "../css/spinner.module.css";

/**
 * @param {Object} props
 * @param {boolean} [props.animate=false]
 * @param {"small" | "default" | "large"} [props.size="default"]
 * @param {string} [props.className]
 */
export function Spinner({
  animate = false,
  size = "default",
  className,
  ...props
}) {
  const classNames = [
    styles.spinner,
    animate ? styles.animate : "",
    size !== "default" ? styles[size] : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return <div role="status" className={classNames} {...props} />;
}
```

### 6.6 Svelte TypeScript 구현

- [ ] `registry/svelte/spinner/Spinner.svelte` 작성

```svelte
<!-- registry/svelte/spinner/Spinner.svelte -->
<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    animate?: boolean;
    size?: "small" | "default" | "large";
    class?: string;
  }

  let {
    animate = false,
    size = "default",
    class: className,
    ...rest
  }: Props = $props();
</script>

<div
  role="status"
  class="spinner {animate ? 'animate' : ''} {size !== 'default' ? size : ''} {className ?? ''}"
  {...rest}
></div>

<style>
  /* inject-css.ts가 css/spinner.css 내용을 여기에 자동 주입 */
</style>
```

### 6.7 Svelte JavaScript 구현

- [ ] `registry/svelte/spinner/Spinner.js.svelte` 작성

```svelte
<!-- registry/svelte/spinner/Spinner.js.svelte -->
<script>
  /**
   * @type {{ animate?: boolean, size?: "small" | "default" | "large", class?: string, [key: string]: any }}
   */
  let {
    animate = false,
    size = "default",
    class: className,
    ...rest
  } = $props();
</script>

<div
  role="status"
  class="spinner {animate ? 'animate' : ''} {size !== 'default' ? size : ''} {className ?? ''}"
  {...rest}
></div>

<style>
  /* inject-css.ts가 css/spinner.css 내용을 여기에 자동 주입 */
</style>
```

### 6.8 Vue TypeScript 구현

- [ ] `registry/vue/spinner/Spinner.vue` 작성

```vue
<!-- registry/vue/spinner/Spinner.vue -->
<script setup lang="ts">
interface Props {
  animate?: boolean;
  size?: "small" | "default" | "large";
}

const props = withDefaults(defineProps<Props>(), {
  animate: false,
  size: "default",
});
</script>

<template>
  <div
    role="status"
    :class="[
      'spinner',
      props.animate && 'animate',
      props.size !== 'default' && props.size,
    ]"
  />
</template>

<style scoped>
  /* inject-css.ts가 css/spinner.css 내용을 여기에 자동 주입 */
</style>
```

### 6.9 Vue JavaScript 구현

- [ ] `registry/vue/spinner/Spinner.js.vue` 작성

```vue
<!-- registry/vue/spinner/Spinner.js.vue -->
<script setup>
const props = defineProps({
  animate: { type: Boolean, default: false },
  size: {
    type: String,
    default: "default",
    validator: (v) => ["small", "default", "large"].includes(v),
  },
});
</script>

<template>
  <div
    role="status"
    :class="[
      'spinner',
      props.animate && 'animate',
      props.size !== 'default' && props.size,
    ]"
  />
</template>

<style scoped>
  /* inject-css.ts가 css/spinner.css 내용을 여기에 자동 주입 */
</style>
```

### 6.10 CSS 주입 실행

- [ ] inject-css.ts로 Svelte/Vue 파일에 CSS 자동 주입

```bash
pnpm inject-css --component spinner --framework svelte
pnpm inject-css --component spinner --framework vue
```

### 6.11 모든 테스트 통과 확인

```bash
pnpm vitest run registry/react/spinner/ registry/svelte/spinner/ registry/vue/spinner/
```

### 6.12 커밋

- [ ] 커밋

```bash
git add registry/css/spinner.css registry/components/spinner.json registry/react/spinner/ registry/svelte/spinner/ registry/vue/spinner/
git commit -m "feat(spinner): implement Spinner component for React/Svelte/Vue with animate and size props"
```

---

## Task 7: Spinner 통합 테스트

### 7.1 접근성 테스트 보강

- [ ] 스크린리더 접근성 확인 - `role="status"`와 `aria-label` 조합

```tsx
// registry/react/spinner/__tests__/spinner.a11y.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "../spinner";

describe("Spinner Accessibility", () => {
  it("has role=status for screen readers", () => {
    render(<Spinner aria-label="Loading" />);
    expect(screen.getByRole("status")).toBeDefined();
  });

  it("supports aria-label for descriptive loading message", () => {
    render(<Spinner aria-label="Loading search results" />);
    expect(screen.getByLabelText("Loading search results")).toBeDefined();
  });

  it("supports aria-live region implicitly via role=status", () => {
    // role="status" 는 aria-live="polite"와 동등
    render(<Spinner aria-label="Loading" />);
    const spinner = screen.getByRole("status");
    // role=status는 암묵적으로 aria-live="polite" aria-atomic="true"를 가짐
    expect(spinner.getAttribute("role")).toBe("status");
  });
});
```

### 7.2 Registry 정합성 검증

- [ ] spinner.json의 모든 파일 경로가 실제 존재하는지 확인

```bash
pnpm build-registry
node -e "
const meta = require('./registry/components/spinner.json');
const fs = require('fs');
const missing = [];

meta.css.forEach(f => {
  if (!fs.existsSync('registry/' + f)) missing.push(f);
});

for (const [fw, langs] of Object.entries(meta.files)) {
  for (const [lang, files] of Object.entries(langs)) {
    files.forEach(f => {
      if (!fs.existsSync('registry/' + f)) missing.push(f);
    });
  }
}

if (missing.length > 0) {
  console.error('Missing files:', missing);
  process.exit(1);
} else {
  console.log('All spinner registry files verified.');
}
"
```

### 7.3 커밋

- [ ] 커밋

```bash
git add -A
git commit -m "test(spinner): add accessibility and integration tests"
```

---

## Task 8: TreeView CSS + JSON + Compound Component 설계

### 8.1 CSS 추출

- [ ] `registry/css/treeview.css` 생성

7.css 원본 treeview.css (제공된 내용 기반):

```css
/* registry/css/treeview.css */

ul.tree-view {
  display: block;
  font: 9pt Segoe UI, SegoeUI, Noto Sans, sans-serif;
  margin: 0;
  padding: 6px 6px 6px 20px;
}

ul.tree-view li {
  list-style-type: none;
  margin-top: 4px;
  position: relative;
}

ul.tree-view a {
  color: #000;
  text-decoration: none;
}

ul.tree-view ul {
  margin-top: 4px;
  padding-left: 20px;
}

/* Container 변형 */
ul.tree-view.has-container {
  background: #fff;
  border: 1px solid #8e8f8f;
}

/* Collapse Button 변형 (details/summary 기반) */
ul.tree-view.has-collapse-button details > summary::-webkit-details-marker,
ul.tree-view.has-collapse-button details > summary::marker {
  display: none;
}

ul.tree-view.has-collapse-button details > summary:before {
  background: linear-gradient(180deg, #f2f2f2 45%, #ebebeb);
  border: 1px solid #919191;
  border-radius: 1px;
  color: #4b63a7;
  content: "\002b";
  font-size: 8pt;
  font-weight: 700;
  height: 8px;
  left: -16px;
  line-height: calc(12px - 50%);
  margin: 0;
  right: unset;
  text-align: center;
  top: calc(50% - 4px);
  width: 8px;
}

ul.tree-view.has-collapse-button details[open] > summary:before {
  content: "\2013";
  transform: none;
}

/* Connector 변형 (점선 연결선) */
ul.tree-view.has-connector ul {
  position: relative;
}

ul.tree-view.has-connector ul:before {
  border-left: 1px dotted #000;
  content: "";
  height: calc(100% - 8px);
  left: 8px;
  position: absolute;
  top: 0;
}

ul.tree-view.has-connector ul li:before {
  border-bottom: 1px dotted #000;
  content: "";
  position: absolute;
  right: calc(100% + 2px);
  top: 8px;
  width: 10px;
}
```

### 8.2 JSON 메타데이터

- [ ] `registry/components/treeview.json` 생성

```json
{
  "name": "treeview",
  "displayName": "TreeView",
  "description": "Windows 7 스타일 트리뷰. 재귀 트리 구조, container/collapse-button/connector 변형 지원. Compound Component (TreeView + TreeItem).",
  "dependencies": [],
  "css": ["css/treeview.css"],
  "files": {
    "react": {
      "ts": [
        "react/treeview/treeview.tsx",
        "react/treeview/tree-item.tsx"
      ],
      "js": [
        "react/treeview/treeview.jsx",
        "react/treeview/tree-item.jsx"
      ]
    },
    "svelte": {
      "ts": [
        "svelte/treeview/TreeView.svelte",
        "svelte/treeview/TreeItem.svelte"
      ],
      "js": [
        "svelte/treeview/TreeView.js.svelte",
        "svelte/treeview/TreeItem.js.svelte"
      ]
    },
    "vue": {
      "ts": [
        "vue/treeview/TreeView.vue",
        "vue/treeview/TreeItem.vue"
      ],
      "js": [
        "vue/treeview/TreeView.js.vue",
        "vue/treeview/TreeItem.js.vue"
      ]
    }
  }
}
```

### 8.3 Compound Component 데이터 구조 설계

TreeView는 두 컴포넌트로 구성된다:

| 컴포넌트 | 역할 |
|----------|------|
| `TreeView` | 최상위 `<ul class="tree-view">` 컨테이너, variant 결정 |
| `TreeItem` | 재귀적 `<li>` 항목, children으로 중첩 TreeItem 허용 |

**공통 Props (3개 프레임워크 동일):**

| TreeView Props | 타입 | 기본값 | 설명 |
|---------------|------|--------|------|
| `variant` | `"default" \| "container" \| "collapse-button" \| "connector"` | `"default"` | 트리 스타일 변형 |
| `class/className` | `string` | - | 커스텀 클래스 |

| TreeItem Props | 타입 | 기본값 | 설명 |
|---------------|------|--------|------|
| `label` | `string` | (필수) | 항목 텍스트 |
| `open` | `boolean` | `false` | collapse-button 변형에서 초기 열림 상태 |
| `children/slot` | - | - | 중첩 TreeItem |

**variant별 HTML 구조:**

```
variant="default":
<ul class="tree-view">
  <li>Item 1</li>
  <li>Item 2
    <ul>
      <li>Item 2.1</li>
    </ul>
  </li>
</ul>

variant="container":
<ul class="tree-view has-container">
  ...
</ul>

variant="collapse-button":
<ul class="tree-view has-collapse-button">
  <li>
    <details open>
      <summary>Parent</summary>
      <ul>
        <li>Child</li>
      </ul>
    </details>
  </li>
</ul>

variant="connector":
<ul class="tree-view has-connector">
  ...
</ul>
```

> **Batch 3 collapse 로직 공유:** `collapse-button` 변형은 `details/summary` HTML5 요소를 사용한다. Batch 3의 collapse 컴포넌트와 동일한 `details[open] > summary:before` CSS 패턴을 공유하지만, TreeView는 자체 CSS에 해당 규칙이 포함되어 있으므로 CSS 의존성은 없다. 다만 접기/펼치기 동작의 개념적 일관성을 유지한다.

### 8.4 커밋

- [ ] 커밋

```bash
git add registry/css/treeview.css registry/components/treeview.json
git commit -m "feat(treeview): extract CSS and add component metadata with compound component design"
```

---

## Task 9: TreeView React TS/JS

### 9.1 테스트 먼저 작성 (TDD)

- [ ] `registry/react/treeview/__tests__/treeview.test.tsx` 작성

```tsx
// registry/react/treeview/__tests__/treeview.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TreeView } from "../treeview";
import { TreeItem } from "../tree-item";

describe("TreeView", () => {
  it("renders a ul.tree-view", () => {
    const { container } = render(
      <TreeView>
        <TreeItem label="Item 1" />
      </TreeView>
    );
    const ul = container.querySelector("ul.tree-view");
    expect(ul).not.toBeNull();
  });

  it("renders tree items as li elements", () => {
    const { container } = render(
      <TreeView>
        <TreeItem label="Item 1" />
        <TreeItem label="Item 2" />
      </TreeView>
    );
    const items = container.querySelectorAll("li");
    expect(items.length).toBe(2);
  });

  it("renders nested tree items recursively", () => {
    const { container } = render(
      <TreeView>
        <TreeItem label="Parent">
          <TreeItem label="Child 1" />
          <TreeItem label="Child 2" />
        </TreeItem>
      </TreeView>
    );
    const nestedUl = container.querySelector("ul.tree-view ul");
    expect(nestedUl).not.toBeNull();
    const nestedItems = nestedUl!.querySelectorAll(":scope > li");
    expect(nestedItems.length).toBe(2);
  });

  it("applies has-container class for container variant", () => {
    const { container } = render(
      <TreeView variant="container">
        <TreeItem label="Item" />
      </TreeView>
    );
    const ul = container.querySelector("ul");
    expect(ul?.classList.contains("has-container")).toBe(true);
  });

  it("applies has-collapse-button class and renders details/summary", () => {
    const { container } = render(
      <TreeView variant="collapse-button">
        <TreeItem label="Parent">
          <TreeItem label="Child" />
        </TreeItem>
      </TreeView>
    );
    const ul = container.querySelector("ul");
    expect(ul?.classList.contains("has-collapse-button")).toBe(true);
    const details = container.querySelector("details");
    expect(details).not.toBeNull();
    const summary = container.querySelector("summary");
    expect(summary?.textContent).toBe("Parent");
  });

  it("applies has-connector class for connector variant", () => {
    const { container } = render(
      <TreeView variant="connector">
        <TreeItem label="Item" />
      </TreeView>
    );
    const ul = container.querySelector("ul");
    expect(ul?.classList.contains("has-connector")).toBe(true);
  });

  it("respects open prop in collapse-button variant", () => {
    const { container } = render(
      <TreeView variant="collapse-button">
        <TreeItem label="Parent" open>
          <TreeItem label="Child" />
        </TreeItem>
      </TreeView>
    );
    const details = container.querySelector("details");
    expect(details?.open).toBe(true);
  });

  it("merges custom className on TreeView", () => {
    const { container } = render(
      <TreeView className="my-custom">
        <TreeItem label="Item" />
      </TreeView>
    );
    const ul = container.querySelector("ul");
    expect(ul?.classList.contains("my-custom")).toBe(true);
  });

  it("renders deeply nested tree (3+ levels)", () => {
    const { container } = render(
      <TreeView>
        <TreeItem label="L1">
          <TreeItem label="L2">
            <TreeItem label="L3" />
          </TreeItem>
        </TreeItem>
      </TreeView>
    );
    const deepItem = container.querySelectorAll("ul");
    // 최상위 ul + 2개 중첩 ul = 3개
    expect(deepItem.length).toBe(3);
  });
});
```

- [ ] 테스트 실행 - 실패 확인

```bash
pnpm vitest run registry/react/treeview/__tests__/treeview.test.tsx
```

### 9.2 React TypeScript 구현 - TreeView

- [ ] `registry/react/treeview/treeview.tsx` 작성

```tsx
// registry/react/treeview/treeview.tsx
import React, { createContext, useContext } from "react";
import styles from "../css/treeview.module.css";

type TreeViewVariant = "default" | "container" | "collapse-button" | "connector";

interface TreeViewContextValue {
  variant: TreeViewVariant;
}

export const TreeViewContext = createContext<TreeViewContextValue>({
  variant: "default",
});

export function useTreeViewContext() {
  return useContext(TreeViewContext);
}

interface TreeViewProps extends React.HTMLAttributes<HTMLUListElement> {
  variant?: TreeViewVariant;
}

export function TreeView({
  variant = "default",
  className,
  children,
  ...props
}: TreeViewProps) {
  const variantClass = {
    default: "",
    container: styles.hasContainer,
    "collapse-button": styles.hasCollapseButton,
    connector: styles.hasConnector,
  }[variant];

  const classNames = [styles.treeView, variantClass, className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <TreeViewContext.Provider value={{ variant }}>
      <ul className={classNames} {...props}>
        {children}
      </ul>
    </TreeViewContext.Provider>
  );
}
```

### 9.3 React TypeScript 구현 - TreeItem

- [ ] `registry/react/treeview/tree-item.tsx` 작성

```tsx
// registry/react/treeview/tree-item.tsx
import React from "react";
import { useTreeViewContext } from "./treeview";

interface TreeItemProps {
  label: string;
  open?: boolean;
  children?: React.ReactNode;
}

export function TreeItem({ label, open = false, children }: TreeItemProps) {
  const { variant } = useTreeViewContext();
  const hasChildren = React.Children.count(children) > 0;

  // collapse-button 변형이고 자식이 있으면 details/summary 사용
  if (variant === "collapse-button" && hasChildren) {
    return (
      <li>
        <details open={open}>
          <summary>{label}</summary>
          <ul>{children}</ul>
        </details>
      </li>
    );
  }

  // 자식이 있으면 중첩 ul 렌더링
  if (hasChildren) {
    return (
      <li>
        {label}
        <ul>{children}</ul>
      </li>
    );
  }

  // 리프 노드
  return <li>{label}</li>;
}
```

- [ ] 테스트 실행 - 통과 확인

```bash
pnpm vitest run registry/react/treeview/__tests__/treeview.test.tsx
```

### 9.4 React JavaScript 구현 - TreeView

- [ ] `registry/react/treeview/treeview.jsx` 작성

```jsx
// registry/react/treeview/treeview.jsx
import React, { createContext, useContext } from "react";
import styles from "../css/treeview.module.css";

/** @type {React.Context<{ variant: string }>} */
export const TreeViewContext = createContext({ variant: "default" });

export function useTreeViewContext() {
  return useContext(TreeViewContext);
}

/**
 * @param {Object} props
 * @param {"default" | "container" | "collapse-button" | "connector"} [props.variant="default"]
 * @param {string} [props.className]
 * @param {React.ReactNode} [props.children]
 */
export function TreeView({
  variant = "default",
  className,
  children,
  ...props
}) {
  const variantClass = {
    default: "",
    container: styles.hasContainer,
    "collapse-button": styles.hasCollapseButton,
    connector: styles.hasConnector,
  }[variant];

  const classNames = [styles.treeView, variantClass, className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <TreeViewContext.Provider value={{ variant }}>
      <ul className={classNames} {...props}>
        {children}
      </ul>
    </TreeViewContext.Provider>
  );
}
```

### 9.5 React JavaScript 구현 - TreeItem

- [ ] `registry/react/treeview/tree-item.jsx` 작성

```jsx
// registry/react/treeview/tree-item.jsx
import React from "react";
import { useTreeViewContext } from "./treeview";

/**
 * @param {Object} props
 * @param {string} props.label
 * @param {boolean} [props.open=false]
 * @param {React.ReactNode} [props.children]
 */
export function TreeItem({ label, open = false, children }) {
  const { variant } = useTreeViewContext();
  const hasChildren = React.Children.count(children) > 0;

  if (variant === "collapse-button" && hasChildren) {
    return (
      <li>
        <details open={open}>
          <summary>{label}</summary>
          <ul>{children}</ul>
        </details>
      </li>
    );
  }

  if (hasChildren) {
    return (
      <li>
        {label}
        <ul>{children}</ul>
      </li>
    );
  }

  return <li>{label}</li>;
}
```

### 9.6 커밋

- [ ] 커밋

```bash
git add registry/react/treeview/
git commit -m "feat(treeview): implement React TS/JS TreeView + TreeItem compound component"
```

---

## Task 10: TreeView Svelte TS/JS

### 10.1 테스트 먼저 작성 (TDD)

- [ ] `registry/svelte/treeview/__tests__/TreeView.test.ts` 작성

```ts
// registry/svelte/treeview/__tests__/TreeView.test.ts
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte";
import TreeViewTest from "./TreeViewTest.svelte";

// Svelte에서 compound component 테스트는 래퍼 컴포넌트가 필요
// TreeViewTest.svelte를 별도 작성하여 TreeView + TreeItem 조합 테스트

describe("TreeView (Svelte)", () => {
  it("renders a ul.tree-view", () => {
    const { container } = render(TreeViewTest, {
      props: { variant: "default" },
    });
    const ul = container.querySelector("ul.tree-view");
    expect(ul).not.toBeNull();
  });

  it("applies has-container class for container variant", () => {
    const { container } = render(TreeViewTest, {
      props: { variant: "container" },
    });
    const ul = container.querySelector("ul");
    expect(ul?.classList.contains("has-container")).toBe(true);
  });

  it("applies has-collapse-button class and renders details/summary", () => {
    const { container } = render(TreeViewTest, {
      props: { variant: "collapse-button" },
    });
    const ul = container.querySelector("ul");
    expect(ul?.classList.contains("has-collapse-button")).toBe(true);
    const details = container.querySelector("details");
    expect(details).not.toBeNull();
  });

  it("applies has-connector class for connector variant", () => {
    const { container } = render(TreeViewTest, {
      props: { variant: "connector" },
    });
    const ul = container.querySelector("ul");
    expect(ul?.classList.contains("has-connector")).toBe(true);
  });

  it("renders nested tree items", () => {
    const { container } = render(TreeViewTest, {
      props: { variant: "default" },
    });
    const nestedUl = container.querySelector("ul.tree-view ul");
    expect(nestedUl).not.toBeNull();
  });
});
```

- [ ] `registry/svelte/treeview/__tests__/TreeViewTest.svelte` 테스트용 래퍼 컴포넌트 작성

```svelte
<!-- registry/svelte/treeview/__tests__/TreeViewTest.svelte -->
<script lang="ts">
  import TreeView from "../TreeView.svelte";
  import TreeItem from "../TreeItem.svelte";

  interface Props {
    variant?: "default" | "container" | "collapse-button" | "connector";
  }

  let { variant = "default" }: Props = $props();
</script>

<TreeView {variant}>
  <TreeItem label="Parent">
    <TreeItem label="Child 1" />
    <TreeItem label="Child 2" />
  </TreeItem>
  <TreeItem label="Leaf" />
</TreeView>
```

- [ ] 테스트 실행 - 실패 확인

```bash
pnpm vitest run registry/svelte/treeview/__tests__/TreeView.test.ts
```

### 10.2 Svelte TypeScript 구현 - TreeView

- [ ] `registry/svelte/treeview/TreeView.svelte` 작성

```svelte
<!-- registry/svelte/treeview/TreeView.svelte -->
<script lang="ts" module>
  import { setContext, getContext } from "svelte";

  export type TreeViewVariant = "default" | "container" | "collapse-button" | "connector";

  const TREE_VIEW_KEY = Symbol("tree-view");

  export function setTreeViewContext(variant: TreeViewVariant) {
    setContext(TREE_VIEW_KEY, { variant });
  }

  export function getTreeViewContext(): { variant: TreeViewVariant } {
    return getContext(TREE_VIEW_KEY) ?? { variant: "default" };
  }
</script>

<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    variant?: TreeViewVariant;
    class?: string;
    children?: Snippet;
  }

  let {
    variant = "default",
    class: className,
    children,
  }: Props = $props();

  setTreeViewContext(variant);

  const variantClasses: Record<TreeViewVariant, string> = {
    default: "",
    container: "has-container",
    "collapse-button": "has-collapse-button",
    connector: "has-connector",
  };
</script>

<ul class="tree-view {variantClasses[variant]} {className ?? ''}">
  {#if children}
    {@render children()}
  {/if}
</ul>

<style>
  /* inject-css.ts가 css/treeview.css 내용을 여기에 자동 주입 */
</style>
```

### 10.3 Svelte TypeScript 구현 - TreeItem

- [ ] `registry/svelte/treeview/TreeItem.svelte` 작성

```svelte
<!-- registry/svelte/treeview/TreeItem.svelte -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { getTreeViewContext } from "./TreeView.svelte";

  interface Props {
    label: string;
    open?: boolean;
    children?: Snippet;
  }

  let { label, open = false, children }: Props = $props();

  const { variant } = getTreeViewContext();
  const hasChildren = !!children;
</script>

{#if variant === "collapse-button" && hasChildren}
  <li>
    <details {open}>
      <summary>{label}</summary>
      <ul>
        {@render children!()}
      </ul>
    </details>
  </li>
{:else if hasChildren}
  <li>
    {label}
    <ul>
      {@render children!()}
    </ul>
  </li>
{:else}
  <li>{label}</li>
{/if}
```

- [ ] 테스트 실행 - 통과 확인

```bash
pnpm vitest run registry/svelte/treeview/__tests__/TreeView.test.ts
```

### 10.4 Svelte JavaScript 구현 - TreeView

- [ ] `registry/svelte/treeview/TreeView.js.svelte` 작성

```svelte
<!-- registry/svelte/treeview/TreeView.js.svelte -->
<script module>
  import { setContext, getContext } from "svelte";

  const TREE_VIEW_KEY = Symbol("tree-view");

  export function setTreeViewContext(variant) {
    setContext(TREE_VIEW_KEY, { variant });
  }

  export function getTreeViewContext() {
    return getContext(TREE_VIEW_KEY) ?? { variant: "default" };
  }
</script>

<script>
  /**
   * @type {{ variant?: "default" | "container" | "collapse-button" | "connector", class?: string, children?: import("svelte").Snippet }}
   */
  let {
    variant = "default",
    class: className,
    children,
  } = $props();

  setTreeViewContext(variant);

  const variantClasses = {
    default: "",
    container: "has-container",
    "collapse-button": "has-collapse-button",
    connector: "has-connector",
  };
</script>

<ul class="tree-view {variantClasses[variant]} {className ?? ''}">
  {#if children}
    {@render children()}
  {/if}
</ul>

<style>
  /* inject-css.ts가 css/treeview.css 내용을 여기에 자동 주입 */
</style>
```

### 10.5 Svelte JavaScript 구현 - TreeItem

- [ ] `registry/svelte/treeview/TreeItem.js.svelte` 작성

```svelte
<!-- registry/svelte/treeview/TreeItem.js.svelte -->
<script>
  import { getTreeViewContext } from "./TreeView.js.svelte";

  /**
   * @type {{ label: string, open?: boolean, children?: import("svelte").Snippet }}
   */
  let { label, open = false, children } = $props();

  const { variant } = getTreeViewContext();
  const hasChildren = !!children;
</script>

{#if variant === "collapse-button" && hasChildren}
  <li>
    <details {open}>
      <summary>{label}</summary>
      <ul>
        {@render children()}
      </ul>
    </details>
  </li>
{:else if hasChildren}
  <li>
    {label}
    <ul>
      {@render children()}
    </ul>
  </li>
{:else}
  <li>{label}</li>
{/if}
```

### 10.6 CSS 주입 실행

- [ ] inject-css.ts로 Svelte 파일에 CSS 자동 주입

```bash
pnpm inject-css --component treeview --framework svelte
```

### 10.7 커밋

- [ ] 커밋

```bash
git add registry/svelte/treeview/
git commit -m "feat(treeview): implement Svelte TS/JS TreeView + TreeItem with context-based variant"
```

---

## Task 11: TreeView Vue TS/JS

### 11.1 테스트 먼저 작성 (TDD)

- [ ] `registry/vue/treeview/__tests__/TreeView.test.ts` 작성

```ts
// registry/vue/treeview/__tests__/TreeView.test.ts
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import TreeView from "../TreeView.vue";
import TreeItem from "../TreeItem.vue";

describe("TreeView (Vue)", () => {
  it("renders a ul.tree-view", () => {
    const wrapper = mount(TreeView, {
      slots: {
        default: () => [h(TreeItem, { label: "Item 1" })],
      },
    });
    const ul = wrapper.find("ul.tree-view");
    expect(ul.exists()).toBe(true);
  });

  it("applies has-container class for container variant", () => {
    const wrapper = mount(TreeView, {
      props: { variant: "container" },
      slots: {
        default: () => [h(TreeItem, { label: "Item" })],
      },
    });
    const ul = wrapper.find("ul");
    expect(ul.classes()).toContain("has-container");
  });

  it("applies has-collapse-button class for collapse-button variant", () => {
    const wrapper = mount(TreeView, {
      props: { variant: "collapse-button" },
      slots: {
        default: () => [
          h(TreeItem, { label: "Parent" }, {
            default: () => [h(TreeItem, { label: "Child" })],
          }),
        ],
      },
    });
    const ul = wrapper.find("ul");
    expect(ul.classes()).toContain("has-collapse-button");
  });

  it("renders details/summary in collapse-button variant", () => {
    const wrapper = mount(TreeView, {
      props: { variant: "collapse-button" },
      slots: {
        default: () => [
          h(TreeItem, { label: "Parent" }, {
            default: () => [h(TreeItem, { label: "Child" })],
          }),
        ],
      },
    });
    const details = wrapper.find("details");
    expect(details.exists()).toBe(true);
    const summary = wrapper.find("summary");
    expect(summary.text()).toBe("Parent");
  });

  it("applies has-connector class for connector variant", () => {
    const wrapper = mount(TreeView, {
      props: { variant: "connector" },
      slots: {
        default: () => [h(TreeItem, { label: "Item" })],
      },
    });
    const ul = wrapper.find("ul");
    expect(ul.classes()).toContain("has-connector");
  });

  it("renders nested tree items", () => {
    const wrapper = mount(TreeView, {
      slots: {
        default: () => [
          h(TreeItem, { label: "Parent" }, {
            default: () => [h(TreeItem, { label: "Child" })],
          }),
        ],
      },
    });
    const nestedUl = wrapper.find("ul.tree-view ul");
    expect(nestedUl.exists()).toBe(true);
  });
});
```

- [ ] 테스트 실행 - 실패 확인

```bash
pnpm vitest run registry/vue/treeview/__tests__/TreeView.test.ts
```

### 11.2 Vue TypeScript 구현 - TreeView

- [ ] `registry/vue/treeview/TreeView.vue` 작성

```vue
<!-- registry/vue/treeview/TreeView.vue -->
<script setup lang="ts">
import { provide } from "vue";

type TreeViewVariant = "default" | "container" | "collapse-button" | "connector";

interface Props {
  variant?: TreeViewVariant;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
});

// TreeItem 컴포넌트에 variant 전달
provide("treeViewVariant", props.variant);

const variantClasses: Record<TreeViewVariant, string> = {
  default: "",
  container: "has-container",
  "collapse-button": "has-collapse-button",
  connector: "has-connector",
};
</script>

<template>
  <ul :class="['tree-view', variantClasses[props.variant]]">
    <slot />
  </ul>
</template>

<style scoped>
  /* inject-css.ts가 css/treeview.css 내용을 여기에 자동 주입 */
</style>
```

### 11.3 Vue TypeScript 구현 - TreeItem

- [ ] `registry/vue/treeview/TreeItem.vue` 작성

```vue
<!-- registry/vue/treeview/TreeItem.vue -->
<script setup lang="ts">
import { inject, useSlots } from "vue";

type TreeViewVariant = "default" | "container" | "collapse-button" | "connector";

interface Props {
  label: string;
  open?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
});

const variant = inject<TreeViewVariant>("treeViewVariant", "default");
const slots = useSlots();
const hasChildren = !!slots.default;
</script>

<template>
  <!-- collapse-button 변형 + 자식 있음 -->
  <li v-if="variant === 'collapse-button' && hasChildren">
    <details :open="props.open">
      <summary>{{ props.label }}</summary>
      <ul>
        <slot />
      </ul>
    </details>
  </li>

  <!-- 일반 + 자식 있음 -->
  <li v-else-if="hasChildren">
    {{ props.label }}
    <ul>
      <slot />
    </ul>
  </li>

  <!-- 리프 노드 -->
  <li v-else>{{ props.label }}</li>
</template>
```

- [ ] 테스트 실행 - 통과 확인

```bash
pnpm vitest run registry/vue/treeview/__tests__/TreeView.test.ts
```

### 11.4 Vue JavaScript 구현 - TreeView

- [ ] `registry/vue/treeview/TreeView.js.vue` 작성

```vue
<!-- registry/vue/treeview/TreeView.js.vue -->
<script setup>
import { provide } from "vue";

const props = defineProps({
  variant: {
    type: String,
    default: "default",
    validator: (v) =>
      ["default", "container", "collapse-button", "connector"].includes(v),
  },
});

provide("treeViewVariant", props.variant);

const variantClasses = {
  default: "",
  container: "has-container",
  "collapse-button": "has-collapse-button",
  connector: "has-connector",
};
</script>

<template>
  <ul :class="['tree-view', variantClasses[props.variant]]">
    <slot />
  </ul>
</template>

<style scoped>
  /* inject-css.ts가 css/treeview.css 내용을 여기에 자동 주입 */
</style>
```

### 11.5 Vue JavaScript 구현 - TreeItem

- [ ] `registry/vue/treeview/TreeItem.js.vue` 작성

```vue
<!-- registry/vue/treeview/TreeItem.js.vue -->
<script setup>
import { inject, useSlots } from "vue";

const props = defineProps({
  label: { type: String, required: true },
  open: { type: Boolean, default: false },
});

const variant = inject("treeViewVariant", "default");
const slots = useSlots();
const hasChildren = !!slots.default;
</script>

<template>
  <li v-if="variant === 'collapse-button' && hasChildren">
    <details :open="props.open">
      <summary>{{ props.label }}</summary>
      <ul>
        <slot />
      </ul>
    </details>
  </li>

  <li v-else-if="hasChildren">
    {{ props.label }}
    <ul>
      <slot />
    </ul>
  </li>

  <li v-else>{{ props.label }}</li>
</template>
```

### 11.6 CSS 주입 실행

- [ ] inject-css.ts로 Vue 파일에 CSS 자동 주입

```bash
pnpm inject-css --component treeview --framework vue
```

### 11.7 커밋

- [ ] 커밋

```bash
git add registry/vue/treeview/
git commit -m "feat(treeview): implement Vue TS/JS TreeView + TreeItem with provide/inject"
```

---

## Task 12: TreeView 통합 테스트

### 12.1 전체 프레임워크 테스트 실행

- [ ] React 테스트

```bash
pnpm vitest run registry/react/treeview/
```

- [ ] Svelte 테스트

```bash
pnpm vitest run registry/svelte/treeview/
```

- [ ] Vue 테스트

```bash
pnpm vitest run registry/vue/treeview/
```

### 12.2 접근성 테스트 보강

- [ ] `registry/react/treeview/__tests__/treeview.a11y.test.tsx` 작성

```tsx
// registry/react/treeview/__tests__/treeview.a11y.test.tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TreeView } from "../treeview";
import { TreeItem } from "../tree-item";

describe("TreeView Accessibility", () => {
  it("uses semantic ul/li structure for tree", () => {
    const { container } = render(
      <TreeView>
        <TreeItem label="Item 1" />
        <TreeItem label="Item 2" />
      </TreeView>
    );
    const ul = container.querySelector("ul");
    expect(ul).not.toBeNull();
    const lis = container.querySelectorAll("li");
    expect(lis.length).toBe(2);
  });

  it("collapse-button uses native details/summary for keyboard accessibility", () => {
    const { container } = render(
      <TreeView variant="collapse-button">
        <TreeItem label="Folder">
          <TreeItem label="File" />
        </TreeItem>
      </TreeView>
    );
    const summary = container.querySelector("summary");
    expect(summary).not.toBeNull();
    // summary 요소는 기본적으로 키보드 포커스 가능 + Enter/Space로 토글
  });

  it("tree links are accessible", () => {
    const { container } = render(
      <TreeView>
        <TreeItem label="Clickable Item" />
      </TreeView>
    );
    const li = container.querySelector("li");
    expect(li?.textContent).toBe("Clickable Item");
  });
});
```

### 12.3 재귀 깊이 스트레스 테스트

- [ ] 5단계 이상 중첩 트리가 올바르게 렌더링되는지 확인

```tsx
// registry/react/treeview/__tests__/treeview.stress.test.tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TreeView } from "../treeview";
import { TreeItem } from "../tree-item";

describe("TreeView Stress", () => {
  it("renders 5-level deep nested tree", () => {
    const { container } = render(
      <TreeView>
        <TreeItem label="L1">
          <TreeItem label="L2">
            <TreeItem label="L3">
              <TreeItem label="L4">
                <TreeItem label="L5" />
              </TreeItem>
            </TreeItem>
          </TreeItem>
        </TreeItem>
      </TreeView>
    );
    // 최상위 ul + 4개 중첩 ul = 5개
    const uls = container.querySelectorAll("ul");
    expect(uls.length).toBe(5);
  });

  it("renders many siblings efficiently", () => {
    const items = Array.from({ length: 100 }, (_, i) => (
      <TreeItem key={i} label={`Item ${i}`} />
    ));
    const { container } = render(<TreeView>{items}</TreeView>);
    const lis = container.querySelectorAll("li");
    expect(lis.length).toBe(100);
  });
});
```

### 12.4 Registry 정합성 검증

- [ ] treeview.json의 모든 파일 경로가 실제 존재하는지 확인

```bash
pnpm build-registry
node -e "
const meta = require('./registry/components/treeview.json');
const fs = require('fs');
const missing = [];

meta.css.forEach(f => {
  if (!fs.existsSync('registry/' + f)) missing.push(f);
});

for (const [fw, langs] of Object.entries(meta.files)) {
  for (const [lang, files] of Object.entries(langs)) {
    files.forEach(f => {
      if (!fs.existsSync('registry/' + f)) missing.push(f);
    });
  }
}

if (missing.length > 0) {
  console.error('Missing files:', missing);
  process.exit(1);
} else {
  console.log('All treeview registry files verified.');
}
"
```

### 12.5 Batch 3 collapse 로직 일관성 확인

- [ ] TreeView의 `collapse-button` 변형이 Batch 3 collapse 컴포넌트와 동일한 `details/summary` 패턴을 사용하는지 확인
- [ ] CSS의 `::-webkit-details-marker`, `::marker` 숨김 처리, `summary:before` 아이콘이 올바르게 적용되는지 확인

### 12.6 커밋

- [ ] 커밋

```bash
git add -A
git commit -m "test(treeview): add accessibility, stress, and integration tests"
```

---

## Task 13: Registry 업데이트

### 13.1 index.json에 Batch 4 컴포넌트 추가

- [ ] `registry/index.json`에 slider, spinner, treeview 엔트리 추가

```bash
node -e "
const fs = require('fs');
const indexPath = 'registry/index.json';
const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

const batch4Components = [
  {
    name: 'slider',
    displayName: 'Slider',
    description: 'Windows 7 스타일 슬라이더 (input[type=range]). 수평/수직 모드, box indicator 변형 지원.',
    dependencies: []
  },
  {
    name: 'spinner',
    displayName: 'Spinner',
    description: 'Windows 7 스타일 로딩 스피너. 정적/애니메이션 모드, 크기 변형 지원.',
    dependencies: []
  },
  {
    name: 'treeview',
    displayName: 'TreeView',
    description: 'Windows 7 스타일 트리뷰. 재귀 트리 구조, container/collapse-button/connector 변형 지원.',
    dependencies: []
  }
];

// 중복 방지
const existingNames = new Set(index.components.map(c => c.name));
for (const comp of batch4Components) {
  if (!existingNames.has(comp.name)) {
    index.components.push(comp);
  }
}

fs.writeFileSync(indexPath, JSON.stringify(index, null, 2) + '\n');
console.log('index.json updated with Batch 4 components');
"
```

### 13.2 Registry 빌드 및 검증

- [ ] build-registry 실행

```bash
pnpm build-registry
```

- [ ] 전체 registry 정합성 검증 (모든 JSON의 파일 경로 존재 확인)

```bash
node -e "
const fs = require('fs');
const path = require('path');
const componentsDir = 'registry/components';
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.json'));
let allValid = true;

for (const file of files) {
  const meta = JSON.parse(fs.readFileSync(path.join(componentsDir, file), 'utf8'));
  const missing = [];

  (meta.css || []).forEach(f => {
    if (!fs.existsSync(path.join('registry', f))) missing.push(f);
  });

  for (const [fw, langs] of Object.entries(meta.files || {})) {
    for (const [lang, fwFiles] of Object.entries(langs)) {
      fwFiles.forEach(f => {
        if (!fs.existsSync(path.join('registry', f))) missing.push(f);
      });
    }
  }

  if (missing.length > 0) {
    console.error(meta.name + ': MISSING -', missing.join(', '));
    allValid = false;
  } else {
    console.log(meta.name + ': OK');
  }
}

if (!allValid) process.exit(1);
console.log('\\nAll registry files verified successfully.');
"
```

### 13.3 전체 테스트 실행

- [ ] Batch 4 전체 테스트 실행

```bash
pnpm vitest run registry/react/slider/ registry/react/spinner/ registry/react/treeview/ registry/svelte/slider/ registry/svelte/spinner/ registry/svelte/treeview/ registry/vue/slider/ registry/vue/spinner/ registry/vue/treeview/
```

### 13.4 최종 커밋

- [ ] 커밋

```bash
git add registry/index.json
git commit -m "feat(registry): add Batch 4 components (slider, spinner, treeview) to index"
```

---

## 파일 생성 요약

### CSS 파일 (3개)
| 파일 | 크기 (예상) | 특이사항 |
|------|------------|---------|
| `registry/css/slider.css` | ~7.68kB | base64 PNG thumb 이미지 포함 |
| `registry/css/spinner.css` | ~9.15kB | base64 PNG/GIF 이미지 포함 |
| `registry/css/treeview.css` | ~1.2kB | 순수 CSS, 이미지 없음 |

### JSON 메타데이터 (3개)
| 파일 |
|------|
| `registry/components/slider.json` |
| `registry/components/spinner.json` |
| `registry/components/treeview.json` |

### React 컴포넌트 (8개)
| 파일 | 설명 |
|------|------|
| `registry/react/slider/slider.tsx` | Slider TS |
| `registry/react/slider/slider.jsx` | Slider JS |
| `registry/react/spinner/spinner.tsx` | Spinner TS |
| `registry/react/spinner/spinner.jsx` | Spinner JS |
| `registry/react/treeview/treeview.tsx` | TreeView TS (Context Provider) |
| `registry/react/treeview/tree-item.tsx` | TreeItem TS (Context Consumer) |
| `registry/react/treeview/treeview.jsx` | TreeView JS |
| `registry/react/treeview/tree-item.jsx` | TreeItem JS |

### Svelte 컴포넌트 (8개)
| 파일 | 설명 |
|------|------|
| `registry/svelte/slider/Slider.svelte` | Slider TS |
| `registry/svelte/slider/Slider.js.svelte` | Slider JS |
| `registry/svelte/spinner/Spinner.svelte` | Spinner TS |
| `registry/svelte/spinner/Spinner.js.svelte` | Spinner JS |
| `registry/svelte/treeview/TreeView.svelte` | TreeView TS (setContext) |
| `registry/svelte/treeview/TreeItem.svelte` | TreeItem TS (getContext) |
| `registry/svelte/treeview/TreeView.js.svelte` | TreeView JS |
| `registry/svelte/treeview/TreeItem.js.svelte` | TreeItem JS |

### Vue 컴포넌트 (8개)
| 파일 | 설명 |
|------|------|
| `registry/vue/slider/Slider.vue` | Slider TS (v-model 지원) |
| `registry/vue/slider/Slider.js.vue` | Slider JS |
| `registry/vue/spinner/Spinner.vue` | Spinner TS |
| `registry/vue/spinner/Spinner.js.vue` | Spinner JS |
| `registry/vue/treeview/TreeView.vue` | TreeView TS (provide) |
| `registry/vue/treeview/TreeItem.vue` | TreeItem TS (inject) |
| `registry/vue/treeview/TreeView.js.vue` | TreeView JS |
| `registry/vue/treeview/TreeItem.js.vue` | TreeItem JS |

### 테스트 파일 (10개+)
| 파일 |
|------|
| `registry/react/slider/__tests__/slider.test.tsx` |
| `registry/svelte/slider/__tests__/Slider.test.ts` |
| `registry/vue/slider/__tests__/Slider.test.ts` |
| `registry/react/spinner/__tests__/spinner.test.tsx` |
| `registry/react/spinner/__tests__/spinner.a11y.test.tsx` |
| `registry/svelte/spinner/__tests__/Spinner.test.ts` |
| `registry/vue/spinner/__tests__/Spinner.test.ts` |
| `registry/react/treeview/__tests__/treeview.test.tsx` |
| `registry/react/treeview/__tests__/treeview.a11y.test.tsx` |
| `registry/react/treeview/__tests__/treeview.stress.test.tsx` |
| `registry/svelte/treeview/__tests__/TreeView.test.ts` |
| `registry/svelte/treeview/__tests__/TreeViewTest.svelte` |
| `registry/vue/treeview/__tests__/TreeView.test.ts` |

### 총계
- CSS: 3개
- JSON: 3개
- 컴포넌트: 24개 (3 컴포넌트 x 3 프레임워크 x 2 언어, TreeView는 compound이므로 +6개)
- 테스트: 13개+
- **합계: 43개+ 파일**

---

## 프레임워크별 패턴 의존성 주입 요약

| 패턴 | React | Svelte 5 | Vue 3 |
|------|-------|----------|-------|
| Context 전달 | `createContext` + `useContext` | `setContext` + `getContext` | `provide` + `inject` |
| Children 감지 | `React.Children.count()` | `!!children` (Snippet) | `!!useSlots().default` |
| 이벤트 | `onChange` / `onClick` | `onclick` / `on:change` | `@input` / `emit()` |
| 양방향 바인딩 | controlled component | `bind:value` | `v-model` (`modelValue` + `emit`) |
| CSS 스코핑 | CSS Modules (`.module.css`) | `<style>` (자동 스코핑) | `<style scoped>` |

---

## 커밋 히스토리 (예상 10개)

1. `feat(slider): extract CSS from 7.css and add component metadata`
2. `feat(slider): implement React TS/JS component with orientation and variant props`
3. `feat(slider): implement Svelte TS/JS component with CSS injection`
4. `feat(slider): implement Vue TS/JS component with v-model and CSS injection`
5. `test(slider): add integration tests for all frameworks`
6. `feat(spinner): implement Spinner component for React/Svelte/Vue with animate and size props`
7. `test(spinner): add accessibility and integration tests`
8. `feat(treeview): extract CSS and add component metadata with compound component design`
9. `feat(treeview): implement React TS/JS TreeView + TreeItem compound component`
10. `feat(treeview): implement Svelte TS/JS TreeView + TreeItem with context-based variant`
11. `feat(treeview): implement Vue TS/JS TreeView + TreeItem with provide/inject`
12. `test(treeview): add accessibility, stress, and integration tests`
13. `feat(registry): add Batch 4 components (slider, spinner, treeview) to index`
