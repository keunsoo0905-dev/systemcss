# Batch 2: Complex Inputs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Windows 7 스타일의 5개 복합 입력/리스트 컴포넌트(dropdown, combobox, listbox, listview, searchbox)를 React/Svelte/Vue 3개 프레임워크 x TS/JS 버전으로 구현한다.
**Architecture:** 7.css 원본 CSS를 `registry/css/`에 단일 소스로 관리하고, React는 CSS Modules로, Svelte/Vue는 `<style>` 블록 내장 방식으로 스코핑한다. `combobox`는 `dropdown` 내부 구현(옵션 목록 렌더링, 열기/닫기 상태 관리)을 재사용하며, `searchbox`는 Batch 1의 textbox 패턴을 확장한다.
**Tech Stack:** React 18+, Svelte 5 (Runes), Vue 3 (Composition API), TypeScript, Vitest, CSS Modules

---

## 사전 조건

- Batch 1 인프라 완료: 모노레포, CLI(init/add/list/remove), registry 스키마, base.css, CSS 주입 파이프라인(`inject-css.ts`), 3개 프레임워크 x JS/TS 템플릿
- Batch 1 컴포넌트 완료: button, textbox, checkbox, radiobutton, groupbox
- `scripts/inject-css.ts` 동작 확인 완료

---

## Task 1: Dropdown CSS + 메타데이터 JSON

> Dropdown 컴포넌트의 CSS 단일 소스와 registry 메타데이터를 생성한다.

### Step 1.1: CSS 파일 생성

- [ ] `registry/css/dropdown.css` 생성

```css
/* registry/css/dropdown.css */
/* 7.css 원본 기반 — select:not([multiple]) 스타일 */

.win7-dropdown {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTExIDZINHYxaDF2MWgxdjFoMXYxaDFWOWgxVjhoMVY3aDFWNloiIGZpbGw9IiMwMDAiLz48L3N2Zz4="),
    linear-gradient(#f2f2f2 45%, #ebebeb 0, #cfcfcf);
  background-position: 100%;
  background-repeat: no-repeat;
  border: 1px solid #8e8f8f;
  border-radius: 3px;
  box-shadow: inset 0 0 0 1px #fffc;
  box-sizing: border-box;
  color: #222;
  font: 9pt "Segoe UI", SegoeUI, "Noto Sans", sans-serif;
  padding: 2px 30px 2px 3px;
  position: relative;
}

.win7-dropdown:not(:disabled):hover {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTExIDZINHYxaDF2MWgxdjFoMXYxaDFWOWgxVjhoMVY3aDFWNloiIGZpbGw9IiMwMDAiLz48L3N2Zz4="),
    linear-gradient(#eaf6fd 45%, #bee6fd 0, #a7d9f5);
  border-color: #3c7fb1;
}

.win7-dropdown:not(:disabled):active {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTExIDZINHYxaDF2MWgxdjFoMXYxaDFWOWgxVjhoMVY3aDFWNloiIGZpbGw9IiMwMDAiLz48L3N2Zz4="),
    linear-gradient(#e5f4fc, #c4e5f6 30% 50%, #98d1ef 50%, #68b3db);
  border-color: #6d91ab;
  box-shadow: inset 1px 1px 0 #0003, inset -1px 1px 0 #0001;
  outline: none;
}

.win7-dropdown:not(:disabled):focus {
  box-shadow: inset 0 0 0 2px #98d1ef;
  outline: 1px dotted #000;
  outline-offset: -4px;
}

.win7-dropdown:disabled {
  background: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTExIDZINHYxaDF2MWgxdjFoMXYxaDFWOWgxVjhoMVY3aDFWNloiIGZpbGw9IiM4MzgzODMiLz48L3N2Zz4=")
    #f4f4f4;
  background-position: 100%;
  background-repeat: no-repeat;
  border-color: #adb2b5;
  color: #838383;
  opacity: 1;
}
```

### Step 1.2: 메타데이터 JSON 생성

- [ ] `registry/components/dropdown.json` 생성

```json
{
  "name": "dropdown",
  "displayName": "Dropdown",
  "description": "Windows 7 스타일 드롭다운 선택 컴포넌트 (native select 기반)",
  "dependencies": [],
  "css": ["css/dropdown.css"],
  "files": {
    "react": {
      "ts": ["react/dropdown/dropdown.tsx"],
      "js": ["react/dropdown/dropdown.jsx"]
    },
    "svelte": {
      "ts": ["svelte/dropdown/Dropdown.svelte"],
      "js": ["svelte/dropdown/Dropdown.js.svelte"]
    },
    "vue": {
      "ts": ["vue/dropdown/Dropdown.vue"],
      "js": ["vue/dropdown/Dropdown.js.vue"]
    }
  }
}
```

### Step 1.3: 검증

- [ ] CSS 파일이 `registry/css/dropdown.css` 경로에 존재하는지 확인
- [ ] JSON 파일이 `registry/components/dropdown.json` 경로에 존재하는지 확인
- [ ] JSON 내 모든 파일 경로가 실제로 생성될 경로와 일치하는지 확인
- [ ] 커밋: `feat(registry): add dropdown CSS and component metadata`

---

## Task 2: Dropdown React TS/JS 구현

> Dropdown 컴포넌트의 React TypeScript 및 JavaScript 버전을 구현한다.

### Step 2.1: 실패 테스트 작성 (TDD Red)

- [ ] `registry/react/dropdown/__tests__/dropdown.test.tsx` 생성

```tsx
// registry/react/dropdown/__tests__/dropdown.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dropdown } from "../dropdown";

describe("Dropdown (React)", () => {
  const options = [
    { value: "opt1", label: "Option 1" },
    { value: "opt2", label: "Option 2" },
    { value: "opt3", label: "Option 3" },
  ];

  it("renders a native select element", () => {
    render(<Dropdown options={options} />);
    const select = screen.getByRole("combobox");
    expect(select).toBeDefined();
    expect(select.tagName).toBe("SELECT");
  });

  it("renders all provided options", () => {
    render(<Dropdown options={options} />);
    const optionElements = screen.getAllByRole("option");
    expect(optionElements).toHaveLength(3);
    expect(optionElements[0].textContent).toBe("Option 1");
    expect(optionElements[1].textContent).toBe("Option 2");
    expect(optionElements[2].textContent).toBe("Option 3");
  });

  it("renders a placeholder option when placeholder is provided", () => {
    render(<Dropdown options={options} placeholder="Select..." />);
    const optionElements = screen.getAllByRole("option");
    expect(optionElements).toHaveLength(4);
    expect(optionElements[0].textContent).toBe("Select...");
    expect((optionElements[0] as HTMLOptionElement).disabled).toBe(true);
  });

  it("applies win7-dropdown CSS class", () => {
    render(<Dropdown options={options} data-testid="dd" />);
    const select = screen.getByTestId("dd");
    expect(select.className).toContain("dropdown");
  });

  it("supports controlled value", () => {
    render(<Dropdown options={options} value="opt2" onChange={() => {}} />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("opt2");
  });

  it("fires onChange when selection changes", async () => {
    const user = userEvent.setup();
    let changedValue = "";
    render(
      <Dropdown
        options={options}
        onChange={(e) => {
          changedValue = e.target.value;
        }}
      />
    );
    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "opt2");
    expect(changedValue).toBe("opt2");
  });

  it("renders as disabled when disabled prop is set", () => {
    render(<Dropdown options={options} disabled />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.disabled).toBe(true);
  });

  it("merges custom className", () => {
    render(<Dropdown options={options} className="custom-class" data-testid="dd" />);
    const select = screen.getByTestId("dd");
    expect(select.className).toContain("custom-class");
    expect(select.className).toContain("dropdown");
  });

  it("passes through additional HTML attributes", () => {
    render(<Dropdown options={options} aria-label="test-dropdown" data-testid="dd" />);
    const select = screen.getByTestId("dd");
    expect(select.getAttribute("aria-label")).toBe("test-dropdown");
  });
});
```

### Step 2.2: React TypeScript 구현 (TDD Green)

- [ ] `registry/react/dropdown/dropdown.tsx` 생성

```tsx
// registry/react/dropdown/dropdown.tsx
import React from "react";
import styles from "../css/dropdown.module.css";

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "multiple"> {
  /** 드롭다운에 표시할 옵션 목록 */
  options: DropdownOption[];
  /** 선택 전 표시할 플레이스홀더 텍스트 */
  placeholder?: string;
}

export function Dropdown({
  options,
  placeholder,
  className,
  ...props
}: DropdownProps) {
  return (
    <select
      className={`${styles.dropdown} ${className ?? ""}`.trim()}
      {...props}
    >
      {placeholder && (
        <option value="" disabled hidden>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
```

### Step 2.3: React JavaScript 구현

- [ ] `registry/react/dropdown/dropdown.jsx` 생성

```jsx
// registry/react/dropdown/dropdown.jsx
import React from "react";
import styles from "../css/dropdown.module.css";

/**
 * @typedef {{ value: string; label: string; disabled?: boolean }} DropdownOption
 */

/**
 * Windows 7 스타일 드롭다운 선택 컴포넌트
 * @param {object} props
 * @param {DropdownOption[]} props.options - 드롭다운에 표시할 옵션 목록
 * @param {string} [props.placeholder] - 선택 전 표시할 플레이스홀더 텍스트
 * @param {string} [props.className] - 추가 CSS 클래스
 */
export function Dropdown({ options, placeholder, className, ...props }) {
  return (
    <select
      className={`${styles.dropdown} ${className ?? ""}`.trim()}
      {...props}
    >
      {placeholder && (
        <option value="" disabled hidden>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
```

### Step 2.4: 검증

- [ ] `pnpm vitest run registry/react/dropdown` 실행하여 모든 테스트 통과 확인
- [ ] 커밋: `feat(dropdown): add React TS/JS dropdown component`

---

## Task 3: Dropdown Svelte TS/JS 구현

> Dropdown 컴포넌트의 Svelte 5 (Runes) TypeScript 및 JavaScript 버전을 구현한다.

### Step 3.1: 실패 테스트 작성 (TDD Red)

- [ ] `registry/svelte/dropdown/__tests__/Dropdown.test.ts` 생성

```ts
// registry/svelte/dropdown/__tests__/Dropdown.test.ts
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import Dropdown from "../Dropdown.svelte";

describe("Dropdown (Svelte)", () => {
  const options = [
    { value: "opt1", label: "Option 1" },
    { value: "opt2", label: "Option 2" },
    { value: "opt3", label: "Option 3" },
  ];

  it("renders a native select element", () => {
    render(Dropdown, { props: { options } });
    const select = screen.getByRole("combobox");
    expect(select).toBeDefined();
    expect(select.tagName).toBe("SELECT");
  });

  it("renders all provided options", () => {
    render(Dropdown, { props: { options } });
    const optionElements = screen.getAllByRole("option");
    expect(optionElements).toHaveLength(3);
  });

  it("renders a placeholder option when placeholder is provided", () => {
    render(Dropdown, { props: { options, placeholder: "Select..." } });
    const optionElements = screen.getAllByRole("option");
    expect(optionElements).toHaveLength(4);
    expect(optionElements[0].textContent).toBe("Select...");
  });

  it("applies win7-dropdown CSS class", () => {
    render(Dropdown, { props: { options } });
    const select = screen.getByRole("combobox");
    expect(select.className).toContain("win7-dropdown");
  });

  it("supports controlled value", () => {
    render(Dropdown, { props: { options, value: "opt2" } });
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("opt2");
  });

  it("renders as disabled when disabled prop is set", () => {
    render(Dropdown, { props: { options, disabled: true } });
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.disabled).toBe(true);
  });

  it("merges custom class", () => {
    render(Dropdown, { props: { options, class: "custom-class" } });
    const select = screen.getByRole("combobox");
    expect(select.className).toContain("custom-class");
    expect(select.className).toContain("win7-dropdown");
  });
});
```

### Step 3.2: Svelte TypeScript 구현 (TDD Green)

- [ ] `registry/svelte/dropdown/Dropdown.svelte` 생성

```svelte
<!-- registry/svelte/dropdown/Dropdown.svelte -->
<script lang="ts">
  import type { HTMLSelectAttributes } from "svelte/elements";

  interface DropdownOption {
    value: string;
    label: string;
    disabled?: boolean;
  }

  interface Props extends Omit<HTMLSelectAttributes, "multiple"> {
    options: DropdownOption[];
    placeholder?: string;
    class?: string;
  }

  let {
    options,
    placeholder,
    value = $bindable(),
    class: className,
    ...rest
  }: Props = $props();
</script>

<select
  class="win7-dropdown {className ?? ''}"
  bind:value
  {...rest}
>
  {#if placeholder}
    <option value="" disabled hidden>{placeholder}</option>
  {/if}
  {#each options as opt (opt.value)}
    <option value={opt.value} disabled={opt.disabled}>{opt.label}</option>
  {/each}
</select>

<style>
  /* inject-css.ts가 css/dropdown.css 내용을 여기에 자동 주입 */
</style>
```

### Step 3.3: Svelte JavaScript 구현

- [ ] `registry/svelte/dropdown/Dropdown.js.svelte` 생성

```svelte
<!-- registry/svelte/dropdown/Dropdown.js.svelte -->
<script>
  /**
   * @typedef {{ value: string; label: string; disabled?: boolean }} DropdownOption
   */

  /** @type {{ options: DropdownOption[]; placeholder?: string; class?: string; value?: string; [key: string]: any }} */
  let {
    options,
    placeholder,
    value = $bindable(),
    class: className,
    ...rest
  } = $props();
</script>

<select
  class="win7-dropdown {className ?? ''}"
  bind:value
  {...rest}
>
  {#if placeholder}
    <option value="" disabled hidden>{placeholder}</option>
  {/if}
  {#each options as opt (opt.value)}
    <option value={opt.value} disabled={opt.disabled}>{opt.label}</option>
  {/each}
</select>

<style>
  /* inject-css.ts가 css/dropdown.css 내용을 여기에 자동 주입 */
</style>
```

### Step 3.4: CSS 주입 실행

- [ ] `pnpm inject-css -- --component dropdown --framework svelte` 실행
- [ ] 생성된 `<style>` 블록에 `dropdown.css` 내용이 정상 주입되었는지 확인

### Step 3.5: 검증

- [ ] `pnpm vitest run registry/svelte/dropdown` 실행하여 모든 테스트 통과 확인
- [ ] 커밋: `feat(dropdown): add Svelte TS/JS dropdown component`

---

## Task 4: Dropdown Vue TS/JS 구현

> Dropdown 컴포넌트의 Vue 3 (Composition API) TypeScript 및 JavaScript 버전을 구현한다.

### Step 4.1: 실패 테스트 작성 (TDD Red)

- [ ] `registry/vue/dropdown/__tests__/Dropdown.test.ts` 생성

```ts
// registry/vue/dropdown/__tests__/Dropdown.test.ts
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import Dropdown from "../Dropdown.vue";

describe("Dropdown (Vue)", () => {
  const options = [
    { value: "opt1", label: "Option 1" },
    { value: "opt2", label: "Option 2" },
    { value: "opt3", label: "Option 3" },
  ];

  it("renders a native select element", () => {
    render(Dropdown, { props: { options } });
    const select = screen.getByRole("combobox");
    expect(select).toBeDefined();
    expect(select.tagName).toBe("SELECT");
  });

  it("renders all provided options", () => {
    render(Dropdown, { props: { options } });
    const optionElements = screen.getAllByRole("option");
    expect(optionElements).toHaveLength(3);
  });

  it("renders a placeholder option when placeholder is provided", () => {
    render(Dropdown, { props: { options, placeholder: "Select..." } });
    const optionElements = screen.getAllByRole("option");
    expect(optionElements).toHaveLength(4);
    expect(optionElements[0].textContent).toBe("Select...");
  });

  it("applies win7-dropdown CSS class", () => {
    render(Dropdown, { props: { options } });
    const select = screen.getByRole("combobox");
    expect(select.className).toContain("win7-dropdown");
  });

  it("supports v-model via modelValue", () => {
    render(Dropdown, { props: { options, modelValue: "opt2" } });
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("opt2");
  });

  it("emits update:modelValue on change", async () => {
    const user = userEvent.setup();
    const { emitted } = render(Dropdown, { props: { options } });
    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "opt3");
    expect(emitted()["update:modelValue"]).toBeTruthy();
    expect(emitted()["update:modelValue"][0]).toEqual(["opt3"]);
  });

  it("renders as disabled when disabled prop is set", () => {
    render(Dropdown, { props: { options, disabled: true } });
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.disabled).toBe(true);
  });

  it("merges custom class", () => {
    render(Dropdown, { props: { options, class: "custom-class" } });
    const select = screen.getByRole("combobox");
    expect(select.className).toContain("custom-class");
    expect(select.className).toContain("win7-dropdown");
  });
});
```

### Step 4.2: Vue TypeScript 구현 (TDD Green)

- [ ] `registry/vue/dropdown/Dropdown.vue` 생성

```vue
<!-- registry/vue/dropdown/Dropdown.vue -->
<script setup lang="ts">
export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps {
  /** 드롭다운에 표시할 옵션 목록 */
  options: DropdownOption[];
  /** 선택 전 표시할 플레이스홀더 텍스트 */
  placeholder?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
}

const props = defineProps<DropdownProps>();

const model = defineModel<string>();

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  model.value = target.value;
}
</script>

<template>
  <select
    class="win7-dropdown"
    :value="model"
    :disabled="props.disabled"
    @change="handleChange"
  >
    <option v-if="props.placeholder" value="" disabled hidden>
      {{ props.placeholder }}
    </option>
    <option
      v-for="opt in props.options"
      :key="opt.value"
      :value="opt.value"
      :disabled="opt.disabled"
    >
      {{ opt.label }}
    </option>
  </select>
</template>

<style scoped>
  /* inject-css.ts가 css/dropdown.css 내용을 여기에 자동 주입 */
</style>
```

### Step 4.3: Vue JavaScript 구현

- [ ] `registry/vue/dropdown/Dropdown.js.vue` 생성

```vue
<!-- registry/vue/dropdown/Dropdown.js.vue -->
<script setup>
/**
 * @typedef {{ value: string; label: string; disabled?: boolean }} DropdownOption
 */

const props = defineProps({
  /** @type {DropdownOption[]} 드롭다운에 표시할 옵션 목록 */
  options: {
    type: Array,
    required: true,
  },
  /** @type {string} 선택 전 표시할 플레이스홀더 텍스트 */
  placeholder: {
    type: String,
    default: undefined,
  },
  /** @type {boolean} 비활성화 여부 */
  disabled: {
    type: Boolean,
    default: false,
  },
});

const model = defineModel();

function handleChange(event) {
  model.value = event.target.value;
}
</script>

<template>
  <select
    class="win7-dropdown"
    :value="model"
    :disabled="props.disabled"
    @change="handleChange"
  >
    <option v-if="props.placeholder" value="" disabled hidden>
      {{ props.placeholder }}
    </option>
    <option
      v-for="opt in props.options"
      :key="opt.value"
      :value="opt.value"
      :disabled="opt.disabled"
    >
      {{ opt.label }}
    </option>
  </select>
</template>

<style scoped>
  /* inject-css.ts가 css/dropdown.css 내용을 여기에 자동 주입 */
</style>
```

### Step 4.4: CSS 주입 실행

- [ ] `pnpm inject-css -- --component dropdown --framework vue` 실행
- [ ] 생성된 `<style scoped>` 블록에 `dropdown.css` 내용이 정상 주입되었는지 확인

### Step 4.5: 검증

- [ ] `pnpm vitest run registry/vue/dropdown` 실행하여 모든 테스트 통과 확인
- [ ] 커밋: `feat(dropdown): add Vue TS/JS dropdown component`

---

## Task 5: Dropdown 테스트 (3개 프레임워크 통합)

> 3개 프레임워크의 Dropdown 컴포넌트가 동일한 Props 계약을 준수하는지 크로스 프레임워크 테스트를 수행한다.

### Step 5.1: 크로스 프레임워크 Props 일관성 테스트

- [ ] `registry/__tests__/dropdown-cross-framework.test.ts` 생성

```ts
// registry/__tests__/dropdown-cross-framework.test.ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("Dropdown cross-framework consistency", () => {
  const registryRoot = resolve(__dirname, "..");
  const metadata = JSON.parse(
    readFileSync(resolve(registryRoot, "components/dropdown.json"), "utf-8")
  );

  it("metadata references all framework files", () => {
    expect(metadata.files.react.ts).toContain("react/dropdown/dropdown.tsx");
    expect(metadata.files.react.js).toContain("react/dropdown/dropdown.jsx");
    expect(metadata.files.svelte.ts).toContain("svelte/dropdown/Dropdown.svelte");
    expect(metadata.files.svelte.js).toContain("svelte/dropdown/Dropdown.js.svelte");
    expect(metadata.files.vue.ts).toContain("vue/dropdown/Dropdown.vue");
    expect(metadata.files.vue.js).toContain("vue/dropdown/Dropdown.js.vue");
  });

  it("all referenced files exist on disk", () => {
    const allFiles = [
      ...metadata.files.react.ts,
      ...metadata.files.react.js,
      ...metadata.files.svelte.ts,
      ...metadata.files.svelte.js,
      ...metadata.files.vue.ts,
      ...metadata.files.vue.js,
    ];
    for (const file of allFiles) {
      const fullPath = resolve(registryRoot, file);
      expect(() => readFileSync(fullPath)).not.toThrow();
    }
  });

  it("CSS file referenced in metadata exists", () => {
    for (const cssFile of metadata.css) {
      const fullPath = resolve(registryRoot, cssFile);
      expect(() => readFileSync(fullPath)).not.toThrow();
    }
  });
});
```

### Step 5.2: 전체 Dropdown 테스트 실행

- [ ] `pnpm vitest run registry/react/dropdown registry/svelte/dropdown registry/vue/dropdown registry/__tests__/dropdown-cross-framework` 실행
- [ ] 모든 테스트 통과 확인

### Step 5.3: 스냅샷 테스트

- [ ] `registry/react/dropdown/__tests__/dropdown.snapshot.test.tsx` 생성

```tsx
// registry/react/dropdown/__tests__/dropdown.snapshot.test.tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Dropdown } from "../dropdown";

describe("Dropdown snapshot (React)", () => {
  const options = [
    { value: "a", label: "Alpha" },
    { value: "b", label: "Beta" },
  ];

  it("matches default snapshot", () => {
    const { container } = render(<Dropdown options={options} />);
    expect(container.innerHTML).toMatchSnapshot();
  });

  it("matches snapshot with placeholder", () => {
    const { container } = render(
      <Dropdown options={options} placeholder="Choose..." />
    );
    expect(container.innerHTML).toMatchSnapshot();
  });

  it("matches disabled snapshot", () => {
    const { container } = render(<Dropdown options={options} disabled />);
    expect(container.innerHTML).toMatchSnapshot();
  });
});
```

- [ ] `pnpm vitest run --update registry/react/dropdown/__tests__/dropdown.snapshot` 실행하여 스냅샷 생성
- [ ] 커밋: `test(dropdown): add cross-framework and snapshot tests`

---

## Task 6: ComboBox 컴포넌트 (CSS + JSON + React + Svelte + Vue + 테스트)

> ComboBox는 텍스트 입력 + 드롭다운 목록의 조합 컴포넌트이다. Dropdown의 옵션 렌더링 로직을 재사용하되, 사용자가 직접 텍스트를 입력하여 필터링할 수 있는 기능을 추가한다.

### Step 6.1: CSS 파일 생성

- [ ] `registry/css/combobox.css` 생성

```css
/* registry/css/combobox.css */
/* 7.css 원본 기반 — .combobox 컴포지트 스타일 */

.win7-combobox {
  display: inline-block;
  position: relative;
}

.win7-combobox input[type="text"] {
  padding-right: 20px;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #8e8f8f;
  border-radius: 3px;
  font: 9pt "Segoe UI", SegoeUI, "Noto Sans", sans-serif;
  color: #222;
  padding: 2px 30px 2px 3px;
}

.win7-combobox input[type="text"]:focus {
  box-shadow: inset 0 0 0 2px #98d1ef;
  outline: 1px dotted #000;
  outline-offset: -4px;
}

.win7-combobox-toggle {
  background: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTExIDZINHYxaDF2MWgxdjFoMXYxaDFWOWgxVjhoMVY3aDFWNloiIGZpbGw9IiMwMDAiLz48L3N2Zz4=")
    50% no-repeat,
    linear-gradient(#f2f2f2 45%, #ebebeb 0, #cfcfcf);
  min-width: 16px;
  padding: 0;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  border: 1px solid #8e8f8f;
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
  border-bottom-right-radius: 3px;
  border-top-right-radius: 3px;
  cursor: pointer;
}

.win7-combobox-toggle:hover {
  background: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTExIDZINHYxaDF2MWgxdjFoMXYxaDFWOWgxVjhoMVY3aDFWNloiIGZpbGw9IiMwMDAiLz48L3N2Zz4=")
    50% no-repeat,
    linear-gradient(#eaf6fd 45%, #bee6fd 0, #a7d9f5);
  border-color: #3c7fb1;
}

.win7-combobox-toggle:active {
  background: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTExIDZINHYxaDF2MWgxdjFoMXYxaDFWOWgxVjhoMVY3aDFWNloiIGZpbGw9IiMwMDAiLz48L3N2Zz4=")
    50% no-repeat,
    linear-gradient(#e5f4fc, #c4e5f6 30% 50%, #98d1ef 50%, #68b3db);
  border-color: #6d91ab;
}

.win7-combobox-toggle:focus {
  box-shadow: none;
  outline: none;
}

.win7-combobox-listbox {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #fff;
  border: 1px solid #c0c1cd;
  max-height: 200px;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 0;
  font: 9pt "Segoe UI", SegoeUI, "Noto Sans", sans-serif;
}

.win7-combobox-listbox li {
  padding: 2px 4px;
  cursor: default;
}

.win7-combobox-listbox li:hover,
.win7-combobox-listbox li[aria-selected="true"] {
  background-color: #2a90ff;
  color: #fff;
}

.win7-combobox-listbox li.highlighted {
  background-color: #2a90ff;
  color: #fff;
}

.win7-combobox:has(input:disabled) .win7-combobox-toggle {
  background: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTExIDZINHYxaDF2MWgxdjFoMXYxaDFWOWgxVjhoMVY3aDFWNloiIGZpbGw9IiM4MzgzODMiLz48L3N2Zz4=")
    #f4f4f4;
  border-color: #adb2b5;
  pointer-events: none;
}
```

### Step 6.2: 메타데이터 JSON 생성

- [ ] `registry/components/combobox.json` 생성

```json
{
  "name": "combobox",
  "displayName": "ComboBox",
  "description": "Windows 7 스타일 콤보박스 (텍스트 입력 + 드롭다운 목록)",
  "dependencies": [],
  "css": ["css/combobox.css"],
  "files": {
    "react": {
      "ts": ["react/combobox/combobox.tsx"],
      "js": ["react/combobox/combobox.jsx"]
    },
    "svelte": {
      "ts": ["svelte/combobox/ComboBox.svelte"],
      "js": ["svelte/combobox/ComboBox.js.svelte"]
    },
    "vue": {
      "ts": ["vue/combobox/ComboBox.vue"],
      "js": ["vue/combobox/ComboBox.js.vue"]
    }
  }
}
```

### Step 6.3: 실패 테스트 작성 (TDD Red)

- [ ] `registry/react/combobox/__tests__/combobox.test.tsx` 생성

```tsx
// registry/react/combobox/__tests__/combobox.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComboBox } from "../combobox";

describe("ComboBox (React)", () => {
  const options = [
    { value: "opt1", label: "Option 1" },
    { value: "opt2", label: "Option 2" },
    { value: "opt3", label: "Another Option" },
  ];

  it("renders a text input and toggle button", () => {
    render(<ComboBox options={options} />);
    expect(screen.getByRole("combobox")).toBeDefined();
    expect(screen.getByRole("button", { name: /toggle/i })).toBeDefined();
  });

  it("opens the listbox when toggle button is clicked", async () => {
    const user = userEvent.setup();
    render(<ComboBox options={options} />);
    expect(screen.queryByRole("listbox")).toBeNull();
    await user.click(screen.getByRole("button", { name: /toggle/i }));
    expect(screen.getByRole("listbox")).toBeDefined();
  });

  it("renders all options in the listbox when opened", async () => {
    const user = userEvent.setup();
    render(<ComboBox options={options} />);
    await user.click(screen.getByRole("button", { name: /toggle/i }));
    const listItems = screen.getAllByRole("option");
    expect(listItems).toHaveLength(3);
  });

  it("filters options based on input text", async () => {
    const user = userEvent.setup();
    render(<ComboBox options={options} />);
    const input = screen.getByRole("combobox");
    await user.type(input, "Another");
    const listItems = screen.getAllByRole("option");
    expect(listItems).toHaveLength(1);
    expect(listItems[0].textContent).toBe("Another Option");
  });

  it("selects an option and closes the listbox", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ComboBox options={options} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: /toggle/i }));
    await user.click(screen.getByText("Option 2"));
    expect(onValueChange).toHaveBeenCalledWith("opt2");
    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(input.value).toBe("Option 2");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("supports controlled value", () => {
    render(<ComboBox options={options} value="opt1" onValueChange={() => {}} />);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(input.value).toBe("Option 1");
  });

  it("renders as disabled when disabled prop is set", () => {
    render(<ComboBox options={options} disabled />);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("closes the listbox when clicking outside", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <ComboBox options={options} />
        <div data-testid="outside">Outside</div>
      </div>
    );
    await user.click(screen.getByRole("button", { name: /toggle/i }));
    expect(screen.getByRole("listbox")).toBeDefined();
    await user.click(screen.getByTestId("outside"));
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("navigates options with keyboard arrows", async () => {
    const user = userEvent.setup();
    render(<ComboBox options={options} />);
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.click(screen.getByRole("button", { name: /toggle/i }));
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");
    expect((input as HTMLInputElement).value).toBe("Option 2");
  });

  it("merges custom className", () => {
    render(<ComboBox options={options} className="custom" />);
    const wrapper = screen.getByRole("combobox").parentElement;
    expect(wrapper?.className).toContain("custom");
  });

  it("applies win7-combobox CSS class to wrapper", () => {
    render(<ComboBox options={options} />);
    const wrapper = screen.getByRole("combobox").parentElement;
    expect(wrapper?.className).toContain("combobox");
  });
});
```

### Step 6.4: React TypeScript ComboBox 구현 (TDD Green)

- [ ] `registry/react/combobox/combobox.tsx` 생성

```tsx
// registry/react/combobox/combobox.tsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import styles from "../css/combobox.module.css";

export interface ComboBoxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ComboBoxProps {
  /** 콤보박스에 표시할 옵션 목록 */
  options: ComboBoxOption[];
  /** 현재 선택된 값 (controlled) */
  value?: string;
  /** 값 변경 시 콜백 */
  onValueChange?: (value: string) => void;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 추가 CSS 클래스 */
  className?: string;
}

export function ComboBox({
  options,
  value,
  onValueChange,
  placeholder,
  disabled = false,
  className,
}: ComboBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(() => {
    if (value != null) {
      const match = options.find((o) => o.value === value);
      return match ? match.label : "";
    }
    return "";
  });
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // controlled value 동기화
  useEffect(() => {
    if (value != null) {
      const match = options.find((o) => o.value === value);
      setInputValue(match ? match.label : "");
    }
  }, [value, options]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!inputValue) return options;
    const lower = inputValue.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(lower));
  }, [options, inputValue]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      setIsOpen(true);
      setHighlightedIndex(-1);
    },
    []
  );

  const handleSelect = useCallback(
    (opt: ComboBoxOption) => {
      setInputValue(opt.label);
      setIsOpen(false);
      onValueChange?.(opt.value);
    },
    [onValueChange]
  );

  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  }, [disabled]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          setIsOpen(true);
          return;
        }
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
            handleSelect(filteredOptions[highlightedIndex]);
          }
          break;
        case "Escape":
          setIsOpen(false);
          break;
      }
    },
    [isOpen, highlightedIndex, filteredOptions, handleSelect]
  );

  return (
    <div
      ref={wrapperRef}
      className={`${styles.combobox} ${className ?? ""}`.trim()}
    >
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
      />
      <button
        type="button"
        aria-label="toggle"
        tabIndex={-1}
        className={styles["combobox-toggle"]}
        onClick={handleToggle}
        disabled={disabled}
      />
      {isOpen && filteredOptions.length > 0 && (
        <ul role="listbox" className={styles["combobox-listbox"]}>
          {filteredOptions.map((opt, index) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={highlightedIndex === index}
              className={highlightedIndex === index ? styles.highlighted : undefined}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(opt);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Step 6.5: React JavaScript ComboBox 구현

- [ ] `registry/react/combobox/combobox.jsx` 생성

```jsx
// registry/react/combobox/combobox.jsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import styles from "../css/combobox.module.css";

/**
 * @typedef {{ value: string; label: string; disabled?: boolean }} ComboBoxOption
 */

/**
 * Windows 7 스타일 콤보박스 컴포넌트
 * @param {object} props
 * @param {ComboBoxOption[]} props.options - 콤보박스에 표시할 옵션 목록
 * @param {string} [props.value] - 현재 선택된 값 (controlled)
 * @param {(value: string) => void} [props.onValueChange] - 값 변경 시 콜백
 * @param {string} [props.placeholder] - 플레이스홀더 텍스트
 * @param {boolean} [props.disabled] - 비활성화 여부
 * @param {string} [props.className] - 추가 CSS 클래스
 */
export function ComboBox({
  options,
  value,
  onValueChange,
  placeholder,
  disabled = false,
  className,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(() => {
    if (value != null) {
      const match = options.find((o) => o.value === value);
      return match ? match.label : "";
    }
    return "";
  });
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (value != null) {
      const match = options.find((o) => o.value === value);
      setInputValue(match ? match.label : "");
    }
  }, [value, options]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!inputValue) return options;
    const lower = inputValue.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(lower));
  }, [options, inputValue]);

  const handleInputChange = useCallback((e) => {
    setInputValue(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  }, []);

  const handleSelect = useCallback(
    (opt) => {
      setInputValue(opt.label);
      setIsOpen(false);
      onValueChange?.(opt.value);
    },
    [onValueChange]
  );

  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  }, [disabled]);

  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          setIsOpen(true);
          return;
        }
      }
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
            handleSelect(filteredOptions[highlightedIndex]);
          }
          break;
        case "Escape":
          setIsOpen(false);
          break;
      }
    },
    [isOpen, highlightedIndex, filteredOptions, handleSelect]
  );

  return (
    <div
      ref={wrapperRef}
      className={`${styles.combobox} ${className ?? ""}`.trim()}
    >
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
      />
      <button
        type="button"
        aria-label="toggle"
        tabIndex={-1}
        className={styles["combobox-toggle"]}
        onClick={handleToggle}
        disabled={disabled}
      />
      {isOpen && filteredOptions.length > 0 && (
        <ul role="listbox" className={styles["combobox-listbox"]}>
          {filteredOptions.map((opt, index) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={highlightedIndex === index}
              className={highlightedIndex === index ? styles.highlighted : undefined}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(opt);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Step 6.6: Svelte TypeScript ComboBox 구현

- [ ] `registry/svelte/combobox/ComboBox.svelte` 생성

```svelte
<!-- registry/svelte/combobox/ComboBox.svelte -->
<script lang="ts">
  import type { Snippet } from "svelte";

  interface ComboBoxOption {
    value: string;
    label: string;
    disabled?: boolean;
  }

  interface Props {
    options: ComboBoxOption[];
    value?: string;
    onValueChange?: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    class?: string;
  }

  let {
    options,
    value = $bindable(),
    onValueChange,
    placeholder,
    disabled = false,
    class: className,
  }: Props = $props();

  let isOpen = $state(false);
  let inputValue = $state("");
  let highlightedIndex = $state(-1);
  let wrapperEl: HTMLDivElement | undefined = $state();

  // controlled value 동기화
  $effect(() => {
    if (value != null) {
      const match = options.find((o) => o.value === value);
      inputValue = match ? match.label : "";
    }
  });

  const filteredOptions = $derived(() => {
    if (!inputValue) return options;
    const lower = inputValue.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(lower));
  });

  function handleClickOutside(e: MouseEvent) {
    if (wrapperEl && !wrapperEl.contains(e.target as Node)) {
      isOpen = false;
    }
  }

  $effect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  });

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    inputValue = target.value;
    isOpen = true;
    highlightedIndex = -1;
  }

  function handleSelect(opt: ComboBoxOption) {
    inputValue = opt.label;
    value = opt.value;
    isOpen = false;
    onValueChange?.(opt.value);
  }

  function handleToggle() {
    if (!disabled) {
      isOpen = !isOpen;
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    const filtered = filteredOptions();
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        isOpen = true;
        return;
      }
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        highlightedIndex = highlightedIndex < filtered.length - 1
          ? highlightedIndex + 1
          : highlightedIndex;
        break;
      case "ArrowUp":
        e.preventDefault();
        highlightedIndex = highlightedIndex > 0
          ? highlightedIndex - 1
          : highlightedIndex;
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
          handleSelect(filtered[highlightedIndex]);
        }
        break;
      case "Escape":
        isOpen = false;
        break;
    }
  }
</script>

<div
  bind:this={wrapperEl}
  class="win7-combobox {className ?? ''}"
>
  <input
    type="text"
    role="combobox"
    aria-expanded={isOpen}
    aria-autocomplete="list"
    aria-haspopup="listbox"
    value={inputValue}
    oninput={handleInput}
    onkeydown={handleKeyDown}
    {placeholder}
    {disabled}
  />
  <button
    type="button"
    aria-label="toggle"
    tabindex={-1}
    class="win7-combobox-toggle"
    onclick={handleToggle}
    {disabled}
  ></button>
  {#if isOpen && filteredOptions().length > 0}
    <ul role="listbox" class="win7-combobox-listbox">
      {#each filteredOptions() as opt, index (opt.value)}
        <li
          role="option"
          aria-selected={highlightedIndex === index}
          class:highlighted={highlightedIndex === index}
          onmousedown={(e) => { e.preventDefault(); handleSelect(opt); }}
          onmouseenter={() => { highlightedIndex = index; }}
        >
          {opt.label}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  /* inject-css.ts가 css/combobox.css 내용을 여기에 자동 주입 */
</style>
```

### Step 6.7: Svelte JavaScript ComboBox 구현

- [ ] `registry/svelte/combobox/ComboBox.js.svelte` 생성

```svelte
<!-- registry/svelte/combobox/ComboBox.js.svelte -->
<script>
  /** @typedef {{ value: string; label: string; disabled?: boolean }} ComboBoxOption */

  /** @type {{ options: ComboBoxOption[]; value?: string; onValueChange?: (value: string) => void; placeholder?: string; disabled?: boolean; class?: string; }} */
  let {
    options,
    value = $bindable(),
    onValueChange,
    placeholder,
    disabled = false,
    class: className,
  } = $props();

  let isOpen = $state(false);
  let inputValue = $state("");
  let highlightedIndex = $state(-1);
  /** @type {HTMLDivElement | undefined} */
  let wrapperEl = $state();

  $effect(() => {
    if (value != null) {
      const match = options.find((o) => o.value === value);
      inputValue = match ? match.label : "";
    }
  });

  const filteredOptions = $derived(() => {
    if (!inputValue) return options;
    const lower = inputValue.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(lower));
  });

  /** @param {MouseEvent} e */
  function handleClickOutside(e) {
    if (wrapperEl && !wrapperEl.contains(/** @type {Node} */ (e.target))) {
      isOpen = false;
    }
  }

  $effect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  });

  /** @param {Event} e */
  function handleInput(e) {
    inputValue = /** @type {HTMLInputElement} */ (e.target).value;
    isOpen = true;
    highlightedIndex = -1;
  }

  /** @param {ComboBoxOption} opt */
  function handleSelect(opt) {
    inputValue = opt.label;
    value = opt.value;
    isOpen = false;
    onValueChange?.(opt.value);
  }

  function handleToggle() {
    if (!disabled) {
      isOpen = !isOpen;
    }
  }

  /** @param {KeyboardEvent} e */
  function handleKeyDown(e) {
    const filtered = filteredOptions();
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        isOpen = true;
        return;
      }
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        highlightedIndex = highlightedIndex < filtered.length - 1
          ? highlightedIndex + 1
          : highlightedIndex;
        break;
      case "ArrowUp":
        e.preventDefault();
        highlightedIndex = highlightedIndex > 0
          ? highlightedIndex - 1
          : highlightedIndex;
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
          handleSelect(filtered[highlightedIndex]);
        }
        break;
      case "Escape":
        isOpen = false;
        break;
    }
  }
</script>

<div
  bind:this={wrapperEl}
  class="win7-combobox {className ?? ''}"
>
  <input
    type="text"
    role="combobox"
    aria-expanded={isOpen}
    aria-autocomplete="list"
    aria-haspopup="listbox"
    value={inputValue}
    oninput={handleInput}
    onkeydown={handleKeyDown}
    {placeholder}
    {disabled}
  />
  <button
    type="button"
    aria-label="toggle"
    tabindex={-1}
    class="win7-combobox-toggle"
    onclick={handleToggle}
    {disabled}
  ></button>
  {#if isOpen && filteredOptions().length > 0}
    <ul role="listbox" class="win7-combobox-listbox">
      {#each filteredOptions() as opt, index (opt.value)}
        <li
          role="option"
          aria-selected={highlightedIndex === index}
          class:highlighted={highlightedIndex === index}
          onmousedown={(e) => { e.preventDefault(); handleSelect(opt); }}
          onmouseenter={() => { highlightedIndex = index; }}
        >
          {opt.label}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  /* inject-css.ts가 css/combobox.css 내용을 여기에 자동 주입 */
</style>
```

### Step 6.8: Vue TypeScript ComboBox 구현

- [ ] `registry/vue/combobox/ComboBox.vue` 생성

```vue
<!-- registry/vue/combobox/ComboBox.vue -->
<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";

export interface ComboBoxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ComboBoxProps {
  options: ComboBoxOption[];
  placeholder?: string;
  disabled?: boolean;
}

const props = defineProps<ComboBoxProps>();
const model = defineModel<string>();
const emit = defineEmits<{
  valueChange: [value: string];
}>();

const isOpen = ref(false);
const inputValue = ref("");
const highlightedIndex = ref(-1);
const wrapperRef = ref<HTMLDivElement | null>(null);

// controlled value 동기화
watch(
  () => model.value,
  (newVal) => {
    if (newVal != null) {
      const match = props.options.find((o) => o.value === newVal);
      inputValue.value = match ? match.label : "";
    }
  },
  { immediate: true }
);

const filteredOptions = computed(() => {
  if (!inputValue.value) return props.options;
  const lower = inputValue.value.toLowerCase();
  return props.options.filter((o) => o.label.toLowerCase().includes(lower));
});

function handleClickOutside(e: MouseEvent) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("mousedown", handleClickOutside);
});

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement;
  inputValue.value = target.value;
  isOpen.value = true;
  highlightedIndex.value = -1;
}

function handleSelect(opt: ComboBoxOption) {
  inputValue.value = opt.label;
  model.value = opt.value;
  isOpen.value = false;
  emit("valueChange", opt.value);
}

function handleToggle() {
  if (!props.disabled) {
    isOpen.value = !isOpen.value;
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (!isOpen.value) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      isOpen.value = true;
      return;
    }
  }
  switch (e.key) {
    case "ArrowDown":
      e.preventDefault();
      highlightedIndex.value =
        highlightedIndex.value < filteredOptions.value.length - 1
          ? highlightedIndex.value + 1
          : highlightedIndex.value;
      break;
    case "ArrowUp":
      e.preventDefault();
      highlightedIndex.value =
        highlightedIndex.value > 0
          ? highlightedIndex.value - 1
          : highlightedIndex.value;
      break;
    case "Enter":
      e.preventDefault();
      if (
        highlightedIndex.value >= 0 &&
        highlightedIndex.value < filteredOptions.value.length
      ) {
        handleSelect(filteredOptions.value[highlightedIndex.value]);
      }
      break;
    case "Escape":
      isOpen.value = false;
      break;
  }
}
</script>

<template>
  <div ref="wrapperRef" class="win7-combobox">
    <input
      type="text"
      role="combobox"
      :aria-expanded="isOpen"
      aria-autocomplete="list"
      aria-haspopup="listbox"
      :value="inputValue"
      @input="handleInput"
      @keydown="handleKeyDown"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
    />
    <button
      type="button"
      aria-label="toggle"
      :tabindex="-1"
      class="win7-combobox-toggle"
      @click="handleToggle"
      :disabled="props.disabled"
    ></button>
    <ul
      v-if="isOpen && filteredOptions.length > 0"
      role="listbox"
      class="win7-combobox-listbox"
    >
      <li
        v-for="(opt, index) in filteredOptions"
        :key="opt.value"
        role="option"
        :aria-selected="highlightedIndex === index"
        :class="{ highlighted: highlightedIndex === index }"
        @mousedown.prevent="handleSelect(opt)"
        @mouseenter="highlightedIndex = index"
      >
        {{ opt.label }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
  /* inject-css.ts가 css/combobox.css 내용을 여기에 자동 주입 */
</style>
```

### Step 6.9: Vue JavaScript ComboBox 구현

- [ ] `registry/vue/combobox/ComboBox.js.vue` 생성

```vue
<!-- registry/vue/combobox/ComboBox.js.vue -->
<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";

/**
 * @typedef {{ value: string; label: string; disabled?: boolean }} ComboBoxOption
 */

const props = defineProps({
  /** @type {ComboBoxOption[]} */
  options: { type: Array, required: true },
  /** @type {string} */
  placeholder: { type: String, default: undefined },
  /** @type {boolean} */
  disabled: { type: Boolean, default: false },
});

const model = defineModel();
const emit = defineEmits(["valueChange"]);

const isOpen = ref(false);
const inputValue = ref("");
const highlightedIndex = ref(-1);
const wrapperRef = ref(null);

watch(
  () => model.value,
  (newVal) => {
    if (newVal != null) {
      const match = props.options.find((o) => o.value === newVal);
      inputValue.value = match ? match.label : "";
    }
  },
  { immediate: true }
);

const filteredOptions = computed(() => {
  if (!inputValue.value) return props.options;
  const lower = inputValue.value.toLowerCase();
  return props.options.filter((o) => o.label.toLowerCase().includes(lower));
});

function handleClickOutside(e) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target)) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("mousedown", handleClickOutside);
});

function handleInput(e) {
  inputValue.value = e.target.value;
  isOpen.value = true;
  highlightedIndex.value = -1;
}

function handleSelect(opt) {
  inputValue.value = opt.label;
  model.value = opt.value;
  isOpen.value = false;
  emit("valueChange", opt.value);
}

function handleToggle() {
  if (!props.disabled) {
    isOpen.value = !isOpen.value;
  }
}

function handleKeyDown(e) {
  if (!isOpen.value) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      isOpen.value = true;
      return;
    }
  }
  switch (e.key) {
    case "ArrowDown":
      e.preventDefault();
      highlightedIndex.value =
        highlightedIndex.value < filteredOptions.value.length - 1
          ? highlightedIndex.value + 1
          : highlightedIndex.value;
      break;
    case "ArrowUp":
      e.preventDefault();
      highlightedIndex.value =
        highlightedIndex.value > 0
          ? highlightedIndex.value - 1
          : highlightedIndex.value;
      break;
    case "Enter":
      e.preventDefault();
      if (
        highlightedIndex.value >= 0 &&
        highlightedIndex.value < filteredOptions.value.length
      ) {
        handleSelect(filteredOptions.value[highlightedIndex.value]);
      }
      break;
    case "Escape":
      isOpen.value = false;
      break;
  }
}
</script>

<template>
  <div ref="wrapperRef" class="win7-combobox">
    <input
      type="text"
      role="combobox"
      :aria-expanded="isOpen"
      aria-autocomplete="list"
      aria-haspopup="listbox"
      :value="inputValue"
      @input="handleInput"
      @keydown="handleKeyDown"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
    />
    <button
      type="button"
      aria-label="toggle"
      :tabindex="-1"
      class="win7-combobox-toggle"
      @click="handleToggle"
      :disabled="props.disabled"
    ></button>
    <ul
      v-if="isOpen && filteredOptions.length > 0"
      role="listbox"
      class="win7-combobox-listbox"
    >
      <li
        v-for="(opt, index) in filteredOptions"
        :key="opt.value"
        role="option"
        :aria-selected="highlightedIndex === index"
        :class="{ highlighted: highlightedIndex === index }"
        @mousedown.prevent="handleSelect(opt)"
        @mouseenter="highlightedIndex = index"
      >
        {{ opt.label }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
  /* inject-css.ts가 css/combobox.css 내용을 여기에 자동 주입 */
</style>
```

### Step 6.10: ComboBox Svelte/Vue 테스트

- [ ] `registry/svelte/combobox/__tests__/ComboBox.test.ts` 생성

```ts
// registry/svelte/combobox/__tests__/ComboBox.test.ts
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import ComboBox from "../ComboBox.svelte";

describe("ComboBox (Svelte)", () => {
  const options = [
    { value: "opt1", label: "Option 1" },
    { value: "opt2", label: "Option 2" },
    { value: "opt3", label: "Another Option" },
  ];

  it("renders a text input and toggle button", () => {
    render(ComboBox, { props: { options } });
    expect(screen.getByRole("combobox")).toBeDefined();
    expect(screen.getByRole("button", { name: /toggle/i })).toBeDefined();
  });

  it("opens the listbox when toggle button is clicked", async () => {
    const user = userEvent.setup();
    render(ComboBox, { props: { options } });
    expect(screen.queryByRole("listbox")).toBeNull();
    await user.click(screen.getByRole("button", { name: /toggle/i }));
    expect(screen.getByRole("listbox")).toBeDefined();
  });

  it("filters options based on input text", async () => {
    const user = userEvent.setup();
    render(ComboBox, { props: { options } });
    const input = screen.getByRole("combobox");
    await user.type(input, "Another");
    const listItems = screen.getAllByRole("option");
    expect(listItems).toHaveLength(1);
    expect(listItems[0].textContent?.trim()).toBe("Another Option");
  });

  it("renders as disabled when disabled prop is set", () => {
    render(ComboBox, { props: { options, disabled: true } });
    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("applies win7-combobox CSS class to wrapper", () => {
    render(ComboBox, { props: { options } });
    const wrapper = screen.getByRole("combobox").parentElement;
    expect(wrapper?.className).toContain("win7-combobox");
  });
});
```

- [ ] `registry/vue/combobox/__tests__/ComboBox.test.ts` 생성

```ts
// registry/vue/combobox/__tests__/ComboBox.test.ts
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import ComboBox from "../ComboBox.vue";

describe("ComboBox (Vue)", () => {
  const options = [
    { value: "opt1", label: "Option 1" },
    { value: "opt2", label: "Option 2" },
    { value: "opt3", label: "Another Option" },
  ];

  it("renders a text input and toggle button", () => {
    render(ComboBox, { props: { options } });
    expect(screen.getByRole("combobox")).toBeDefined();
    expect(screen.getByRole("button", { name: /toggle/i })).toBeDefined();
  });

  it("opens the listbox when toggle button is clicked", async () => {
    const user = userEvent.setup();
    render(ComboBox, { props: { options } });
    expect(screen.queryByRole("listbox")).toBeNull();
    await user.click(screen.getByRole("button", { name: /toggle/i }));
    expect(screen.getByRole("listbox")).toBeDefined();
  });

  it("filters options based on input text", async () => {
    const user = userEvent.setup();
    render(ComboBox, { props: { options } });
    const input = screen.getByRole("combobox");
    await user.type(input, "Another");
    const listItems = screen.getAllByRole("option");
    expect(listItems).toHaveLength(1);
    expect(listItems[0].textContent?.trim()).toBe("Another Option");
  });

  it("emits valueChange on option select", async () => {
    const user = userEvent.setup();
    const { emitted } = render(ComboBox, { props: { options } });
    await user.click(screen.getByRole("button", { name: /toggle/i }));
    await user.click(screen.getByText("Option 2"));
    expect(emitted().valueChange).toBeTruthy();
    expect(emitted().valueChange[0]).toEqual(["opt2"]);
  });

  it("renders as disabled when disabled prop is set", () => {
    render(ComboBox, { props: { options, disabled: true } });
    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("applies win7-combobox CSS class to wrapper", () => {
    render(ComboBox, { props: { options } });
    const wrapper = screen.getByRole("combobox").parentElement;
    expect(wrapper?.className).toContain("win7-combobox");
  });
});
```

### Step 6.11: CSS 주입 실행 및 검증

- [ ] `pnpm inject-css -- --component combobox --framework svelte` 실행
- [ ] `pnpm inject-css -- --component combobox --framework vue` 실행
- [ ] `pnpm vitest run registry/react/combobox registry/svelte/combobox registry/vue/combobox` 실행하여 모든 테스트 통과 확인
- [ ] 커밋: `feat(combobox): add ComboBox component with dropdown reuse (CSS + JSON + React + Svelte + Vue)`

---

## Task 7: ListBox 컴포넌트 (CSS + JSON + React + Svelte + Vue + 테스트)

> ListBox는 스크롤 가능한 다중/단일 선택 목록 컴포넌트이다. `role="listbox"` ARIA 패턴을 사용한다.

### Step 7.1: CSS 파일 생성

- [ ] `registry/css/listbox.css` 생성

```css
/* registry/css/listbox.css */
/* 7.css 원본 기반 — [role=listbox] / select[multiple] 스타일 */

.win7-listbox {
  background: #fff;
  border: 1px solid #c0c1cd;
  display: block;
  font: 9pt "Segoe UI", SegoeUI, "Noto Sans", sans-serif;
  overflow-y: scroll;
  box-sizing: border-box;
}

.win7-listbox.has-shadow {
  box-shadow: 4px 4px 3px -2px #999;
}

.win7-listbox:focus {
  outline: none;
}

.win7-listbox-option {
  padding: 2px;
  cursor: default;
}

.win7-listbox.has-hover .win7-listbox-option:hover {
  background-color: #2a90ff;
  color: #fff;
}

.win7-listbox-option:focus,
.win7-listbox-option[aria-selected="true"] {
  background-color: #2a90ff;
  color: #fff;
}

.win7-listbox-option.selected {
  background-color: #2a90ff;
  color: #fff;
}
```

### Step 7.2: 메타데이터 JSON 생성

- [ ] `registry/components/listbox.json` 생성

```json
{
  "name": "listbox",
  "displayName": "ListBox",
  "description": "Windows 7 스타일 스크롤 가능한 선택 목록",
  "dependencies": [],
  "css": ["css/listbox.css"],
  "files": {
    "react": {
      "ts": ["react/listbox/listbox.tsx"],
      "js": ["react/listbox/listbox.jsx"]
    },
    "svelte": {
      "ts": ["svelte/listbox/ListBox.svelte"],
      "js": ["svelte/listbox/ListBox.js.svelte"]
    },
    "vue": {
      "ts": ["vue/listbox/ListBox.vue"],
      "js": ["vue/listbox/ListBox.js.vue"]
    }
  }
}
```

### Step 7.3: 실패 테스트 작성 (TDD Red)

- [ ] `registry/react/listbox/__tests__/listbox.test.tsx` 생성

```tsx
// registry/react/listbox/__tests__/listbox.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ListBox } from "../listbox";

describe("ListBox (React)", () => {
  const items = [
    { value: "a", label: "Alpha" },
    { value: "b", label: "Beta" },
    { value: "c", label: "Charlie" },
  ];

  it("renders a listbox role element", () => {
    render(<ListBox items={items} />);
    expect(screen.getByRole("listbox")).toBeDefined();
  });

  it("renders all items as option roles", () => {
    render(<ListBox items={items} />);
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);
    expect(options[0].textContent).toBe("Alpha");
    expect(options[1].textContent).toBe("Beta");
    expect(options[2].textContent).toBe("Charlie");
  });

  it("supports single selection mode (default)", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<ListBox items={items} onSelectionChange={onSelectionChange} />);
    await user.click(screen.getByText("Beta"));
    expect(onSelectionChange).toHaveBeenCalledWith(["b"]);
  });

  it("supports multi selection mode", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <ListBox items={items} selectionMode="multiple" onSelectionChange={onSelectionChange} />
    );
    await user.click(screen.getByText("Alpha"));
    await user.click(screen.getByText("Charlie"));
    expect(onSelectionChange).toHaveBeenLastCalledWith(["a", "c"]);
  });

  it("highlights the selected item with aria-selected", async () => {
    const user = userEvent.setup();
    render(<ListBox items={items} />);
    await user.click(screen.getByText("Beta"));
    const betaOption = screen.getByText("Beta");
    expect(betaOption.getAttribute("aria-selected")).toBe("true");
  });

  it("applies has-shadow class when hasShadow prop is true", () => {
    render(<ListBox items={items} hasShadow />);
    const listbox = screen.getByRole("listbox");
    expect(listbox.className).toContain("has-shadow");
  });

  it("applies has-hover class when hasHover prop is true", () => {
    render(<ListBox items={items} hasHover />);
    const listbox = screen.getByRole("listbox");
    expect(listbox.className).toContain("has-hover");
  });

  it("renders as controlled with selectedValues", () => {
    render(<ListBox items={items} selectedValues={["b"]} onSelectionChange={() => {}} />);
    const betaOption = screen.getByText("Beta");
    expect(betaOption.getAttribute("aria-selected")).toBe("true");
  });

  it("supports keyboard navigation with ArrowDown/ArrowUp", async () => {
    const user = userEvent.setup();
    render(<ListBox items={items} />);
    const listbox = screen.getByRole("listbox");
    listbox.focus();
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");
    const betaOption = screen.getByText("Beta");
    expect(betaOption.getAttribute("aria-selected")).toBe("true");
  });

  it("merges custom className", () => {
    render(<ListBox items={items} className="custom" />);
    const listbox = screen.getByRole("listbox");
    expect(listbox.className).toContain("custom");
    expect(listbox.className).toContain("listbox");
  });
});
```

### Step 7.4: React TypeScript ListBox 구현 (TDD Green)

- [ ] `registry/react/listbox/listbox.tsx` 생성

```tsx
// registry/react/listbox/listbox.tsx
import React, { useState, useCallback, useRef } from "react";
import styles from "../css/listbox.module.css";

export interface ListBoxItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ListBoxProps {
  /** 리스트에 표시할 항목 목록 */
  items: ListBoxItem[];
  /** 선택 모드: "single" (기본) 또는 "multiple" */
  selectionMode?: "single" | "multiple";
  /** 현재 선택된 값 목록 (controlled) */
  selectedValues?: string[];
  /** 선택 변경 시 콜백 */
  onSelectionChange?: (values: string[]) => void;
  /** 그림자 효과 표시 여부 */
  hasShadow?: boolean;
  /** hover 시 하이라이트 표시 여부 */
  hasHover?: boolean;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 리스트박스 높이 */
  style?: React.CSSProperties;
}

export function ListBox({
  items,
  selectionMode = "single",
  selectedValues: controlledValues,
  onSelectionChange,
  hasShadow = false,
  hasHover = false,
  className,
  style,
}: ListBoxProps) {
  const [internalSelected, setInternalSelected] = useState<string[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = controlledValues ?? internalSelected;

  const toggleSelection = useCallback(
    (value: string) => {
      let next: string[];
      if (selectionMode === "multiple") {
        next = selected.includes(value)
          ? selected.filter((v) => v !== value)
          : [...selected, value];
      } else {
        next = [value];
      }
      setInternalSelected(next);
      onSelectionChange?.(next);
    },
    [selected, selectionMode, onSelectionChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev < items.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < items.length) {
            toggleSelection(items[focusedIndex].value);
          }
          break;
        case "Home":
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case "End":
          e.preventDefault();
          setFocusedIndex(items.length - 1);
          break;
      }
    },
    [focusedIndex, items, toggleSelection]
  );

  const classNames = [
    styles.listbox,
    hasShadow && styles["has-shadow"],
    hasHover && styles["has-hover"],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ul
      ref={listRef}
      role="listbox"
      aria-multiselectable={selectionMode === "multiple"}
      className={classNames}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={style}
    >
      {items.map((item, index) => (
        <li
          key={item.value}
          role="option"
          aria-selected={selected.includes(item.value)}
          aria-disabled={item.disabled}
          className={`${styles["listbox-option"]} ${
            selected.includes(item.value) ? styles.selected : ""
          } ${focusedIndex === index ? styles.focused : ""}`.trim()}
          onClick={() => !item.disabled && toggleSelection(item.value)}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}
```

### Step 7.5: React JavaScript ListBox 구현

- [ ] `registry/react/listbox/listbox.jsx` 생성

```jsx
// registry/react/listbox/listbox.jsx
import React, { useState, useCallback, useRef } from "react";
import styles from "../css/listbox.module.css";

/**
 * @typedef {{ value: string; label: string; disabled?: boolean }} ListBoxItem
 */

/**
 * Windows 7 스타일 리스트박스 컴포넌트
 * @param {object} props
 * @param {ListBoxItem[]} props.items - 리스트에 표시할 항목 목록
 * @param {"single" | "multiple"} [props.selectionMode="single"] - 선택 모드
 * @param {string[]} [props.selectedValues] - 현재 선택된 값 목록 (controlled)
 * @param {(values: string[]) => void} [props.onSelectionChange] - 선택 변경 시 콜백
 * @param {boolean} [props.hasShadow=false] - 그림자 효과 표시 여부
 * @param {boolean} [props.hasHover=false] - hover 시 하이라이트 표시 여부
 * @param {string} [props.className] - 추가 CSS 클래스
 * @param {React.CSSProperties} [props.style] - 인라인 스타일
 */
export function ListBox({
  items,
  selectionMode = "single",
  selectedValues: controlledValues,
  onSelectionChange,
  hasShadow = false,
  hasHover = false,
  className,
  style,
}) {
  const [internalSelected, setInternalSelected] = useState([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const listRef = useRef(null);

  const selected = controlledValues ?? internalSelected;

  const toggleSelection = useCallback(
    (value) => {
      let next;
      if (selectionMode === "multiple") {
        next = selected.includes(value)
          ? selected.filter((v) => v !== value)
          : [...selected, value];
      } else {
        next = [value];
      }
      setInternalSelected(next);
      onSelectionChange?.(next);
    },
    [selected, selectionMode, onSelectionChange]
  );

  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev < items.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < items.length) {
            toggleSelection(items[focusedIndex].value);
          }
          break;
        case "Home":
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case "End":
          e.preventDefault();
          setFocusedIndex(items.length - 1);
          break;
      }
    },
    [focusedIndex, items, toggleSelection]
  );

  const classNames = [
    styles.listbox,
    hasShadow && styles["has-shadow"],
    hasHover && styles["has-hover"],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ul
      ref={listRef}
      role="listbox"
      aria-multiselectable={selectionMode === "multiple"}
      className={classNames}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={style}
    >
      {items.map((item, index) => (
        <li
          key={item.value}
          role="option"
          aria-selected={selected.includes(item.value)}
          aria-disabled={item.disabled}
          className={`${styles["listbox-option"]} ${
            selected.includes(item.value) ? styles.selected : ""
          } ${focusedIndex === index ? styles.focused : ""}`.trim()}
          onClick={() => !item.disabled && toggleSelection(item.value)}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}
```

### Step 7.6: Svelte TypeScript ListBox 구현

- [ ] `registry/svelte/listbox/ListBox.svelte` 생성

```svelte
<!-- registry/svelte/listbox/ListBox.svelte -->
<script lang="ts">
  interface ListBoxItem {
    value: string;
    label: string;
    disabled?: boolean;
  }

  interface Props {
    items: ListBoxItem[];
    selectionMode?: "single" | "multiple";
    selectedValues?: string[];
    onSelectionChange?: (values: string[]) => void;
    hasShadow?: boolean;
    hasHover?: boolean;
    class?: string;
  }

  let {
    items,
    selectionMode = "single",
    selectedValues = $bindable<string[]>([]),
    onSelectionChange,
    hasShadow = false,
    hasHover = false,
    class: className,
  }: Props = $props();

  let focusedIndex = $state(-1);

  function toggleSelection(value: string) {
    let next: string[];
    if (selectionMode === "multiple") {
      next = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];
    } else {
      next = [value];
    }
    selectedValues = next;
    onSelectionChange?.(next);
  }

  function handleKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusedIndex = focusedIndex < items.length - 1 ? focusedIndex + 1 : focusedIndex;
        break;
      case "ArrowUp":
        e.preventDefault();
        focusedIndex = focusedIndex > 0 ? focusedIndex - 1 : focusedIndex;
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < items.length) {
          toggleSelection(items[focusedIndex].value);
        }
        break;
      case "Home":
        e.preventDefault();
        focusedIndex = 0;
        break;
      case "End":
        e.preventDefault();
        focusedIndex = items.length - 1;
        break;
    }
  }
</script>

<ul
  role="listbox"
  aria-multiselectable={selectionMode === "multiple"}
  class="win7-listbox {hasShadow ? 'has-shadow' : ''} {hasHover ? 'has-hover' : ''} {className ?? ''}"
  tabindex="0"
  onkeydown={handleKeyDown}
>
  {#each items as item, index (item.value)}
    <li
      role="option"
      aria-selected={selectedValues.includes(item.value)}
      aria-disabled={item.disabled}
      class="win7-listbox-option"
      class:selected={selectedValues.includes(item.value)}
      onclick={() => !item.disabled && toggleSelection(item.value)}
    >
      {item.label}
    </li>
  {/each}
</ul>

<style>
  /* inject-css.ts가 css/listbox.css 내용을 여기에 자동 주입 */
</style>
```

### Step 7.7: Svelte JavaScript ListBox 구현

- [ ] `registry/svelte/listbox/ListBox.js.svelte` 생성

```svelte
<!-- registry/svelte/listbox/ListBox.js.svelte -->
<script>
  /** @typedef {{ value: string; label: string; disabled?: boolean }} ListBoxItem */

  /** @type {{ items: ListBoxItem[]; selectionMode?: "single" | "multiple"; selectedValues?: string[]; onSelectionChange?: (values: string[]) => void; hasShadow?: boolean; hasHover?: boolean; class?: string; }} */
  let {
    items,
    selectionMode = "single",
    selectedValues = $bindable([]),
    onSelectionChange,
    hasShadow = false,
    hasHover = false,
    class: className,
  } = $props();

  let focusedIndex = $state(-1);

  /** @param {string} value */
  function toggleSelection(value) {
    let next;
    if (selectionMode === "multiple") {
      next = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];
    } else {
      next = [value];
    }
    selectedValues = next;
    onSelectionChange?.(next);
  }

  /** @param {KeyboardEvent} e */
  function handleKeyDown(e) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusedIndex = focusedIndex < items.length - 1 ? focusedIndex + 1 : focusedIndex;
        break;
      case "ArrowUp":
        e.preventDefault();
        focusedIndex = focusedIndex > 0 ? focusedIndex - 1 : focusedIndex;
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < items.length) {
          toggleSelection(items[focusedIndex].value);
        }
        break;
      case "Home":
        e.preventDefault();
        focusedIndex = 0;
        break;
      case "End":
        e.preventDefault();
        focusedIndex = items.length - 1;
        break;
    }
  }
</script>

<ul
  role="listbox"
  aria-multiselectable={selectionMode === "multiple"}
  class="win7-listbox {hasShadow ? 'has-shadow' : ''} {hasHover ? 'has-hover' : ''} {className ?? ''}"
  tabindex="0"
  onkeydown={handleKeyDown}
>
  {#each items as item, index (item.value)}
    <li
      role="option"
      aria-selected={selectedValues.includes(item.value)}
      aria-disabled={item.disabled}
      class="win7-listbox-option"
      class:selected={selectedValues.includes(item.value)}
      onclick={() => !item.disabled && toggleSelection(item.value)}
    >
      {item.label}
    </li>
  {/each}
</ul>

<style>
  /* inject-css.ts가 css/listbox.css 내용을 여기에 자동 주입 */
</style>
```

### Step 7.8: Vue TypeScript ListBox 구현

- [ ] `registry/vue/listbox/ListBox.vue` 생성

```vue
<!-- registry/vue/listbox/ListBox.vue -->
<script setup lang="ts">
import { ref, computed } from "vue";

export interface ListBoxItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ListBoxProps {
  items: ListBoxItem[];
  selectionMode?: "single" | "multiple";
  hasShadow?: boolean;
  hasHover?: boolean;
}

const props = withDefaults(defineProps<ListBoxProps>(), {
  selectionMode: "single",
  hasShadow: false,
  hasHover: false,
});

const selectedValues = defineModel<string[]>("selectedValues", { default: () => [] });
const emit = defineEmits<{
  selectionChange: [values: string[]];
}>();

const focusedIndex = ref(-1);

function toggleSelection(value: string) {
  let next: string[];
  if (props.selectionMode === "multiple") {
    next = selectedValues.value.includes(value)
      ? selectedValues.value.filter((v) => v !== value)
      : [...selectedValues.value, value];
  } else {
    next = [value];
  }
  selectedValues.value = next;
  emit("selectionChange", next);
}

function handleKeyDown(e: KeyboardEvent) {
  switch (e.key) {
    case "ArrowDown":
      e.preventDefault();
      focusedIndex.value =
        focusedIndex.value < props.items.length - 1
          ? focusedIndex.value + 1
          : focusedIndex.value;
      break;
    case "ArrowUp":
      e.preventDefault();
      focusedIndex.value =
        focusedIndex.value > 0
          ? focusedIndex.value - 1
          : focusedIndex.value;
      break;
    case "Enter":
    case " ":
      e.preventDefault();
      if (focusedIndex.value >= 0 && focusedIndex.value < props.items.length) {
        toggleSelection(props.items[focusedIndex.value].value);
      }
      break;
    case "Home":
      e.preventDefault();
      focusedIndex.value = 0;
      break;
    case "End":
      e.preventDefault();
      focusedIndex.value = props.items.length - 1;
      break;
  }
}

const listboxClass = computed(() =>
  [
    "win7-listbox",
    props.hasShadow && "has-shadow",
    props.hasHover && "has-hover",
  ]
    .filter(Boolean)
    .join(" ")
);
</script>

<template>
  <ul
    role="listbox"
    :aria-multiselectable="props.selectionMode === 'multiple'"
    :class="listboxClass"
    tabindex="0"
    @keydown="handleKeyDown"
  >
    <li
      v-for="(item, index) in props.items"
      :key="item.value"
      role="option"
      :aria-selected="selectedValues.includes(item.value)"
      :aria-disabled="item.disabled"
      :class="[
        'win7-listbox-option',
        selectedValues.includes(item.value) && 'selected',
      ]"
      @click="!item.disabled && toggleSelection(item.value)"
    >
      {{ item.label }}
    </li>
  </ul>
</template>

<style scoped>
  /* inject-css.ts가 css/listbox.css 내용을 여기에 자동 주입 */
</style>
```

### Step 7.9: Vue JavaScript ListBox 구현

- [ ] `registry/vue/listbox/ListBox.js.vue` 생성

```vue
<!-- registry/vue/listbox/ListBox.js.vue -->
<script setup>
import { ref, computed } from "vue";

/**
 * @typedef {{ value: string; label: string; disabled?: boolean }} ListBoxItem
 */

const props = defineProps({
  /** @type {ListBoxItem[]} */
  items: { type: Array, required: true },
  /** @type {"single" | "multiple"} */
  selectionMode: { type: String, default: "single" },
  /** @type {boolean} */
  hasShadow: { type: Boolean, default: false },
  /** @type {boolean} */
  hasHover: { type: Boolean, default: false },
});

const selectedValues = defineModel("selectedValues", { default: () => [] });
const emit = defineEmits(["selectionChange"]);

const focusedIndex = ref(-1);

function toggleSelection(value) {
  let next;
  if (props.selectionMode === "multiple") {
    next = selectedValues.value.includes(value)
      ? selectedValues.value.filter((v) => v !== value)
      : [...selectedValues.value, value];
  } else {
    next = [value];
  }
  selectedValues.value = next;
  emit("selectionChange", next);
}

function handleKeyDown(e) {
  switch (e.key) {
    case "ArrowDown":
      e.preventDefault();
      focusedIndex.value =
        focusedIndex.value < props.items.length - 1
          ? focusedIndex.value + 1
          : focusedIndex.value;
      break;
    case "ArrowUp":
      e.preventDefault();
      focusedIndex.value =
        focusedIndex.value > 0
          ? focusedIndex.value - 1
          : focusedIndex.value;
      break;
    case "Enter":
    case " ":
      e.preventDefault();
      if (focusedIndex.value >= 0 && focusedIndex.value < props.items.length) {
        toggleSelection(props.items[focusedIndex.value].value);
      }
      break;
    case "Home":
      e.preventDefault();
      focusedIndex.value = 0;
      break;
    case "End":
      e.preventDefault();
      focusedIndex.value = props.items.length - 1;
      break;
  }
}

const listboxClass = computed(() =>
  [
    "win7-listbox",
    props.hasShadow && "has-shadow",
    props.hasHover && "has-hover",
  ]
    .filter(Boolean)
    .join(" ")
);
</script>

<template>
  <ul
    role="listbox"
    :aria-multiselectable="props.selectionMode === 'multiple'"
    :class="listboxClass"
    tabindex="0"
    @keydown="handleKeyDown"
  >
    <li
      v-for="(item, index) in props.items"
      :key="item.value"
      role="option"
      :aria-selected="selectedValues.includes(item.value)"
      :aria-disabled="item.disabled"
      :class="[
        'win7-listbox-option',
        selectedValues.includes(item.value) && 'selected',
      ]"
      @click="!item.disabled && toggleSelection(item.value)"
    >
      {{ item.label }}
    </li>
  </ul>
</template>

<style scoped>
  /* inject-css.ts가 css/listbox.css 내용을 여기에 자동 주입 */
</style>
```

### Step 7.10: ListBox Svelte/Vue 테스트

- [ ] `registry/svelte/listbox/__tests__/ListBox.test.ts` 생성

```ts
// registry/svelte/listbox/__tests__/ListBox.test.ts
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import ListBox from "../ListBox.svelte";

describe("ListBox (Svelte)", () => {
  const items = [
    { value: "a", label: "Alpha" },
    { value: "b", label: "Beta" },
    { value: "c", label: "Charlie" },
  ];

  it("renders a listbox role element", () => {
    render(ListBox, { props: { items } });
    expect(screen.getByRole("listbox")).toBeDefined();
  });

  it("renders all items as option roles", () => {
    render(ListBox, { props: { items } });
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);
  });

  it("highlights selected item with aria-selected", async () => {
    const user = userEvent.setup();
    render(ListBox, { props: { items } });
    await user.click(screen.getByText("Beta"));
    expect(screen.getByText("Beta").getAttribute("aria-selected")).toBe("true");
  });

  it("applies has-shadow class when hasShadow is true", () => {
    render(ListBox, { props: { items, hasShadow: true } });
    const listbox = screen.getByRole("listbox");
    expect(listbox.className).toContain("has-shadow");
  });

  it("applies has-hover class when hasHover is true", () => {
    render(ListBox, { props: { items, hasHover: true } });
    const listbox = screen.getByRole("listbox");
    expect(listbox.className).toContain("has-hover");
  });

  it("applies win7-listbox CSS class", () => {
    render(ListBox, { props: { items } });
    const listbox = screen.getByRole("listbox");
    expect(listbox.className).toContain("win7-listbox");
  });
});
```

- [ ] `registry/vue/listbox/__tests__/ListBox.test.ts` 생성

```ts
// registry/vue/listbox/__tests__/ListBox.test.ts
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import ListBox from "../ListBox.vue";

describe("ListBox (Vue)", () => {
  const items = [
    { value: "a", label: "Alpha" },
    { value: "b", label: "Beta" },
    { value: "c", label: "Charlie" },
  ];

  it("renders a listbox role element", () => {
    render(ListBox, { props: { items } });
    expect(screen.getByRole("listbox")).toBeDefined();
  });

  it("renders all items as option roles", () => {
    render(ListBox, { props: { items } });
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);
  });

  it("emits selectionChange on click", async () => {
    const user = userEvent.setup();
    const { emitted } = render(ListBox, { props: { items } });
    await user.click(screen.getByText("Beta"));
    expect(emitted().selectionChange).toBeTruthy();
    expect(emitted().selectionChange[0]).toEqual([["b"]]);
  });

  it("applies has-shadow class when hasShadow is true", () => {
    render(ListBox, { props: { items, hasShadow: true } });
    const listbox = screen.getByRole("listbox");
    expect(listbox.className).toContain("has-shadow");
  });

  it("applies win7-listbox CSS class", () => {
    render(ListBox, { props: { items } });
    const listbox = screen.getByRole("listbox");
    expect(listbox.className).toContain("win7-listbox");
  });
});
```

### Step 7.11: CSS 주입 실행 및 검증

- [ ] `pnpm inject-css -- --component listbox --framework svelte` 실행
- [ ] `pnpm inject-css -- --component listbox --framework vue` 실행
- [ ] `pnpm vitest run registry/react/listbox registry/svelte/listbox registry/vue/listbox` 실행하여 모든 테스트 통과 확인
- [ ] 커밋: `feat(listbox): add ListBox component (CSS + JSON + React + Svelte + Vue)`

---

## Task 8: ListView 컴포넌트 (CSS + JSON + React + Svelte + Vue + 테스트)

> ListView는 테이블 기반의 정렬 가능한 데이터 목록 컴포넌트이다. 스크롤은 브라우저 기본 스크롤을 사용한다.

### Step 8.1: CSS 파일 생성

- [ ] `registry/css/listview.css` 생성

```css
/* registry/css/listview.css */
/* 7.css 원본 기반 — table (listview) 스타일 */

.win7-listview {
  background-color: #fff;
  border: 1px solid #c0c1cd;
  border-collapse: collapse;
  font: 9pt "Segoe UI", SegoeUI, "Noto Sans", sans-serif;
  position: relative;
  table-layout: fixed;
  text-align: left;
  white-space: nowrap;
  width: 100%;
}

.win7-listview td,
.win7-listview th {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.win7-listview.has-shadow {
  box-shadow: 4px 4px 3px -2px #999;
}

.win7-listview > thead > tr > * {
  background: linear-gradient(180deg, #fff 45%, #fafafa 0, #f0f0f0);
  border: 1px solid #d7d7d7;
  box-sizing: border-box;
  cursor: default;
  font-weight: 400;
  height: 22px;
  padding: 0 8px;
  position: sticky;
  top: 0;
}

.win7-listview > thead > tr > .highlighted {
  background: linear-gradient(180deg, #f3f9fc 45%, #e4f0f8 0, #d9eaf5);
  border: 1px solid #a7d8f5;
  border-radius: 3px;
}

.win7-listview > thead > tr > .highlighted:not(:last-child) {
  border-right-color: #a7d8f5;
}

.win7-listview > thead > tr > .highlighted.indicator::before {
  background: linear-gradient(to bottom right, #667f91 45%, #90c1e2 65%, #cce3f2);
  clip-path: polygon(0 0, 50% 100%, 100% 0);
  content: "";
  height: 5px;
  position: absolute;
  right: 50%;
  top: 0;
  width: 6px;
}

.win7-listview > thead > tr > .highlighted.indicator.up::before {
  clip-path: polygon(0 100%, 50% 0, 100% 100%);
}

.win7-listview > tbody > tr {
  cursor: default;
}

.win7-listview > tbody > tr.highlighted {
  background: linear-gradient(#fff9, #e6ecf5cc 90%, #fffc);
  border: 1px solid #aaddfa;
  border-radius: 3px;
}

.win7-listview > tbody > tr.highlighted > :not(:last-child) {
  border-right: none;
}

.win7-listview > tbody > tr > * {
  height: 14px;
  padding: 2px 8px;
}

.win7-listview > tbody > tr > :not(:last-child) {
  border-right: 1px solid #eee;
}
```

### Step 8.2: 메타데이터 JSON 생성

- [ ] `registry/components/listview.json` 생성

```json
{
  "name": "listview",
  "displayName": "ListView",
  "description": "Windows 7 스타일 테이블 기반 데이터 목록 (정렬 가능 헤더)",
  "dependencies": [],
  "css": ["css/listview.css"],
  "files": {
    "react": {
      "ts": ["react/listview/listview.tsx"],
      "js": ["react/listview/listview.jsx"]
    },
    "svelte": {
      "ts": ["svelte/listview/ListView.svelte"],
      "js": ["svelte/listview/ListView.js.svelte"]
    },
    "vue": {
      "ts": ["vue/listview/ListView.vue"],
      "js": ["vue/listview/ListView.js.vue"]
    }
  }
}
```

### Step 8.3: 실패 테스트 작성 (TDD Red)

- [ ] `registry/react/listview/__tests__/listview.test.tsx` 생성

```tsx
// registry/react/listview/__tests__/listview.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ListView } from "../listview";

describe("ListView (React)", () => {
  const columns = [
    { key: "name", label: "Name", width: 200 },
    { key: "size", label: "Size", width: 100 },
    { key: "type", label: "Type", width: 150 },
  ];

  const data = [
    { name: "Document.txt", size: "12 KB", type: "Text" },
    { name: "Photo.jpg", size: "2.4 MB", type: "Image" },
    { name: "Music.mp3", size: "5.1 MB", type: "Audio" },
  ];

  it("renders a table element", () => {
    render(<ListView columns={columns} data={data} />);
    expect(screen.getByRole("table")).toBeDefined();
  });

  it("renders column headers", () => {
    render(<ListView columns={columns} data={data} />);
    expect(screen.getByText("Name")).toBeDefined();
    expect(screen.getByText("Size")).toBeDefined();
    expect(screen.getByText("Type")).toBeDefined();
  });

  it("renders all data rows", () => {
    render(<ListView columns={columns} data={data} />);
    expect(screen.getByText("Document.txt")).toBeDefined();
    expect(screen.getByText("Photo.jpg")).toBeDefined();
    expect(screen.getByText("Music.mp3")).toBeDefined();
  });

  it("calls onSort when a column header is clicked", async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(<ListView columns={columns} data={data} onSort={onSort} />);
    await user.click(screen.getByText("Name"));
    expect(onSort).toHaveBeenCalledWith("name", "asc");
  });

  it("toggles sort direction on subsequent clicks", async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(<ListView columns={columns} data={data} onSort={onSort} />);
    await user.click(screen.getByText("Name"));
    expect(onSort).toHaveBeenCalledWith("name", "asc");
    await user.click(screen.getByText("Name"));
    expect(onSort).toHaveBeenCalledWith("name", "desc");
  });

  it("highlights the sorted column header", async () => {
    const user = userEvent.setup();
    render(<ListView columns={columns} data={data} sortKey="name" sortDirection="asc" />);
    const nameHeader = screen.getByText("Name").closest("th");
    expect(nameHeader?.className).toContain("highlighted");
    expect(nameHeader?.className).toContain("indicator");
  });

  it("shows up indicator for ascending sort", () => {
    render(<ListView columns={columns} data={data} sortKey="name" sortDirection="asc" />);
    const nameHeader = screen.getByText("Name").closest("th");
    expect(nameHeader?.className).toContain("up");
  });

  it("highlights a row when clicked", async () => {
    const user = userEvent.setup();
    const onRowSelect = vi.fn();
    render(<ListView columns={columns} data={data} onRowSelect={onRowSelect} />);
    const row = screen.getByText("Photo.jpg").closest("tr");
    await user.click(row!);
    expect(row?.className).toContain("highlighted");
    expect(onRowSelect).toHaveBeenCalledWith(1, data[1]);
  });

  it("applies has-shadow class when hasShadow prop is true", () => {
    render(<ListView columns={columns} data={data} hasShadow />);
    const table = screen.getByRole("table");
    expect(table.className).toContain("has-shadow");
  });

  it("applies win7-listview CSS class", () => {
    render(<ListView columns={columns} data={data} />);
    const table = screen.getByRole("table");
    expect(table.className).toContain("listview");
  });

  it("merges custom className", () => {
    render(<ListView columns={columns} data={data} className="custom" />);
    const table = screen.getByRole("table");
    expect(table.className).toContain("custom");
  });
});
```

### Step 8.4: React TypeScript ListView 구현 (TDD Green)

- [ ] `registry/react/listview/listview.tsx` 생성

```tsx
// registry/react/listview/listview.tsx
import React, { useState, useCallback } from "react";
import styles from "../css/listview.module.css";

export interface ListViewColumn {
  /** 데이터 객체의 키 */
  key: string;
  /** 헤더에 표시할 레이블 */
  label: string;
  /** 컬럼 너비 (px) */
  width?: number;
}

export type SortDirection = "asc" | "desc";

export interface ListViewProps {
  /** 컬럼 정의 목록 */
  columns: ListViewColumn[];
  /** 데이터 행 목록 (Record<string, ReactNode>) */
  data: Record<string, React.ReactNode>[];
  /** 현재 정렬 컬럼 키 */
  sortKey?: string;
  /** 현재 정렬 방향 */
  sortDirection?: SortDirection;
  /** 정렬 변경 시 콜백 */
  onSort?: (key: string, direction: SortDirection) => void;
  /** 행 선택 시 콜백 */
  onRowSelect?: (index: number, row: Record<string, React.ReactNode>) => void;
  /** 그림자 효과 표시 여부 */
  hasShadow?: boolean;
  /** 추가 CSS 클래스 */
  className?: string;
}

export function ListView({
  columns,
  data,
  sortKey: controlledSortKey,
  sortDirection: controlledSortDirection,
  onSort,
  onRowSelect,
  hasShadow = false,
  className,
}: ListViewProps) {
  const [internalSortKey, setInternalSortKey] = useState<string | undefined>();
  const [internalSortDirection, setInternalSortDirection] =
    useState<SortDirection>("asc");
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  const sortKey = controlledSortKey ?? internalSortKey;
  const sortDirection = controlledSortDirection ?? internalSortDirection;

  const handleHeaderClick = useCallback(
    (key: string) => {
      let nextDirection: SortDirection = "asc";
      if (sortKey === key) {
        nextDirection = sortDirection === "asc" ? "desc" : "asc";
      }
      setInternalSortKey(key);
      setInternalSortDirection(nextDirection);
      onSort?.(key, nextDirection);
    },
    [sortKey, sortDirection, onSort]
  );

  const handleRowClick = useCallback(
    (index: number) => {
      setSelectedRowIndex(index);
      onRowSelect?.(index, data[index]);
    },
    [data, onRowSelect]
  );

  const tableClass = [
    styles.listview,
    hasShadow && styles["has-shadow"],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <table className={tableClass}>
      <thead>
        <tr>
          {columns.map((col) => {
            const isActive = sortKey === col.key;
            const headerClass = [
              isActive && styles.highlighted,
              isActive && styles.indicator,
              isActive && sortDirection === "asc" && styles.up,
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <th
                key={col.key}
                className={headerClass || undefined}
                style={col.width ? { width: col.width } : undefined}
                onClick={() => handleHeaderClick(col.key)}
              >
                {col.label}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            className={
              selectedRowIndex === rowIndex ? styles.highlighted : undefined
            }
            onClick={() => handleRowClick(rowIndex)}
          >
            {columns.map((col) => (
              <td key={col.key}>{row[col.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Step 8.5: React JavaScript ListView 구현

- [ ] `registry/react/listview/listview.jsx` 생성

```jsx
// registry/react/listview/listview.jsx
import React, { useState, useCallback } from "react";
import styles from "../css/listview.module.css";

/**
 * @typedef {{ key: string; label: string; width?: number }} ListViewColumn
 * @typedef {"asc" | "desc"} SortDirection
 */

/**
 * Windows 7 스타일 리스트뷰 (테이블 기반) 컴포넌트
 * @param {object} props
 * @param {ListViewColumn[]} props.columns - 컬럼 정의 목록
 * @param {Record<string, React.ReactNode>[]} props.data - 데이터 행 목록
 * @param {string} [props.sortKey] - 현재 정렬 컬럼 키
 * @param {SortDirection} [props.sortDirection] - 현재 정렬 방향
 * @param {(key: string, direction: SortDirection) => void} [props.onSort] - 정렬 변경 시 콜백
 * @param {(index: number, row: Record<string, React.ReactNode>) => void} [props.onRowSelect] - 행 선택 시 콜백
 * @param {boolean} [props.hasShadow=false] - 그림자 효과 표시 여부
 * @param {string} [props.className] - 추가 CSS 클래스
 */
export function ListView({
  columns,
  data,
  sortKey: controlledSortKey,
  sortDirection: controlledSortDirection,
  onSort,
  onRowSelect,
  hasShadow = false,
  className,
}) {
  const [internalSortKey, setInternalSortKey] = useState(undefined);
  const [internalSortDirection, setInternalSortDirection] = useState("asc");
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  const sortKey = controlledSortKey ?? internalSortKey;
  const sortDirection = controlledSortDirection ?? internalSortDirection;

  const handleHeaderClick = useCallback(
    (key) => {
      let nextDirection = "asc";
      if (sortKey === key) {
        nextDirection = sortDirection === "asc" ? "desc" : "asc";
      }
      setInternalSortKey(key);
      setInternalSortDirection(nextDirection);
      onSort?.(key, nextDirection);
    },
    [sortKey, sortDirection, onSort]
  );

  const handleRowClick = useCallback(
    (index) => {
      setSelectedRowIndex(index);
      onRowSelect?.(index, data[index]);
    },
    [data, onRowSelect]
  );

  const tableClass = [
    styles.listview,
    hasShadow && styles["has-shadow"],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <table className={tableClass}>
      <thead>
        <tr>
          {columns.map((col) => {
            const isActive = sortKey === col.key;
            const headerClass = [
              isActive && styles.highlighted,
              isActive && styles.indicator,
              isActive && sortDirection === "asc" && styles.up,
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <th
                key={col.key}
                className={headerClass || undefined}
                style={col.width ? { width: col.width } : undefined}
                onClick={() => handleHeaderClick(col.key)}
              >
                {col.label}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            className={
              selectedRowIndex === rowIndex ? styles.highlighted : undefined
            }
            onClick={() => handleRowClick(rowIndex)}
          >
            {columns.map((col) => (
              <td key={col.key}>{row[col.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Step 8.6: Svelte TypeScript ListView 구현

- [ ] `registry/svelte/listview/ListView.svelte` 생성

```svelte
<!-- registry/svelte/listview/ListView.svelte -->
<script lang="ts">
  interface ListViewColumn {
    key: string;
    label: string;
    width?: number;
  }

  type SortDirection = "asc" | "desc";

  interface Props {
    columns: ListViewColumn[];
    data: Record<string, any>[];
    sortKey?: string;
    sortDirection?: SortDirection;
    onSort?: (key: string, direction: SortDirection) => void;
    onRowSelect?: (index: number, row: Record<string, any>) => void;
    hasShadow?: boolean;
    class?: string;
  }

  let {
    columns,
    data,
    sortKey = $bindable<string | undefined>(undefined),
    sortDirection = $bindable<SortDirection>("asc"),
    onSort,
    onRowSelect,
    hasShadow = false,
    class: className,
  }: Props = $props();

  let selectedRowIndex: number | null = $state(null);

  function handleHeaderClick(key: string) {
    let nextDirection: SortDirection = "asc";
    if (sortKey === key) {
      nextDirection = sortDirection === "asc" ? "desc" : "asc";
    }
    sortKey = key;
    sortDirection = nextDirection;
    onSort?.(key, nextDirection);
  }

  function handleRowClick(index: number) {
    selectedRowIndex = index;
    onRowSelect?.(index, data[index]);
  }
</script>

<table
  class="win7-listview {hasShadow ? 'has-shadow' : ''} {className ?? ''}"
>
  <thead>
    <tr>
      {#each columns as col (col.key)}
        {@const isActive = sortKey === col.key}
        <th
          class:highlighted={isActive}
          class:indicator={isActive}
          class:up={isActive && sortDirection === "asc"}
          style={col.width ? `width: ${col.width}px` : undefined}
          onclick={() => handleHeaderClick(col.key)}
        >
          {col.label}
        </th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each data as row, rowIndex}
      <tr
        class:highlighted={selectedRowIndex === rowIndex}
        onclick={() => handleRowClick(rowIndex)}
      >
        {#each columns as col (col.key)}
          <td>{row[col.key]}</td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>

<style>
  /* inject-css.ts가 css/listview.css 내용을 여기에 자동 주입 */
</style>
```

### Step 8.7: Svelte JavaScript ListView 구현

- [ ] `registry/svelte/listview/ListView.js.svelte` 생성

```svelte
<!-- registry/svelte/listview/ListView.js.svelte -->
<script>
  /** @typedef {{ key: string; label: string; width?: number }} ListViewColumn */
  /** @typedef {"asc" | "desc"} SortDirection */

  /** @type {{ columns: ListViewColumn[]; data: Record<string, any>[]; sortKey?: string; sortDirection?: SortDirection; onSort?: (key: string, direction: SortDirection) => void; onRowSelect?: (index: number, row: Record<string, any>) => void; hasShadow?: boolean; class?: string; }} */
  let {
    columns,
    data,
    sortKey = $bindable(undefined),
    sortDirection = $bindable("asc"),
    onSort,
    onRowSelect,
    hasShadow = false,
    class: className,
  } = $props();

  /** @type {number | null} */
  let selectedRowIndex = $state(null);

  /** @param {string} key */
  function handleHeaderClick(key) {
    let nextDirection = "asc";
    if (sortKey === key) {
      nextDirection = sortDirection === "asc" ? "desc" : "asc";
    }
    sortKey = key;
    sortDirection = nextDirection;
    onSort?.(key, nextDirection);
  }

  /** @param {number} index */
  function handleRowClick(index) {
    selectedRowIndex = index;
    onRowSelect?.(index, data[index]);
  }
</script>

<table
  class="win7-listview {hasShadow ? 'has-shadow' : ''} {className ?? ''}"
>
  <thead>
    <tr>
      {#each columns as col (col.key)}
        {@const isActive = sortKey === col.key}
        <th
          class:highlighted={isActive}
          class:indicator={isActive}
          class:up={isActive && sortDirection === "asc"}
          style={col.width ? `width: ${col.width}px` : undefined}
          onclick={() => handleHeaderClick(col.key)}
        >
          {col.label}
        </th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each data as row, rowIndex}
      <tr
        class:highlighted={selectedRowIndex === rowIndex}
        onclick={() => handleRowClick(rowIndex)}
      >
        {#each columns as col (col.key)}
          <td>{row[col.key]}</td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>

<style>
  /* inject-css.ts가 css/listview.css 내용을 여기에 자동 주입 */
</style>
```

### Step 8.8: Vue TypeScript ListView 구현

- [ ] `registry/vue/listview/ListView.vue` 생성

```vue
<!-- registry/vue/listview/ListView.vue -->
<script setup lang="ts">
import { ref, computed } from "vue";

export interface ListViewColumn {
  key: string;
  label: string;
  width?: number;
}

export type SortDirection = "asc" | "desc";

export interface ListViewProps {
  columns: ListViewColumn[];
  data: Record<string, any>[];
  sortKey?: string;
  sortDirection?: SortDirection;
  hasShadow?: boolean;
}

const props = withDefaults(defineProps<ListViewProps>(), {
  sortKey: undefined,
  sortDirection: "asc",
  hasShadow: false,
});

const emit = defineEmits<{
  sort: [key: string, direction: SortDirection];
  rowSelect: [index: number, row: Record<string, any>];
}>();

const internalSortKey = ref<string | undefined>(props.sortKey);
const internalSortDirection = ref<SortDirection>(props.sortDirection ?? "asc");
const selectedRowIndex = ref<number | null>(null);

const activeSortKey = computed(() => props.sortKey ?? internalSortKey.value);
const activeSortDirection = computed(
  () => props.sortDirection ?? internalSortDirection.value
);

function handleHeaderClick(key: string) {
  let nextDirection: SortDirection = "asc";
  if (activeSortKey.value === key) {
    nextDirection = activeSortDirection.value === "asc" ? "desc" : "asc";
  }
  internalSortKey.value = key;
  internalSortDirection.value = nextDirection;
  emit("sort", key, nextDirection);
}

function handleRowClick(index: number) {
  selectedRowIndex.value = index;
  emit("rowSelect", index, props.data[index]);
}

const tableClass = computed(() =>
  [
    "win7-listview",
    props.hasShadow && "has-shadow",
  ]
    .filter(Boolean)
    .join(" ")
);
</script>

<template>
  <table :class="tableClass">
    <thead>
      <tr>
        <th
          v-for="col in props.columns"
          :key="col.key"
          :class="{
            highlighted: activeSortKey === col.key,
            indicator: activeSortKey === col.key,
            up: activeSortKey === col.key && activeSortDirection === 'asc',
          }"
          :style="col.width ? { width: `${col.width}px` } : undefined"
          @click="handleHeaderClick(col.key)"
        >
          {{ col.label }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(row, rowIndex) in props.data"
        :key="rowIndex"
        :class="{ highlighted: selectedRowIndex === rowIndex }"
        @click="handleRowClick(rowIndex)"
      >
        <td v-for="col in props.columns" :key="col.key">
          {{ row[col.key] }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
  /* inject-css.ts가 css/listview.css 내용을 여기에 자동 주입 */
</style>
```

### Step 8.9: Vue JavaScript ListView 구현

- [ ] `registry/vue/listview/ListView.js.vue` 생성

```vue
<!-- registry/vue/listview/ListView.js.vue -->
<script setup>
import { ref, computed } from "vue";

/**
 * @typedef {{ key: string; label: string; width?: number }} ListViewColumn
 * @typedef {"asc" | "desc"} SortDirection
 */

const props = defineProps({
  /** @type {ListViewColumn[]} */
  columns: { type: Array, required: true },
  /** @type {Record<string, any>[]} */
  data: { type: Array, required: true },
  /** @type {string} */
  sortKey: { type: String, default: undefined },
  /** @type {SortDirection} */
  sortDirection: { type: String, default: "asc" },
  /** @type {boolean} */
  hasShadow: { type: Boolean, default: false },
});

const emit = defineEmits(["sort", "rowSelect"]);

const internalSortKey = ref(props.sortKey);
const internalSortDirection = ref(props.sortDirection ?? "asc");
const selectedRowIndex = ref(null);

const activeSortKey = computed(() => props.sortKey ?? internalSortKey.value);
const activeSortDirection = computed(
  () => props.sortDirection ?? internalSortDirection.value
);

function handleHeaderClick(key) {
  let nextDirection = "asc";
  if (activeSortKey.value === key) {
    nextDirection = activeSortDirection.value === "asc" ? "desc" : "asc";
  }
  internalSortKey.value = key;
  internalSortDirection.value = nextDirection;
  emit("sort", key, nextDirection);
}

function handleRowClick(index) {
  selectedRowIndex.value = index;
  emit("rowSelect", index, props.data[index]);
}

const tableClass = computed(() =>
  [
    "win7-listview",
    props.hasShadow && "has-shadow",
  ]
    .filter(Boolean)
    .join(" ")
);
</script>

<template>
  <table :class="tableClass">
    <thead>
      <tr>
        <th
          v-for="col in props.columns"
          :key="col.key"
          :class="{
            highlighted: activeSortKey === col.key,
            indicator: activeSortKey === col.key,
            up: activeSortKey === col.key && activeSortDirection === 'asc',
          }"
          :style="col.width ? { width: `${col.width}px` } : undefined"
          @click="handleHeaderClick(col.key)"
        >
          {{ col.label }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(row, rowIndex) in props.data"
        :key="rowIndex"
        :class="{ highlighted: selectedRowIndex === rowIndex }"
        @click="handleRowClick(rowIndex)"
      >
        <td v-for="col in props.columns" :key="col.key">
          {{ row[col.key] }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
  /* inject-css.ts가 css/listview.css 내용을 여기에 자동 주입 */
</style>
```

### Step 8.10: ListView Svelte/Vue 테스트

- [ ] `registry/svelte/listview/__tests__/ListView.test.ts` 생성

```ts
// registry/svelte/listview/__tests__/ListView.test.ts
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import ListView from "../ListView.svelte";

describe("ListView (Svelte)", () => {
  const columns = [
    { key: "name", label: "Name", width: 200 },
    { key: "size", label: "Size", width: 100 },
  ];

  const data = [
    { name: "File1.txt", size: "10 KB" },
    { name: "File2.jpg", size: "2 MB" },
  ];

  it("renders a table element", () => {
    render(ListView, { props: { columns, data } });
    expect(screen.getByRole("table")).toBeDefined();
  });

  it("renders column headers", () => {
    render(ListView, { props: { columns, data } });
    expect(screen.getByText("Name")).toBeDefined();
    expect(screen.getByText("Size")).toBeDefined();
  });

  it("renders all data rows", () => {
    render(ListView, { props: { columns, data } });
    expect(screen.getByText("File1.txt")).toBeDefined();
    expect(screen.getByText("File2.jpg")).toBeDefined();
  });

  it("highlights sorted column", () => {
    render(ListView, {
      props: { columns, data, sortKey: "name", sortDirection: "asc" },
    });
    const nameHeader = screen.getByText("Name").closest("th");
    expect(nameHeader?.className).toContain("highlighted");
  });

  it("highlights a row when clicked", async () => {
    const user = userEvent.setup();
    render(ListView, { props: { columns, data } });
    const row = screen.getByText("File2.jpg").closest("tr");
    await user.click(row!);
    expect(row?.className).toContain("highlighted");
  });

  it("applies win7-listview CSS class", () => {
    render(ListView, { props: { columns, data } });
    const table = screen.getByRole("table");
    expect(table.className).toContain("win7-listview");
  });
});
```

- [ ] `registry/vue/listview/__tests__/ListView.test.ts` 생성

```ts
// registry/vue/listview/__tests__/ListView.test.ts
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import ListView from "../ListView.vue";

describe("ListView (Vue)", () => {
  const columns = [
    { key: "name", label: "Name", width: 200 },
    { key: "size", label: "Size", width: 100 },
  ];

  const data = [
    { name: "File1.txt", size: "10 KB" },
    { name: "File2.jpg", size: "2 MB" },
  ];

  it("renders a table element", () => {
    render(ListView, { props: { columns, data } });
    expect(screen.getByRole("table")).toBeDefined();
  });

  it("renders column headers", () => {
    render(ListView, { props: { columns, data } });
    expect(screen.getByText("Name")).toBeDefined();
    expect(screen.getByText("Size")).toBeDefined();
  });

  it("renders all data rows", () => {
    render(ListView, { props: { columns, data } });
    expect(screen.getByText("File1.txt")).toBeDefined();
    expect(screen.getByText("File2.jpg")).toBeDefined();
  });

  it("emits sort when header is clicked", async () => {
    const user = userEvent.setup();
    const { emitted } = render(ListView, { props: { columns, data } });
    await user.click(screen.getByText("Name"));
    expect(emitted().sort).toBeTruthy();
    expect(emitted().sort[0]).toEqual(["name", "asc"]);
  });

  it("emits rowSelect when row is clicked", async () => {
    const user = userEvent.setup();
    const { emitted } = render(ListView, { props: { columns, data } });
    const row = screen.getByText("File2.jpg").closest("tr");
    await user.click(row!);
    expect(emitted().rowSelect).toBeTruthy();
    expect(emitted().rowSelect[0]).toEqual([1, data[1]]);
  });

  it("applies win7-listview CSS class", () => {
    render(ListView, { props: { columns, data } });
    const table = screen.getByRole("table");
    expect(table.className).toContain("win7-listview");
  });
});
```

### Step 8.11: CSS 주입 실행 및 검증

- [ ] `pnpm inject-css -- --component listview --framework svelte` 실행
- [ ] `pnpm inject-css -- --component listview --framework vue` 실행
- [ ] `pnpm vitest run registry/react/listview registry/svelte/listview registry/vue/listview` 실행하여 모든 테스트 통과 확인
- [ ] 커밋: `feat(listview): add ListView component (CSS + JSON + React + Svelte + Vue)`

---

## Task 9: SearchBox 컴포넌트 (CSS + JSON + React + Svelte + Vue + 테스트)

> SearchBox는 검색 아이콘이 포함된 텍스트 입력 컴포넌트이다. Batch 1의 textbox 패턴을 확장하여 구현한다.

### Step 9.1: CSS 파일 생성

- [ ] `registry/css/searchbox.css` 생성

```css
/* registry/css/searchbox.css */
/* 7.css 원본 기반 — [type=search] + .searchbox 스타일 */

.win7-searchbox {
  display: inline-block;
  position: relative;
}

.win7-searchbox-input {
  background-color: #fff;
  border: 1px solid transparent;
  border-radius: 2px;
  box-shadow: inset 1px 1px 0 #8e8f8f, inset -1px -1px 0 #ccc;
  box-sizing: border-box;
  font: 9pt "Segoe UI", SegoeUI, "Noto Sans", sans-serif;
  height: 24px;
  min-width: 187px;
  padding: 3px 26px 3px 6px;
}

.win7-searchbox-input:placeholder-shown {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNiIgY3k9IjYiIHI9IjQuNSIgc3Ryb2tlPSIjODA4MDgwIi8+PHBhdGggZD0iTTkuNSA5LjVMMTMgMTMiIHN0cm9rZT0iIzgwODA4MCIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+");
  background-position: calc(100% - 8px);
  background-repeat: no-repeat;
  background-size: 14px;
}

.win7-searchbox-input:focus {
  outline: none;
}

.win7-searchbox-input::placeholder {
  font-style: italic;
}

.win7-searchbox-button {
  background: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNiIgY3k9IjYiIHI9IjQuNSIgc3Ryb2tlPSIjODA4MDgwIi8+PHBhdGggZD0iTTkuNSA5LjVMMTMgMTMiIHN0cm9rZT0iIzgwODA4MCIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+")
    no-repeat 50%,
    linear-gradient(#f2f2f2 45%, #ebebeb 0, #cfcfcf);
  background-size: 14px;
  border: 1px solid #8e8f8f;
  border-left: none;
  border-radius: 0;
  min-height: 22px;
  min-width: 26px;
  padding: 0;
  position: absolute;
  right: 1px;
  top: 1px;
  cursor: pointer;
}

.win7-searchbox-button:hover {
  background: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNiIgY3k9IjYiIHI9IjQuNSIgc3Ryb2tlPSIjODA4MDgwIi8+PHBhdGggZD0iTTkuNSA5LjVMMTMgMTMiIHN0cm9rZT0iIzgwODA4MCIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+")
    no-repeat 50%,
    linear-gradient(#eaf6fd 45%, #bee6fd 0, #a7d9f5);
  background-size: 14px;
  border-color: #3c7fb1;
}

.win7-searchbox-button:active {
  background: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNiIgY3k9IjYiIHI9IjQuNSIgc3Ryb2tlPSIjODA4MDgwIi8+PHBhdGggZD0iTTkuNSA5LjVMMTMgMTMiIHN0cm9rZT0iIzgwODA4MCIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+")
    no-repeat 50%,
    linear-gradient(#e5f4fc, #c4e5f6 30% 50%, #98d1ef 50%, #68b3db);
  background-size: 14px;
  border-color: #6d91ab;
}
```

### Step 9.2: 메타데이터 JSON 생성

- [ ] `registry/components/searchbox.json` 생성

```json
{
  "name": "searchbox",
  "displayName": "SearchBox",
  "description": "Windows 7 스타일 검색 입력 컴포넌트 (검색 아이콘 포함)",
  "dependencies": [],
  "css": ["css/searchbox.css"],
  "files": {
    "react": {
      "ts": ["react/searchbox/searchbox.tsx"],
      "js": ["react/searchbox/searchbox.jsx"]
    },
    "svelte": {
      "ts": ["svelte/searchbox/SearchBox.svelte"],
      "js": ["svelte/searchbox/SearchBox.js.svelte"]
    },
    "vue": {
      "ts": ["vue/searchbox/SearchBox.vue"],
      "js": ["vue/searchbox/SearchBox.js.vue"]
    }
  }
}
```

### Step 9.3: 실패 테스트 작성 (TDD Red)

- [ ] `registry/react/searchbox/__tests__/searchbox.test.tsx` 생성

```tsx
// registry/react/searchbox/__tests__/searchbox.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBox } from "../searchbox";

describe("SearchBox (React)", () => {
  it("renders a search input", () => {
    render(<SearchBox />);
    expect(screen.getByRole("searchbox")).toBeDefined();
  });

  it("renders a search button", () => {
    render(<SearchBox />);
    expect(screen.getByRole("button", { name: /search/i })).toBeDefined();
  });

  it("displays placeholder text", () => {
    render(<SearchBox placeholder="Search..." />);
    const input = screen.getByPlaceholderText("Search...");
    expect(input).toBeDefined();
  });

  it("supports controlled value", () => {
    render(<SearchBox value="test query" onChange={() => {}} />);
    const input = screen.getByRole("searchbox") as HTMLInputElement;
    expect(input.value).toBe("test query");
  });

  it("fires onChange when text is entered", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchBox onChange={onChange} />);
    const input = screen.getByRole("searchbox");
    await user.type(input, "hello");
    expect(onChange).toHaveBeenCalled();
  });

  it("fires onSearch when search button is clicked", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBox onSearch={onSearch} />);
    const input = screen.getByRole("searchbox");
    await user.type(input, "query");
    await user.click(screen.getByRole("button", { name: /search/i }));
    expect(onSearch).toHaveBeenCalledWith("query");
  });

  it("fires onSearch when Enter is pressed", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBox onSearch={onSearch} />);
    const input = screen.getByRole("searchbox");
    await user.type(input, "query{Enter}");
    expect(onSearch).toHaveBeenCalledWith("query");
  });

  it("renders as disabled when disabled prop is set", () => {
    render(<SearchBox disabled />);
    const input = screen.getByRole("searchbox") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("applies win7-searchbox CSS class to wrapper", () => {
    render(<SearchBox data-testid="sb" />);
    const wrapper = screen.getByRole("searchbox").parentElement;
    expect(wrapper?.className).toContain("searchbox");
  });

  it("merges custom className", () => {
    render(<SearchBox className="custom" />);
    const wrapper = screen.getByRole("searchbox").parentElement;
    expect(wrapper?.className).toContain("custom");
  });
});
```

### Step 9.4: React TypeScript SearchBox 구현 (TDD Green)

- [ ] `registry/react/searchbox/searchbox.tsx` 생성

```tsx
// registry/react/searchbox/searchbox.tsx
import React, { useState, useCallback, useRef } from "react";
import styles from "../css/searchbox.module.css";

export interface SearchBoxProps {
  /** 현재 입력 값 (controlled) */
  value?: string;
  /** 입력 변경 시 콜백 */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** 검색 실행 시 콜백 (Enter 또는 버튼 클릭) */
  onSearch?: (query: string) => void;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 추가 CSS 클래스 */
  className?: string;
}

export function SearchBox({
  value: controlledValue,
  onChange,
  onSearch,
  placeholder,
  disabled = false,
  className,
}: SearchBoxProps) {
  const [internalValue, setInternalValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const currentValue = controlledValue ?? internalValue;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    },
    [onChange]
  );

  const handleSearch = useCallback(() => {
    onSearch?.(currentValue);
  }, [currentValue, onSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  return (
    <div className={`${styles.searchbox} ${className ?? ""}`.trim()}>
      <input
        ref={inputRef}
        type="search"
        role="searchbox"
        className={styles["searchbox-input"]}
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
      />
      <button
        type="button"
        aria-label="search"
        className={styles["searchbox-button"]}
        onClick={handleSearch}
        disabled={disabled}
      />
    </div>
  );
}
```

### Step 9.5: React JavaScript SearchBox 구현

- [ ] `registry/react/searchbox/searchbox.jsx` 생성

```jsx
// registry/react/searchbox/searchbox.jsx
import React, { useState, useCallback, useRef } from "react";
import styles from "../css/searchbox.module.css";

/**
 * Windows 7 스타일 검색 입력 컴포넌트
 * @param {object} props
 * @param {string} [props.value] - 현재 입력 값 (controlled)
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} [props.onChange] - 입력 변경 시 콜백
 * @param {(query: string) => void} [props.onSearch] - 검색 실행 시 콜백
 * @param {string} [props.placeholder] - 플레이스홀더 텍스트
 * @param {boolean} [props.disabled] - 비활성화 여부
 * @param {string} [props.className] - 추가 CSS 클래스
 */
export function SearchBox({
  value: controlledValue,
  onChange,
  onSearch,
  placeholder,
  disabled = false,
  className,
}) {
  const [internalValue, setInternalValue] = useState("");
  const inputRef = useRef(null);

  const currentValue = controlledValue ?? internalValue;

  const handleChange = useCallback(
    (e) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    },
    [onChange]
  );

  const handleSearch = useCallback(() => {
    onSearch?.(currentValue);
  }, [currentValue, onSearch]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  return (
    <div className={`${styles.searchbox} ${className ?? ""}`.trim()}>
      <input
        ref={inputRef}
        type="search"
        role="searchbox"
        className={styles["searchbox-input"]}
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
      />
      <button
        type="button"
        aria-label="search"
        className={styles["searchbox-button"]}
        onClick={handleSearch}
        disabled={disabled}
      />
    </div>
  );
}
```

### Step 9.6: Svelte TypeScript SearchBox 구현

- [ ] `registry/svelte/searchbox/SearchBox.svelte` 생성

```svelte
<!-- registry/svelte/searchbox/SearchBox.svelte -->
<script lang="ts">
  interface Props {
    value?: string;
    onSearch?: (query: string) => void;
    placeholder?: string;
    disabled?: boolean;
    class?: string;
  }

  let {
    value = $bindable(""),
    onSearch,
    placeholder,
    disabled = false,
    class: className,
  }: Props = $props();

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    value = target.value;
  }

  function handleSearch() {
    onSearch?.(value);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }
</script>

<div class="win7-searchbox {className ?? ''}">
  <input
    type="search"
    role="searchbox"
    class="win7-searchbox-input"
    {value}
    oninput={handleInput}
    onkeydown={handleKeyDown}
    {placeholder}
    {disabled}
  />
  <button
    type="button"
    aria-label="search"
    class="win7-searchbox-button"
    onclick={handleSearch}
    {disabled}
  ></button>
</div>

<style>
  /* inject-css.ts가 css/searchbox.css 내용을 여기에 자동 주입 */
</style>
```

### Step 9.7: Svelte JavaScript SearchBox 구현

- [ ] `registry/svelte/searchbox/SearchBox.js.svelte` 생성

```svelte
<!-- registry/svelte/searchbox/SearchBox.js.svelte -->
<script>
  /** @type {{ value?: string; onSearch?: (query: string) => void; placeholder?: string; disabled?: boolean; class?: string; }} */
  let {
    value = $bindable(""),
    onSearch,
    placeholder,
    disabled = false,
    class: className,
  } = $props();

  /** @param {Event} e */
  function handleInput(e) {
    value = /** @type {HTMLInputElement} */ (e.target).value;
  }

  function handleSearch() {
    onSearch?.(value);
  }

  /** @param {KeyboardEvent} e */
  function handleKeyDown(e) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }
</script>

<div class="win7-searchbox {className ?? ''}">
  <input
    type="search"
    role="searchbox"
    class="win7-searchbox-input"
    {value}
    oninput={handleInput}
    onkeydown={handleKeyDown}
    {placeholder}
    {disabled}
  />
  <button
    type="button"
    aria-label="search"
    class="win7-searchbox-button"
    onclick={handleSearch}
    {disabled}
  ></button>
</div>

<style>
  /* inject-css.ts가 css/searchbox.css 내용을 여기에 자동 주입 */
</style>
```

### Step 9.8: Vue TypeScript SearchBox 구현

- [ ] `registry/vue/searchbox/SearchBox.vue` 생성

```vue
<!-- registry/vue/searchbox/SearchBox.vue -->
<script setup lang="ts">
import { ref, computed } from "vue";

export interface SearchBoxProps {
  placeholder?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<SearchBoxProps>(), {
  placeholder: undefined,
  disabled: false,
});

const model = defineModel<string>({ default: "" });
const emit = defineEmits<{
  search: [query: string];
}>();

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement;
  model.value = target.value;
}

function handleSearch() {
  emit("search", model.value);
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === "Enter") {
    handleSearch();
  }
}
</script>

<template>
  <div class="win7-searchbox">
    <input
      type="search"
      role="searchbox"
      class="win7-searchbox-input"
      :value="model"
      @input="handleInput"
      @keydown="handleKeyDown"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
    />
    <button
      type="button"
      aria-label="search"
      class="win7-searchbox-button"
      @click="handleSearch"
      :disabled="props.disabled"
    ></button>
  </div>
</template>

<style scoped>
  /* inject-css.ts가 css/searchbox.css 내용을 여기에 자동 주입 */
</style>
```

### Step 9.9: Vue JavaScript SearchBox 구현

- [ ] `registry/vue/searchbox/SearchBox.js.vue` 생성

```vue
<!-- registry/vue/searchbox/SearchBox.js.vue -->
<script setup>
import { ref } from "vue";

const props = defineProps({
  /** @type {string} */
  placeholder: { type: String, default: undefined },
  /** @type {boolean} */
  disabled: { type: Boolean, default: false },
});

const model = defineModel({ default: "" });
const emit = defineEmits(["search"]);

function handleInput(e) {
  model.value = e.target.value;
}

function handleSearch() {
  emit("search", model.value);
}

function handleKeyDown(e) {
  if (e.key === "Enter") {
    handleSearch();
  }
}
</script>

<template>
  <div class="win7-searchbox">
    <input
      type="search"
      role="searchbox"
      class="win7-searchbox-input"
      :value="model"
      @input="handleInput"
      @keydown="handleKeyDown"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
    />
    <button
      type="button"
      aria-label="search"
      class="win7-searchbox-button"
      @click="handleSearch"
      :disabled="props.disabled"
    ></button>
  </div>
</template>

<style scoped>
  /* inject-css.ts가 css/searchbox.css 내용을 여기에 자동 주입 */
</style>
```

### Step 9.10: SearchBox Svelte/Vue 테스트

- [ ] `registry/svelte/searchbox/__tests__/SearchBox.test.ts` 생성

```ts
// registry/svelte/searchbox/__tests__/SearchBox.test.ts
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import SearchBox from "../SearchBox.svelte";

describe("SearchBox (Svelte)", () => {
  it("renders a search input", () => {
    render(SearchBox);
    expect(screen.getByRole("searchbox")).toBeDefined();
  });

  it("renders a search button", () => {
    render(SearchBox);
    expect(screen.getByRole("button", { name: /search/i })).toBeDefined();
  });

  it("displays placeholder text", () => {
    render(SearchBox, { props: { placeholder: "Search..." } });
    expect(screen.getByPlaceholderText("Search...")).toBeDefined();
  });

  it("fires onSearch when search button is clicked", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(SearchBox, { props: { onSearch } });
    const input = screen.getByRole("searchbox");
    await user.type(input, "query");
    await user.click(screen.getByRole("button", { name: /search/i }));
    expect(onSearch).toHaveBeenCalledWith("query");
  });

  it("fires onSearch on Enter key", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(SearchBox, { props: { onSearch } });
    const input = screen.getByRole("searchbox");
    await user.type(input, "query{Enter}");
    expect(onSearch).toHaveBeenCalledWith("query");
  });

  it("renders as disabled when disabled prop is set", () => {
    render(SearchBox, { props: { disabled: true } });
    const input = screen.getByRole("searchbox") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("applies win7-searchbox CSS class to wrapper", () => {
    render(SearchBox);
    const wrapper = screen.getByRole("searchbox").parentElement;
    expect(wrapper?.className).toContain("win7-searchbox");
  });
});
```

- [ ] `registry/vue/searchbox/__tests__/SearchBox.test.ts` 생성

```ts
// registry/vue/searchbox/__tests__/SearchBox.test.ts
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import SearchBox from "../SearchBox.vue";

describe("SearchBox (Vue)", () => {
  it("renders a search input", () => {
    render(SearchBox);
    expect(screen.getByRole("searchbox")).toBeDefined();
  });

  it("renders a search button", () => {
    render(SearchBox);
    expect(screen.getByRole("button", { name: /search/i })).toBeDefined();
  });

  it("displays placeholder text", () => {
    render(SearchBox, { props: { placeholder: "Search..." } });
    expect(screen.getByPlaceholderText("Search...")).toBeDefined();
  });

  it("emits search on button click", async () => {
    const user = userEvent.setup();
    const { emitted } = render(SearchBox);
    const input = screen.getByRole("searchbox");
    await user.type(input, "query");
    await user.click(screen.getByRole("button", { name: /search/i }));
    expect(emitted().search).toBeTruthy();
    expect(emitted().search[0]).toEqual(["query"]);
  });

  it("emits search on Enter key", async () => {
    const user = userEvent.setup();
    const { emitted } = render(SearchBox);
    const input = screen.getByRole("searchbox");
    await user.type(input, "query{Enter}");
    expect(emitted().search).toBeTruthy();
    expect(emitted().search[0]).toEqual(["query"]);
  });

  it("renders as disabled when disabled prop is set", () => {
    render(SearchBox, { props: { disabled: true } });
    const input = screen.getByRole("searchbox") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("applies win7-searchbox CSS class to wrapper", () => {
    render(SearchBox);
    const wrapper = screen.getByRole("searchbox").parentElement;
    expect(wrapper?.className).toContain("win7-searchbox");
  });
});
```

### Step 9.11: CSS 주입 실행 및 검증

- [ ] `pnpm inject-css -- --component searchbox --framework svelte` 실행
- [ ] `pnpm inject-css -- --component searchbox --framework vue` 실행
- [ ] `pnpm vitest run registry/react/searchbox registry/svelte/searchbox registry/vue/searchbox` 실행하여 모든 테스트 통과 확인
- [ ] 커밋: `feat(searchbox): add SearchBox component (CSS + JSON + React + Svelte + Vue)`

---

## Task 10: Registry 업데이트 + 통합 테스트

> 5개 컴포넌트를 `registry/index.json`에 등록하고, 전체 Batch 2 통합 테스트를 수행한다.

### Step 10.1: index.json 업데이트

- [ ] `registry/index.json`의 `components` 배열에 Batch 2 컴포넌트 5개 추가

```json
{
  "name": "dropdown",
  "displayName": "Dropdown",
  "description": "Windows 7 스타일 드롭다운 선택 컴포넌트",
  "dependencies": []
},
{
  "name": "combobox",
  "displayName": "ComboBox",
  "description": "Windows 7 스타일 콤보박스 (텍스트 입력 + 드롭다운 목록)",
  "dependencies": []
},
{
  "name": "listbox",
  "displayName": "ListBox",
  "description": "Windows 7 스타일 스크롤 가능한 선택 목록",
  "dependencies": []
},
{
  "name": "listview",
  "displayName": "ListView",
  "description": "Windows 7 스타일 테이블 기반 데이터 목록",
  "dependencies": []
},
{
  "name": "searchbox",
  "displayName": "SearchBox",
  "description": "Windows 7 스타일 검색 입력 컴포넌트",
  "dependencies": []
}
```

### Step 10.2: Registry 정합성 테스트

- [ ] `registry/__tests__/batch2-registry-integrity.test.ts` 생성

```ts
// registry/__tests__/batch2-registry-integrity.test.ts
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const registryRoot = resolve(__dirname, "..");
const batch2Components = ["dropdown", "combobox", "listbox", "listview", "searchbox"];

describe("Batch 2 registry integrity", () => {
  const index = JSON.parse(
    readFileSync(resolve(registryRoot, "index.json"), "utf-8")
  );

  it("index.json contains all Batch 2 components", () => {
    const indexNames = index.components.map(
      (c: { name: string }) => c.name
    );
    for (const name of batch2Components) {
      expect(indexNames).toContain(name);
    }
  });

  for (const name of batch2Components) {
    describe(`${name} component`, () => {
      const metadataPath = resolve(registryRoot, `components/${name}.json`);

      it("has a component metadata JSON file", () => {
        expect(existsSync(metadataPath)).toBe(true);
      });

      it("all referenced files exist on disk", () => {
        const metadata = JSON.parse(readFileSync(metadataPath, "utf-8"));

        // CSS 파일 존재 확인
        for (const cssFile of metadata.css) {
          expect(existsSync(resolve(registryRoot, cssFile))).toBe(true);
        }

        // 프레임워크별 소스 파일 존재 확인
        for (const framework of ["react", "svelte", "vue"]) {
          for (const variant of ["ts", "js"]) {
            for (const file of metadata.files[framework][variant]) {
              expect(existsSync(resolve(registryRoot, file))).toBe(true);
            }
          }
        }
      });

      it("metadata name matches directory name", () => {
        const metadata = JSON.parse(readFileSync(metadataPath, "utf-8"));
        expect(metadata.name).toBe(name);
      });

      it("has a displayName and description", () => {
        const metadata = JSON.parse(readFileSync(metadataPath, "utf-8"));
        expect(metadata.displayName).toBeTruthy();
        expect(metadata.description).toBeTruthy();
      });
    });
  }
});
```

### Step 10.3: build-registry 스크립트 실행

- [ ] `pnpm build-registry` 실행하여 `index.json`이 자동 생성/업데이트되는지 확인
- [ ] 생성된 `index.json`이 수동 추가한 내용과 일치하는지 검증

### Step 10.4: CSS 주입 일괄 실행

- [ ] `pnpm inject-css` 실행하여 모든 Svelte/Vue 컴포넌트의 `<style>` 블록이 최신 CSS로 업데이트되었는지 확인

### Step 10.5: 전체 Batch 2 테스트 실행

- [ ] `pnpm vitest run registry/` 실행하여 Batch 2의 모든 테스트 통과 확인
- [ ] 테스트 결과 요약:
  - React: dropdown, combobox, listbox, listview, searchbox
  - Svelte: dropdown, combobox, listbox, listview, searchbox
  - Vue: dropdown, combobox, listbox, listview, searchbox
  - Cross-framework: dropdown 일관성 테스트
  - Registry: 정합성 테스트

### Step 10.6: CLI add 명령어 검증

- [ ] 임시 디렉토리에서 `npx win7ui init` 실행
- [ ] `npx win7ui add dropdown combobox listbox listview searchbox` 실행
- [ ] 각 컴포넌트 파일이 올바른 위치에 복사되었는지 확인
- [ ] CSS 파일이 함께 복사되었는지 확인
- [ ] `index.ts`(barrel export)에 5개 컴포넌트 export가 추가되었는지 확인

### Step 10.7: 최종 커밋

- [ ] `pnpm vitest run` 으로 전체 테스트 스위트 (Batch 1 + Batch 2) 통과 확인
- [ ] 커밋: `feat(batch2): complete Batch 2 - dropdown, combobox, listbox, listview, searchbox`

---

## 파일 목록 요약

### CSS (5개)
| 파일 | 설명 |
|------|------|
| `registry/css/dropdown.css` | Dropdown 스타일 |
| `registry/css/combobox.css` | ComboBox 스타일 |
| `registry/css/listbox.css` | ListBox 스타일 |
| `registry/css/listview.css` | ListView 스타일 |
| `registry/css/searchbox.css` | SearchBox 스타일 |

### 메타데이터 JSON (5개)
| 파일 | 설명 |
|------|------|
| `registry/components/dropdown.json` | Dropdown 메타데이터 |
| `registry/components/combobox.json` | ComboBox 메타데이터 |
| `registry/components/listbox.json` | ListBox 메타데이터 |
| `registry/components/listview.json` | ListView 메타데이터 |
| `registry/components/searchbox.json` | SearchBox 메타데이터 |

### React 컴포넌트 (10개)
| 파일 | 설명 |
|------|------|
| `registry/react/dropdown/dropdown.tsx` | Dropdown TS |
| `registry/react/dropdown/dropdown.jsx` | Dropdown JS |
| `registry/react/combobox/combobox.tsx` | ComboBox TS |
| `registry/react/combobox/combobox.jsx` | ComboBox JS |
| `registry/react/listbox/listbox.tsx` | ListBox TS |
| `registry/react/listbox/listbox.jsx` | ListBox JS |
| `registry/react/listview/listview.tsx` | ListView TS |
| `registry/react/listview/listview.jsx` | ListView JS |
| `registry/react/searchbox/searchbox.tsx` | SearchBox TS |
| `registry/react/searchbox/searchbox.jsx` | SearchBox JS |

### Svelte 컴포넌트 (10개)
| 파일 | 설명 |
|------|------|
| `registry/svelte/dropdown/Dropdown.svelte` | Dropdown TS |
| `registry/svelte/dropdown/Dropdown.js.svelte` | Dropdown JS |
| `registry/svelte/combobox/ComboBox.svelte` | ComboBox TS |
| `registry/svelte/combobox/ComboBox.js.svelte` | ComboBox JS |
| `registry/svelte/listbox/ListBox.svelte` | ListBox TS |
| `registry/svelte/listbox/ListBox.js.svelte` | ListBox JS |
| `registry/svelte/listview/ListView.svelte` | ListView TS |
| `registry/svelte/listview/ListView.js.svelte` | ListView JS |
| `registry/svelte/searchbox/SearchBox.svelte` | SearchBox TS |
| `registry/svelte/searchbox/SearchBox.js.svelte` | SearchBox JS |

### Vue 컴포넌트 (10개)
| 파일 | 설명 |
|------|------|
| `registry/vue/dropdown/Dropdown.vue` | Dropdown TS |
| `registry/vue/dropdown/Dropdown.js.vue` | Dropdown JS |
| `registry/vue/combobox/ComboBox.vue` | ComboBox TS |
| `registry/vue/combobox/ComboBox.js.vue` | ComboBox JS |
| `registry/vue/listbox/ListBox.vue` | ListBox TS |
| `registry/vue/listbox/ListBox.js.vue` | ListBox JS |
| `registry/vue/listview/ListView.vue` | ListView TS |
| `registry/vue/listview/ListView.js.vue` | ListView JS |
| `registry/vue/searchbox/SearchBox.vue` | SearchBox TS |
| `registry/vue/searchbox/SearchBox.js.vue` | SearchBox JS |

### 테스트 파일 (13개)
| 파일 | 설명 |
|------|------|
| `registry/react/dropdown/__tests__/dropdown.test.tsx` | Dropdown React 테스트 |
| `registry/react/dropdown/__tests__/dropdown.snapshot.test.tsx` | Dropdown 스냅샷 |
| `registry/svelte/dropdown/__tests__/Dropdown.test.ts` | Dropdown Svelte 테스트 |
| `registry/vue/dropdown/__tests__/Dropdown.test.ts` | Dropdown Vue 테스트 |
| `registry/__tests__/dropdown-cross-framework.test.ts` | Dropdown 크로스 프레임워크 |
| `registry/react/combobox/__tests__/combobox.test.tsx` | ComboBox React 테스트 |
| `registry/svelte/combobox/__tests__/ComboBox.test.ts` | ComboBox Svelte 테스트 |
| `registry/vue/combobox/__tests__/ComboBox.test.ts` | ComboBox Vue 테스트 |
| `registry/react/listbox/__tests__/listbox.test.tsx` | ListBox React 테스트 |
| `registry/svelte/listbox/__tests__/ListBox.test.ts` | ListBox Svelte 테스트 |
| `registry/vue/listbox/__tests__/ListBox.test.ts` | ListBox Vue 테스트 |
| `registry/react/listview/__tests__/listview.test.tsx` | ListView React 테스트 |
| `registry/svelte/listview/__tests__/ListView.test.ts` | ListView Svelte 테스트 |
| `registry/vue/listview/__tests__/ListView.test.ts` | ListView Vue 테스트 |
| `registry/react/searchbox/__tests__/searchbox.test.tsx` | SearchBox React 테스트 |
| `registry/svelte/searchbox/__tests__/SearchBox.test.ts` | SearchBox Svelte 테스트 |
| `registry/vue/searchbox/__tests__/SearchBox.test.ts` | SearchBox Vue 테스트 |
| `registry/__tests__/batch2-registry-integrity.test.ts` | Registry 정합성 테스트 |

**총 파일 수: 53개** (CSS 5 + JSON 5 + React 10 + Svelte 10 + Vue 10 + 테스트 13)
