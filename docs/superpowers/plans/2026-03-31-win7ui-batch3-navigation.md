# Batch 3: Navigation & Structure Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Batch 1 인프라 및 Batch 2 완료 상태에서, Tabs/Menu/MenuBar/Collapse/ProgressBar 5개 내비게이션+구조 컴포넌트를 React(TS/JS), Svelte(TS/JS), Vue(TS/JS) 버전으로 구현하고 레지스트리에 등록한다.

**Architecture:** 각 컴포넌트는 `registry/css/`에 CSS 단일 소스를 두고, React는 CSS Modules로, Svelte/Vue는 `inject-css.ts`가 `<style>` 블록에 자동 주입하는 구조. Tabs/Menu/MenuBar는 Compound Component 패턴으로 하위 컴포넌트(Tab+TabPanel, MenuItem+MenuSeparator)를 동일 디렉토리에 배치한다. 컴포넌트 간 의존성은 MenuBar → Menu로 단방향이며, 각 컴포넌트별 JSON 메타데이터가 `registry/components/`에 위치한다.

**Tech Stack:** React 18+, Svelte 5 (runes), Vue 3 (Composition API + `<script setup>`), Vitest, TypeScript/JavaScript 이중 지원, CSS Modules (React), 7.css 원본 CSS

---

## Task 1: Tabs CSS + JSON 메타데이터

> Tabs 컴포넌트의 CSS 단일 소스와 레지스트리 JSON 메타데이터를 생성한다.

### Step 1.1: CSS 파일 생성

- [ ] `registry/css/tabs.css` 생성

```css
/* registry/css/tabs.css — 7.css tabs 원본 */
menu[role=tablist] {
  display: flex;
  list-style-type: none;
  margin: 0 0 -2px;
  padding-left: 3px;
  position: relative;
  text-indent: 0;
}

menu[role=tablist] button {
  border-radius: 0;
  color: #222;
  display: block;
  min-width: unset;
  padding: 2px 6px;
  text-decoration: none;
  z-index: 1;
}

menu[role=tablist] button[aria-selected=true] {
  background: #fff;
  border-bottom: 0;
  box-shadow: none;
  margin: -2px 0 1px -3px;
  padding-bottom: 4px;
  position: relative;
  z-index: 8;
}

menu[role=tablist] button[aria-selected=true]:after,
menu[role=tablist] button[aria-selected=true]:before {
  content: none;
}

menu[role=tablist] button[aria-selected=true]:hover {
  border-color: #8e8f8f;
}

menu[role=tablist] button[aria-selected=true].active,
menu[role=tablist] button[aria-selected=true]:active,
menu[role=tablist] button[aria-selected=true]:focus {
  -webkit-animation: none;
  animation: none;
  border-color: #8e8f8f;
}

menu[role=tablist] button[aria-selected=true]:focus-visible {
  outline: 1px dotted #222;
  outline-offset: -4px;
}

menu[role=tablist] button:before {
  border-radius: 0;
}

menu[role=tablist] button:after {
  content: none;
}

menu[role=tablist] button:disabled {
  opacity: 0.6;
}

menu[role=tablist].justified button {
  flex-grow: 1;
  text-align: center;
}

[role=tabpanel] {
  background: #fff;
  border: 1px solid #8e8f8f;
  clear: both;
  margin-bottom: 9px;
  padding: 14px;
  position: relative;
  z-index: 2;
}
```

### Step 1.2: JSON 메타데이터 생성

- [ ] `registry/components/tabs.json` 생성

```json
{
  "name": "tabs",
  "displayName": "Tabs",
  "description": "Windows 7 스타일 탭 내비게이션. Compound Component 패턴으로 Tab과 TabPanel 하위 컴포넌트를 포함한다.",
  "dependencies": [],
  "css": ["css/tabs.css"],
  "files": {
    "react": {
      "ts": [
        "react/tabs/tabs.tsx",
        "react/tabs/tab.tsx",
        "react/tabs/tab-panel.tsx"
      ],
      "js": [
        "react/tabs/tabs.jsx",
        "react/tabs/tab.jsx",
        "react/tabs/tab-panel.jsx"
      ]
    },
    "svelte": {
      "ts": [
        "svelte/tabs/Tabs.svelte",
        "svelte/tabs/Tab.svelte",
        "svelte/tabs/TabPanel.svelte"
      ],
      "js": [
        "svelte/tabs/Tabs.js.svelte",
        "svelte/tabs/Tab.js.svelte",
        "svelte/tabs/TabPanel.js.svelte"
      ]
    },
    "vue": {
      "ts": [
        "vue/tabs/Tabs.vue",
        "vue/tabs/Tab.vue",
        "vue/tabs/TabPanel.vue"
      ],
      "js": [
        "vue/tabs/Tabs.js.vue",
        "vue/tabs/Tab.js.vue",
        "vue/tabs/TabPanel.js.vue"
      ]
    }
  }
}
```

### Step 1.3: 검증

- [ ] JSON 파일의 모든 파일 경로가 유효한지 스크립트로 확인 (이후 Task에서 구현 파일을 생성하면 자동 통과)
- [ ] `pnpm build:registry`로 `index.json`에 tabs 항목이 추가되는지 확인

### Step 1.4: 커밋

```bash
git add registry/css/tabs.css registry/components/tabs.json
git commit -m "feat(tabs): add CSS source and registry metadata for tabs component"
```

---

## Task 2: Tabs React (TypeScript + JavaScript)

> Tabs Compound Component를 React TS/JS로 구현한다. Tabs(컨테이너), Tab(탭 버튼), TabPanel(탭 패널) 3개 하위 컴포넌트.

### Step 2.1: 실패 테스트 작성

- [ ] `registry/react/tabs/__tests__/tabs.test.tsx` 생성

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Tabs } from "../tabs";
import { Tab } from "../tab";
import { TabPanel } from "../tab-panel";

describe("Tabs (React)", () => {
  it("renders tabs and panels", () => {
    render(
      <Tabs defaultValue="tab1">
        <Tab value="tab1">Tab 1</Tab>
        <Tab value="tab2">Tab 2</Tab>
        <TabPanel value="tab1">Content 1</TabPanel>
        <TabPanel value="tab2">Content 2</TabPanel>
      </Tabs>
    );

    expect(screen.getByText("Tab 1")).toBeInTheDocument();
    expect(screen.getByText("Tab 2")).toBeInTheDocument();
    expect(screen.getByText("Content 1")).toBeVisible();
    expect(screen.queryByText("Content 2")).not.toBeVisible();
  });

  it("switches tab on click", async () => {
    render(
      <Tabs defaultValue="tab1">
        <Tab value="tab1">Tab 1</Tab>
        <Tab value="tab2">Tab 2</Tab>
        <TabPanel value="tab1">Content 1</TabPanel>
        <TabPanel value="tab2">Content 2</TabPanel>
      </Tabs>
    );

    await fireEvent.click(screen.getByText("Tab 2"));
    expect(screen.getByText("Content 2")).toBeVisible();
    expect(screen.queryByText("Content 1")).not.toBeVisible();
  });

  it("sets aria-selected on active tab", () => {
    render(
      <Tabs defaultValue="tab1">
        <Tab value="tab1">Tab 1</Tab>
        <Tab value="tab2">Tab 2</Tab>
        <TabPanel value="tab1">Content 1</TabPanel>
        <TabPanel value="tab2">Content 2</TabPanel>
      </Tabs>
    );

    expect(screen.getByText("Tab 1")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Tab 2")).toHaveAttribute("aria-selected", "false");
  });

  it("supports justified variant", () => {
    render(
      <Tabs defaultValue="tab1" justified>
        <Tab value="tab1">Tab 1</Tab>
        <TabPanel value="tab1">Content 1</TabPanel>
      </Tabs>
    );

    const tablist = screen.getByRole("tablist");
    expect(tablist.className).toContain("justified");
  });

  it("supports disabled tabs", () => {
    render(
      <Tabs defaultValue="tab1">
        <Tab value="tab1">Tab 1</Tab>
        <Tab value="tab2" disabled>Tab 2</Tab>
        <TabPanel value="tab1">Content 1</TabPanel>
        <TabPanel value="tab2">Content 2</TabPanel>
      </Tabs>
    );

    const disabledTab = screen.getByText("Tab 2");
    expect(disabledTab).toBeDisabled();
    fireEvent.click(disabledTab);
    expect(screen.getByText("Content 1")).toBeVisible();
  });

  it("supports controlled mode via value + onValueChange", () => {
    const onValueChange = vi.fn();
    render(
      <Tabs value="tab1" onValueChange={onValueChange}>
        <Tab value="tab1">Tab 1</Tab>
        <Tab value="tab2">Tab 2</Tab>
        <TabPanel value="tab1">Content 1</TabPanel>
        <TabPanel value="tab2">Content 2</TabPanel>
      </Tabs>
    );

    fireEvent.click(screen.getByText("Tab 2"));
    expect(onValueChange).toHaveBeenCalledWith("tab2");
  });
});
```

### Step 2.2: Tabs 컨텍스트 구현

- [ ] `registry/react/tabs/tabs-context.ts` 생성

```ts
import { createContext, useContext } from "react";

interface TabsContextValue {
  activeValue: string;
  onSelect: (value: string) => void;
}

export const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tab/TabPanel must be used within a Tabs component");
  }
  return context;
}
```

### Step 2.3: Tabs 컨테이너 (TypeScript)

- [ ] `registry/react/tabs/tabs.tsx` 생성

```tsx
import React, { useState, useCallback } from "react";
import { TabsContext } from "./tabs-context";
import styles from "../../css/tabs.module.css";

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  justified?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  justified = false,
  className,
  children,
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? "");

  const isControlled = controlledValue !== undefined;
  const activeValue = isControlled ? controlledValue : uncontrolledValue;

  const onSelect = useCallback(
    (val: string) => {
      if (!isControlled) {
        setUncontrolledValue(val);
      }
      onValueChange?.(val);
    },
    [isControlled, onValueChange]
  );

  // children을 tablist(Tab)과 tabpanel(TabPanel)로 분리
  const tabs: React.ReactNode[] = [];
  const panels: React.ReactNode[] = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if ((child.type as any).displayName === "Tab") {
      tabs.push(child);
    } else {
      panels.push(child);
    }
  });

  const tablistClass = [styles.tablist, justified ? styles.justified : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <TabsContext.Provider value={{ activeValue, onSelect }}>
      <menu role="tablist" className={tablistClass}>
        {tabs}
      </menu>
      {panels}
    </TabsContext.Provider>
  );
}
```

### Step 2.4: Tab 하위 컴포넌트 (TypeScript)

- [ ] `registry/react/tabs/tab.tsx` 생성

```tsx
import React from "react";
import { useTabsContext } from "./tabs-context";
import styles from "../../css/tabs.module.css";

interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function Tab({ value, disabled, className, children, ...props }: TabProps) {
  const { activeValue, onSelect } = useTabsContext();
  const isSelected = activeValue === value;

  const handleClick = () => {
    if (!disabled) {
      onSelect(value);
    }
  };

  return (
    <button
      role="tab"
      aria-selected={isSelected}
      aria-controls={`tabpanel-${value}`}
      id={`tab-${value}`}
      disabled={disabled}
      className={`${styles.tab} ${className ?? ""}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

Tab.displayName = "Tab";
```

### Step 2.5: TabPanel 하위 컴포넌트 (TypeScript)

- [ ] `registry/react/tabs/tab-panel.tsx` 생성

```tsx
import React from "react";
import { useTabsContext } from "./tabs-context";
import styles from "../../css/tabs.module.css";

interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabPanel({ value, className, children, ...props }: TabPanelProps) {
  const { activeValue } = useTabsContext();
  const isActive = activeValue === value;

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      hidden={!isActive}
      className={`${styles.tabpanel} ${className ?? ""}`}
      {...props}
    >
      {children}
    </div>
  );
}

TabPanel.displayName = "TabPanel";
```

### Step 2.6: JavaScript 버전 생성

- [ ] `registry/react/tabs/tabs.jsx` 생성 — `tabs.tsx`에서 타입 어노테이션과 interface 제거

```jsx
import React, { useState, useCallback, createContext, useContext } from "react";
import styles from "../../css/tabs.module.css";

const TabsContext = createContext(null);

export function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tab/TabPanel must be used within a Tabs component");
  }
  return context;
}

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  justified = false,
  className,
  children,
}) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? "");

  const isControlled = controlledValue !== undefined;
  const activeValue = isControlled ? controlledValue : uncontrolledValue;

  const onSelect = useCallback(
    (val) => {
      if (!isControlled) {
        setUncontrolledValue(val);
      }
      onValueChange?.(val);
    },
    [isControlled, onValueChange]
  );

  const tabs = [];
  const panels = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type.displayName === "Tab") {
      tabs.push(child);
    } else {
      panels.push(child);
    }
  });

  const tablistClass = [styles.tablist, justified ? styles.justified : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <TabsContext.Provider value={{ activeValue, onSelect }}>
      <menu role="tablist" className={tablistClass}>
        {tabs}
      </menu>
      {panels}
    </TabsContext.Provider>
  );
}
```

- [ ] `registry/react/tabs/tab.jsx` 생성

```jsx
import React from "react";
import { useTabsContext } from "./tabs";
import styles from "../../css/tabs.module.css";

export function Tab({ value, disabled, className, children, ...props }) {
  const { activeValue, onSelect } = useTabsContext();
  const isSelected = activeValue === value;

  const handleClick = () => {
    if (!disabled) {
      onSelect(value);
    }
  };

  return (
    <button
      role="tab"
      aria-selected={isSelected}
      aria-controls={`tabpanel-${value}`}
      id={`tab-${value}`}
      disabled={disabled}
      className={`${styles.tab} ${className ?? ""}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

Tab.displayName = "Tab";
```

- [ ] `registry/react/tabs/tab-panel.jsx` 생성

```jsx
import React from "react";
import { useTabsContext } from "./tabs";
import styles from "../../css/tabs.module.css";

export function TabPanel({ value, className, children, ...props }) {
  const { activeValue } = useTabsContext();
  const isActive = activeValue === value;

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      hidden={!isActive}
      className={`${styles.tabpanel} ${className ?? ""}`}
      {...props}
    >
      {children}
    </div>
  );
}

TabPanel.displayName = "TabPanel";
```

### Step 2.7: 테스트 실행 및 통과 확인

```bash
pnpm vitest run registry/react/tabs/__tests__/tabs.test.tsx
```

### Step 2.8: 커밋

```bash
git add registry/react/tabs/
git commit -m "feat(tabs): implement React TS/JS tabs compound component (Tab, TabPanel)"
```

---

## Task 3: Tabs Svelte (TypeScript + JavaScript)

> Tabs를 Svelte 5 runes 기반으로 구현한다. TS와 JS 버전 모두 작성.

### Step 3.1: 실패 테스트 작성

- [ ] `registry/svelte/tabs/__tests__/tabs.test.ts` 생성

```ts
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";
import TabsTest from "./TabsTest.svelte";

describe("Tabs (Svelte)", () => {
  it("renders tabs and displays active panel", () => {
    render(TabsTest, { props: { defaultValue: "tab1" } });

    expect(screen.getByText("Tab 1")).toBeInTheDocument();
    expect(screen.getByText("Tab 2")).toBeInTheDocument();
    expect(screen.getByText("Content 1")).toBeVisible();
  });

  it("switches tab on click", async () => {
    render(TabsTest, { props: { defaultValue: "tab1" } });

    await fireEvent.click(screen.getByText("Tab 2"));
    expect(screen.getByText("Content 2")).toBeVisible();
  });

  it("sets aria-selected on active tab", () => {
    render(TabsTest, { props: { defaultValue: "tab1" } });

    expect(screen.getByText("Tab 1")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Tab 2")).toHaveAttribute("aria-selected", "false");
  });
});
```

- [ ] `registry/svelte/tabs/__tests__/TabsTest.svelte` 생성 — 테스트용 래퍼 컴포넌트

```svelte
<script lang="ts">
  import Tabs from "../Tabs.svelte";
  import Tab from "../Tab.svelte";
  import TabPanel from "../TabPanel.svelte";

  let { defaultValue }: { defaultValue: string } = $props();
</script>

<Tabs {defaultValue}>
  <Tab value="tab1">Tab 1</Tab>
  <Tab value="tab2">Tab 2</Tab>
  <TabPanel value="tab1">Content 1</TabPanel>
  <TabPanel value="tab2">Content 2</TabPanel>
</Tabs>
```

### Step 3.2: Tabs 컨테이너 (TypeScript)

- [ ] `registry/svelte/tabs/Tabs.svelte` 생성

```svelte
<script lang="ts">
  import type { Snippet } from "svelte";
  import { setContext } from "svelte";

  interface Props {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    justified?: boolean;
    class?: string;
    children?: Snippet;
  }

  let {
    defaultValue = "",
    value: controlledValue,
    onValueChange,
    justified = false,
    class: className,
    children,
  }: Props = $props();

  let uncontrolledValue = $state(defaultValue);

  let activeValue = $derived(controlledValue !== undefined ? controlledValue : uncontrolledValue);

  function onSelect(val: string) {
    if (controlledValue === undefined) {
      uncontrolledValue = val;
    }
    onValueChange?.(val);
  }

  setContext("tabs", {
    get activeValue() { return activeValue; },
    onSelect,
  });
</script>

<menu role="tablist" class={["tablist", justified && "justified", className].filter(Boolean).join(" ")}>
  {@render children?.()}
</menu>

<style>
  /* inject-css.ts 가 registry/css/tabs.css 내용을 여기에 자동 주입 */
</style>
```

**참고:** 위 구조에서 Svelte는 children snippet이 탭 리스트와 패널을 모두 포함한다. Tabs 컨테이너는 `<menu>` 래퍼와 context provider 역할이며, Tab/TabPanel이 context를 통해 활성 상태를 공유한다. Svelte 5에서는 slot 대신 snippet을 사용하므로 구조 분리를 위해 `tablist`와 `panels`를 별도 snippet prop으로 받는 접근도 가능하다:

```svelte
<script lang="ts">
  import type { Snippet } from "svelte";
  import { setContext } from "svelte";

  interface Props {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    justified?: boolean;
    class?: string;
    tabs?: Snippet;
    panels?: Snippet;
  }

  let {
    defaultValue = "",
    value: controlledValue,
    onValueChange,
    justified = false,
    class: className,
    tabs: tabsSnippet,
    panels: panelsSnippet,
  }: Props = $props();

  let uncontrolledValue = $state(defaultValue);

  let activeValue = $derived(controlledValue !== undefined ? controlledValue : uncontrolledValue);

  function onSelect(val: string) {
    if (controlledValue === undefined) {
      uncontrolledValue = val;
    }
    onValueChange?.(val);
  }

  setContext("tabs", {
    get activeValue() { return activeValue; },
    onSelect,
  });
</script>

<menu role="tablist" class={["tablist", justified && "justified", className].filter(Boolean).join(" ")}>
  {#if tabsSnippet}
    {@render tabsSnippet()}
  {/if}
</menu>
{#if panelsSnippet}
  {@render panelsSnippet()}
{/if}

<style>
  /* inject-css.ts 가 registry/css/tabs.css 내용을 여기에 자동 주입 */
</style>
```

구현 시 두 접근 중 일관성 있는 방식을 선택한다. 이 계획에서는 단일 `children` snippet 방식을 기본으로 하되, 탭 리스트와 패널 영역을 분리하기 위해 내부에서 slot 이름 기반 필터링 또는 두 snippet 방식을 사용할 수 있다.

### Step 3.3: Tab 하위 컴포넌트 (TypeScript)

- [ ] `registry/svelte/tabs/Tab.svelte` 생성

```svelte
<script lang="ts">
  import type { Snippet } from "svelte";
  import { getContext } from "svelte";

  interface Props {
    value: string;
    disabled?: boolean;
    class?: string;
    children?: Snippet;
  }

  let { value, disabled = false, class: className, children }: Props = $props();

  const ctx = getContext<{ activeValue: string; onSelect: (v: string) => void }>("tabs");

  let isSelected = $derived(ctx.activeValue === value);

  function handleClick() {
    if (!disabled) {
      ctx.onSelect(value);
    }
  }
</script>

<button
  role="tab"
  aria-selected={isSelected}
  aria-controls={`tabpanel-${value}`}
  id={`tab-${value}`}
  {disabled}
  class={["tab", className].filter(Boolean).join(" ")}
  onclick={handleClick}
>
  {#if children}
    {@render children()}
  {/if}
</button>
```

### Step 3.4: TabPanel 하위 컴포넌트 (TypeScript)

- [ ] `registry/svelte/tabs/TabPanel.svelte` 생성

```svelte
<script lang="ts">
  import type { Snippet } from "svelte";
  import { getContext } from "svelte";

  interface Props {
    value: string;
    class?: string;
    children?: Snippet;
  }

  let { value, class: className, children }: Props = $props();

  const ctx = getContext<{ activeValue: string }>("tabs");

  let isActive = $derived(ctx.activeValue === value);
</script>

<div
  role="tabpanel"
  id={`tabpanel-${value}`}
  aria-labelledby={`tab-${value}`}
  hidden={!isActive}
  class={["tabpanel", className].filter(Boolean).join(" ")}
>
  {#if children}
    {@render children()}
  {/if}
</div>
```

### Step 3.5: JavaScript 버전

- [ ] `registry/svelte/tabs/Tabs.js.svelte` 생성 — `<script lang="ts">`를 `<script>`로, interface/type 제거

```svelte
<script>
  import { setContext } from "svelte";

  /** @type {{ defaultValue?: string, value?: string, onValueChange?: (value: string) => void, justified?: boolean, class?: string, children?: import('svelte').Snippet }} */
  let {
    defaultValue = "",
    value: controlledValue,
    onValueChange,
    justified = false,
    class: className,
    children,
  } = $props();

  let uncontrolledValue = $state(defaultValue);

  let activeValue = $derived(controlledValue !== undefined ? controlledValue : uncontrolledValue);

  function onSelect(val) {
    if (controlledValue === undefined) {
      uncontrolledValue = val;
    }
    onValueChange?.(val);
  }

  setContext("tabs", {
    get activeValue() { return activeValue; },
    onSelect,
  });
</script>

<menu role="tablist" class={["tablist", justified && "justified", className].filter(Boolean).join(" ")}>
  {@render children?.()}
</menu>

<style>
  /* inject-css.ts 가 registry/css/tabs.css 내용을 여기에 자동 주입 */
</style>
```

- [ ] `registry/svelte/tabs/Tab.js.svelte` 생성

```svelte
<script>
  import { getContext } from "svelte";

  /** @type {{ value: string, disabled?: boolean, class?: string, children?: import('svelte').Snippet }} */
  let { value, disabled = false, class: className, children } = $props();

  const ctx = getContext("tabs");

  let isSelected = $derived(ctx.activeValue === value);

  function handleClick() {
    if (!disabled) {
      ctx.onSelect(value);
    }
  }
</script>

<button
  role="tab"
  aria-selected={isSelected}
  aria-controls={`tabpanel-${value}`}
  id={`tab-${value}`}
  {disabled}
  class={["tab", className].filter(Boolean).join(" ")}
  onclick={handleClick}
>
  {#if children}
    {@render children()}
  {/if}
</button>
```

- [ ] `registry/svelte/tabs/TabPanel.js.svelte` 생성

```svelte
<script>
  import { getContext } from "svelte";

  /** @type {{ value: string, class?: string, children?: import('svelte').Snippet }} */
  let { value, class: className, children } = $props();

  const ctx = getContext("tabs");

  let isActive = $derived(ctx.activeValue === value);
</script>

<div
  role="tabpanel"
  id={`tabpanel-${value}`}
  aria-labelledby={`tab-${value}`}
  hidden={!isActive}
  class={["tabpanel", className].filter(Boolean).join(" ")}
>
  {#if children}
    {@render children()}
  {/if}
</div>
```

### Step 3.6: 테스트 실행 및 통과 확인

```bash
pnpm vitest run registry/svelte/tabs/__tests__/tabs.test.ts
```

### Step 3.7: 커밋

```bash
git add registry/svelte/tabs/
git commit -m "feat(tabs): implement Svelte TS/JS tabs compound component (Tab, TabPanel)"
```

---

## Task 4: Tabs Vue (TypeScript + JavaScript)

> Tabs를 Vue 3 Composition API + `<script setup>`으로 구현한다.

### Step 4.1: 실패 테스트 작성

- [ ] `registry/vue/tabs/__tests__/tabs.test.ts` 생성

```ts
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Tabs from "../Tabs.vue";
import Tab from "../Tab.vue";
import TabPanel from "../TabPanel.vue";

describe("Tabs (Vue)", () => {
  it("renders tabs and displays active panel", () => {
    const wrapper = mount(Tabs, {
      props: { defaultValue: "tab1" },
      slots: {
        default: [
          `<Tab value="tab1">Tab 1</Tab>`,
          `<Tab value="tab2">Tab 2</Tab>`,
          `<TabPanel value="tab1">Content 1</TabPanel>`,
          `<TabPanel value="tab2">Content 2</TabPanel>`,
        ].join(""),
      },
      global: {
        components: { Tab, TabPanel },
      },
    });

    expect(wrapper.text()).toContain("Tab 1");
    expect(wrapper.text()).toContain("Tab 2");
    expect(wrapper.text()).toContain("Content 1");
  });

  it("switches tab on click", async () => {
    const wrapper = mount(Tabs, {
      props: { defaultValue: "tab1" },
      slots: {
        default: [
          `<Tab value="tab1">Tab 1</Tab>`,
          `<Tab value="tab2">Tab 2</Tab>`,
          `<TabPanel value="tab1">Content 1</TabPanel>`,
          `<TabPanel value="tab2">Content 2</TabPanel>`,
        ].join(""),
      },
      global: {
        components: { Tab, TabPanel },
      },
    });

    await wrapper.findAll('button[role="tab"]')[1].trigger("click");
    const panels = wrapper.findAll('[role="tabpanel"]');
    expect(panels[1].attributes("hidden")).toBeUndefined();
  });

  it("sets aria-selected on active tab", () => {
    const wrapper = mount(Tabs, {
      props: { defaultValue: "tab1" },
      slots: {
        default: [
          `<Tab value="tab1">Tab 1</Tab>`,
          `<Tab value="tab2">Tab 2</Tab>`,
          `<TabPanel value="tab1">Content 1</TabPanel>`,
          `<TabPanel value="tab2">Content 2</TabPanel>`,
        ].join(""),
      },
      global: {
        components: { Tab, TabPanel },
      },
    });

    const buttons = wrapper.findAll('button[role="tab"]');
    expect(buttons[0].attributes("aria-selected")).toBe("true");
    expect(buttons[1].attributes("aria-selected")).toBe("false");
  });
});
```

### Step 4.2: Tabs 컨테이너 (TypeScript)

- [ ] `registry/vue/tabs/Tabs.vue` 생성

```vue
<script setup lang="ts">
import { ref, computed, provide } from "vue";

interface Props {
  defaultValue?: string;
  value?: string;
  justified?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  defaultValue: "",
  justified: false,
});

const emit = defineEmits<{
  "update:value": [value: string];
}>();

const uncontrolledValue = ref(props.defaultValue);

const isControlled = computed(() => props.value !== undefined);
const activeValue = computed(() =>
  isControlled.value ? props.value! : uncontrolledValue.value
);

function onSelect(val: string) {
  if (!isControlled.value) {
    uncontrolledValue.value = val;
  }
  emit("update:value", val);
}

provide("tabs", {
  activeValue,
  onSelect,
});
</script>

<template>
  <menu
    role="tablist"
    :class="['tablist', justified && 'justified']"
  >
    <slot />
  </menu>
</template>

<style scoped>
  /* inject-css.ts 가 registry/css/tabs.css 내용을 여기에 자동 주입 */
</style>
```

**참고:** Vue에서는 `<slot />`이 Tab과 TabPanel을 모두 수용한다. 탭 리스트와 패널 영역을 분리하려면 named slot(`#tabs`, `#panels`)을 사용하거나, Tab/TabPanel 컴포넌트 자체가 teleport/conditional rendering으로 적절한 위치에 렌더링되도록 한다. 단순한 구현에서는 아래처럼 2개의 named slot 방식을 사용할 수 있다:

```vue
<template>
  <menu role="tablist" :class="['tablist', justified && 'justified']">
    <slot name="tabs" />
  </menu>
  <slot name="panels" />
</template>
```

구현 시 사용성과 7.css 원본 마크업 호환성을 고려하여 최종 결정한다.

### Step 4.3: Tab 하위 컴포넌트 (TypeScript)

- [ ] `registry/vue/tabs/Tab.vue` 생성

```vue
<script setup lang="ts">
import { computed, inject } from "vue";
import type { ComputedRef } from "vue";

interface Props {
  value: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const ctx = inject<{
  activeValue: ComputedRef<string>;
  onSelect: (val: string) => void;
}>("tabs")!;

const isSelected = computed(() => ctx.activeValue.value === props.value);

function handleClick() {
  if (!props.disabled) {
    ctx.onSelect(props.value);
  }
}
</script>

<template>
  <button
    role="tab"
    :aria-selected="isSelected"
    :aria-controls="`tabpanel-${value}`"
    :id="`tab-${value}`"
    :disabled="disabled"
    class="tab"
    @click="handleClick"
  >
    <slot />
  </button>
</template>
```

### Step 4.4: TabPanel 하위 컴포넌트 (TypeScript)

- [ ] `registry/vue/tabs/TabPanel.vue` 생성

```vue
<script setup lang="ts">
import { computed, inject } from "vue";
import type { ComputedRef } from "vue";

interface Props {
  value: string;
}

const props = defineProps<Props>();

const ctx = inject<{
  activeValue: ComputedRef<string>;
}>("tabs")!;

const isActive = computed(() => ctx.activeValue.value === props.value);
</script>

<template>
  <div
    role="tabpanel"
    :id="`tabpanel-${value}`"
    :aria-labelledby="`tab-${value}`"
    :hidden="!isActive"
    class="tabpanel"
  >
    <slot />
  </div>
</template>
```

### Step 4.5: JavaScript 버전

- [ ] `registry/vue/tabs/Tabs.js.vue` 생성

```vue
<script setup>
import { ref, computed, provide } from "vue";

const props = defineProps({
  defaultValue: { type: String, default: "" },
  value: { type: String, default: undefined },
  justified: { type: Boolean, default: false },
});

const emit = defineEmits(["update:value"]);

const uncontrolledValue = ref(props.defaultValue);

const isControlled = computed(() => props.value !== undefined);
const activeValue = computed(() =>
  isControlled.value ? props.value : uncontrolledValue.value
);

function onSelect(val) {
  if (!isControlled.value) {
    uncontrolledValue.value = val;
  }
  emit("update:value", val);
}

provide("tabs", {
  activeValue,
  onSelect,
});
</script>

<template>
  <menu
    role="tablist"
    :class="['tablist', justified && 'justified']"
  >
    <slot />
  </menu>
</template>

<style scoped>
  /* inject-css.ts 가 registry/css/tabs.css 내용을 여기에 자동 주입 */
</style>
```

- [ ] `registry/vue/tabs/Tab.js.vue` 생성

```vue
<script setup>
import { computed, inject } from "vue";

const props = defineProps({
  value: { type: String, required: true },
  disabled: { type: Boolean, default: false },
});

const ctx = inject("tabs");

const isSelected = computed(() => ctx.activeValue.value === props.value);

function handleClick() {
  if (!props.disabled) {
    ctx.onSelect(props.value);
  }
}
</script>

<template>
  <button
    role="tab"
    :aria-selected="isSelected"
    :aria-controls="`tabpanel-${value}`"
    :id="`tab-${value}`"
    :disabled="disabled"
    class="tab"
    @click="handleClick"
  >
    <slot />
  </button>
</template>
```

- [ ] `registry/vue/tabs/TabPanel.js.vue` 생성

```vue
<script setup>
import { computed, inject } from "vue";

const props = defineProps({
  value: { type: String, required: true },
});

const ctx = inject("tabs");

const isActive = computed(() => ctx.activeValue.value === props.value);
</script>

<template>
  <div
    role="tabpanel"
    :id="`tabpanel-${value}`"
    :aria-labelledby="`tab-${value}`"
    :hidden="!isActive"
    class="tabpanel"
  >
    <slot />
  </div>
</template>
```

### Step 4.6: 테스트 실행 및 통과 확인

```bash
pnpm vitest run registry/vue/tabs/__tests__/tabs.test.ts
```

### Step 4.7: 커밋

```bash
git add registry/vue/tabs/
git commit -m "feat(tabs): implement Vue TS/JS tabs compound component (Tab, TabPanel)"
```

---

## Task 5: Tabs 통합 테스트

> 3개 프레임워크 Tabs 컴포넌트의 Props 일관성, 접근성, 키보드 내비게이션 테스트를 통합 검증한다.

### Step 5.1: 접근성 테스트 확장

- [ ] `registry/react/tabs/__tests__/tabs-a11y.test.tsx` 생성

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs } from "../tabs";
import { Tab } from "../tab";
import { TabPanel } from "../tab-panel";

describe("Tabs a11y (React)", () => {
  it("has correct ARIA roles", () => {
    render(
      <Tabs defaultValue="tab1">
        <Tab value="tab1">Tab 1</Tab>
        <Tab value="tab2">Tab 2</Tab>
        <TabPanel value="tab1">Content 1</TabPanel>
        <TabPanel value="tab2">Content 2</TabPanel>
      </Tabs>
    );

    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(2);
    expect(screen.getAllByRole("tabpanel")).toHaveLength(1); // hidden ones excluded or 2 total
  });

  it("links tab to panel via aria-controls/aria-labelledby", () => {
    render(
      <Tabs defaultValue="tab1">
        <Tab value="tab1">Tab 1</Tab>
        <TabPanel value="tab1">Content 1</TabPanel>
      </Tabs>
    );

    const tab = screen.getByRole("tab");
    const panel = screen.getByRole("tabpanel");

    expect(tab).toHaveAttribute("aria-controls", "tabpanel-tab1");
    expect(panel).toHaveAttribute("aria-labelledby", "tab-tab1");
  });

  it("supports keyboard navigation with Arrow keys", async () => {
    const user = userEvent.setup();

    render(
      <Tabs defaultValue="tab1">
        <Tab value="tab1">Tab 1</Tab>
        <Tab value="tab2">Tab 2</Tab>
        <Tab value="tab3">Tab 3</Tab>
        <TabPanel value="tab1">Content 1</TabPanel>
        <TabPanel value="tab2">Content 2</TabPanel>
        <TabPanel value="tab3">Content 3</TabPanel>
      </Tabs>
    );

    const tab1 = screen.getByText("Tab 1");
    tab1.focus();

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(screen.getByText("Tab 2"));

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(screen.getByText("Tab 3"));

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(screen.getByText("Tab 1")); // wrap
  });
});
```

### Step 5.2: registry JSON 파일 경로 정합성 검증 스크립트

- [ ] tabs의 JSON에 명시된 모든 파일이 실제 존재하는지 확인

```bash
node -e "
const fs = require('fs');
const path = require('path');
const meta = JSON.parse(fs.readFileSync('registry/components/tabs.json', 'utf8'));
const missing = [];
for (const framework of Object.values(meta.files)) {
  for (const variant of Object.values(framework)) {
    for (const filePath of variant) {
      const full = path.join('registry', filePath);
      if (!fs.existsSync(full)) missing.push(full);
    }
  }
}
meta.css.forEach(c => {
  const full = path.join('registry', c);
  if (!fs.existsSync(full)) missing.push(full);
});
if (missing.length) { console.error('Missing:', missing); process.exit(1); }
else console.log('All tabs files exist.');
"
```

### Step 5.3: 전체 Tabs 테스트 실행

```bash
pnpm vitest run --reporter=verbose registry/**/tabs/**/*.test.*
```

### Step 5.4: 커밋

```bash
git add registry/react/tabs/__tests__/tabs-a11y.test.tsx
git commit -m "test(tabs): add a11y and keyboard navigation tests for tabs"
```

---

## Task 6: Menu CSS + JSON + Compound Component (Menu + MenuItem + MenuSeparator)

> Menu 컴포넌트의 CSS, JSON, 3개 프레임워크 구현을 준비한다.

### Step 6.1: CSS 파일 생성

- [ ] `registry/css/menu.css` 생성

```css
/* registry/css/menu.css — 7.css menu 원본 */
ul[role] {
  cursor: default;
  list-style: none;
  margin: 0;
  padding: 0;
}

ul[role=menu] {
  background: #f0f0f0;
  border: 1px solid #0006;
  box-shadow: 4px 4px 3px -2px #00000080;
  color: initial;
  min-width: 150px;
  padding: 2px;
  position: relative;
}

ul[role=menu] li[role=menuitem] {
  padding: 4px 24px 4px 28px;
  position: relative;
  white-space: nowrap;
}

ul[role=menu] li[role=menuitem]:hover,
ul[role=menu] li[role=menuitem]:focus {
  background: #3399ff;
  color: #fff;
  outline: none;
}

ul[role=menu] li[role=menuitem]:focus-visible {
  outline: 1px dotted #fff;
  outline-offset: -2px;
}

ul[role=menu] li[role=menuitem][aria-disabled=true] {
  color: #a0a0a0;
  pointer-events: none;
}

ul[role=menu] li[role=menuitem][aria-disabled=true]:hover {
  background: transparent;
  color: #a0a0a0;
}

ul[role=menu] hr {
  border: 0;
  border-top: 1px solid #d6d6d6;
  margin: 2px 1px;
}

ul[role=menu] li[role=menuitem] ul[role=menu] {
  display: none;
  left: 100%;
  position: absolute;
  top: -3px;
}

ul[role=menu] li[role=menuitem]:hover > ul[role=menu],
ul[role=menu] li[role=menuitem]:focus-within > ul[role=menu] {
  display: block;
}

ul[role=menu] li[role=menuitem].has-submenu::after {
  border: 4px solid transparent;
  border-left-color: currentColor;
  content: "";
  position: absolute;
  right: 8px;
  top: calc(50% - 4px);
}
```

### Step 6.2: JSON 메타데이터

- [ ] `registry/components/menu.json` 생성

```json
{
  "name": "menu",
  "displayName": "Menu",
  "description": "Windows 7 스타일 컨텍스트 메뉴. Compound Component 패턴으로 MenuItem, MenuSeparator 하위 컴포넌트를 포함한다.",
  "dependencies": [],
  "css": ["css/menu.css"],
  "files": {
    "react": {
      "ts": [
        "react/menu/menu.tsx",
        "react/menu/menu-item.tsx",
        "react/menu/menu-separator.tsx"
      ],
      "js": [
        "react/menu/menu.jsx",
        "react/menu/menu-item.jsx",
        "react/menu/menu-separator.jsx"
      ]
    },
    "svelte": {
      "ts": [
        "svelte/menu/Menu.svelte",
        "svelte/menu/MenuItem.svelte",
        "svelte/menu/MenuSeparator.svelte"
      ],
      "js": [
        "svelte/menu/Menu.js.svelte",
        "svelte/menu/MenuItem.js.svelte",
        "svelte/menu/MenuSeparator.js.svelte"
      ]
    },
    "vue": {
      "ts": [
        "vue/menu/Menu.vue",
        "vue/menu/MenuItem.vue",
        "vue/menu/MenuSeparator.vue"
      ],
      "js": [
        "vue/menu/Menu.js.vue",
        "vue/menu/MenuItem.js.vue",
        "vue/menu/MenuSeparator.js.vue"
      ]
    }
  }
}
```

### Step 6.3: 커밋

```bash
git add registry/css/menu.css registry/components/menu.json
git commit -m "feat(menu): add CSS source and registry metadata for menu component"
```

---

## Task 7: Menu React/Svelte/Vue + 테스트

> Menu Compound Component를 3개 프레임워크 TS/JS로 구현한다.

### Step 7.1: 실패 테스트 작성 (React)

- [ ] `registry/react/menu/__tests__/menu.test.tsx` 생성

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Menu } from "../menu";
import { MenuItem } from "../menu-item";
import { MenuSeparator } from "../menu-separator";

describe("Menu (React)", () => {
  it("renders menu with items", () => {
    render(
      <Menu>
        <MenuItem>File</MenuItem>
        <MenuItem>Edit</MenuItem>
      </Menu>
    );

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getAllByRole("menuitem")).toHaveLength(2);
    expect(screen.getByText("File")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("renders separator", () => {
    const { container } = render(
      <Menu>
        <MenuItem>Cut</MenuItem>
        <MenuSeparator />
        <MenuItem>Paste</MenuItem>
      </Menu>
    );

    expect(container.querySelector("hr")).toBeInTheDocument();
  });

  it("fires onSelect when item clicked", () => {
    const onSelect = vi.fn();
    render(
      <Menu>
        <MenuItem onSelect={() => onSelect("file")}>File</MenuItem>
      </Menu>
    );

    fireEvent.click(screen.getByText("File"));
    expect(onSelect).toHaveBeenCalledWith("file");
  });

  it("renders disabled items", () => {
    render(
      <Menu>
        <MenuItem disabled>Disabled</MenuItem>
      </Menu>
    );

    expect(screen.getByText("Disabled")).toHaveAttribute("aria-disabled", "true");
  });

  it("renders submenu (nested menu)", () => {
    render(
      <Menu>
        <MenuItem
          submenu={
            <Menu>
              <MenuItem>Sub Item</MenuItem>
            </Menu>
          }
        >
          Parent
        </MenuItem>
      </Menu>
    );

    expect(screen.getByText("Parent")).toBeInTheDocument();
    expect(screen.getByText("Sub Item")).toBeInTheDocument();
  });
});
```

### Step 7.2: React TypeScript 구현

- [ ] `registry/react/menu/menu.tsx` 생성

```tsx
import React from "react";
import styles from "../../css/menu.module.css";

interface MenuProps extends React.HTMLAttributes<HTMLUListElement> {
  className?: string;
}

export function Menu({ className, children, ...props }: MenuProps) {
  return (
    <ul
      role="menu"
      className={`${styles.menu} ${className ?? ""}`}
      {...props}
    >
      {children}
    </ul>
  );
}
```

- [ ] `registry/react/menu/menu-item.tsx` 생성

```tsx
import React from "react";
import styles from "../../css/menu.module.css";

interface MenuItemProps {
  disabled?: boolean;
  onSelect?: () => void;
  submenu?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function MenuItem({
  disabled = false,
  onSelect,
  submenu,
  className,
  children,
}: MenuItemProps) {
  const handleClick = () => {
    if (!disabled && onSelect) {
      onSelect();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <li
      role="menuitem"
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      className={`${styles.menuItem} ${submenu ? styles.hasSubmenu : ""} ${className ?? ""}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {children}
      {submenu}
    </li>
  );
}
```

- [ ] `registry/react/menu/menu-separator.tsx` 생성

```tsx
import React from "react";

export function MenuSeparator() {
  return <hr role="separator" />;
}
```

### Step 7.3: React JavaScript 버전

- [ ] `registry/react/menu/menu.jsx` 생성

```jsx
import React from "react";
import styles from "../../css/menu.module.css";

export function Menu({ className, children, ...props }) {
  return (
    <ul
      role="menu"
      className={`${styles.menu} ${className ?? ""}`}
      {...props}
    >
      {children}
    </ul>
  );
}
```

- [ ] `registry/react/menu/menu-item.jsx` 생성

```jsx
import React from "react";
import styles from "../../css/menu.module.css";

export function MenuItem({
  disabled = false,
  onSelect,
  submenu,
  className,
  children,
}) {
  const handleClick = () => {
    if (!disabled && onSelect) {
      onSelect();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <li
      role="menuitem"
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      className={`${styles.menuItem} ${submenu ? styles.hasSubmenu : ""} ${className ?? ""}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {children}
      {submenu}
    </li>
  );
}
```

- [ ] `registry/react/menu/menu-separator.jsx` 생성

```jsx
import React from "react";

export function MenuSeparator() {
  return <hr role="separator" />;
}
```

### Step 7.4: Svelte TypeScript 구현

- [ ] `registry/svelte/menu/Menu.svelte` 생성

```svelte
<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    class?: string;
    children?: Snippet;
  }

  let { class: className, children }: Props = $props();
</script>

<ul role="menu" class={["menu", className].filter(Boolean).join(" ")}>
  {#if children}
    {@render children()}
  {/if}
</ul>

<style>
  /* inject-css.ts 가 registry/css/menu.css 내용을 여기에 자동 주입 */
</style>
```

- [ ] `registry/svelte/menu/MenuItem.svelte` 생성

```svelte
<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    disabled?: boolean;
    onSelect?: () => void;
    hasSubmenu?: boolean;
    class?: string;
    children?: Snippet;
    submenu?: Snippet;
  }

  let {
    disabled = false,
    onSelect,
    hasSubmenu = false,
    class: className,
    children,
    submenu,
  }: Props = $props();

  function handleClick() {
    if (!disabled && onSelect) {
      onSelect();
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  }
</script>

<li
  role="menuitem"
  aria-disabled={disabled || undefined}
  tabindex={disabled ? -1 : 0}
  class={["menuItem", hasSubmenu || submenu ? "has-submenu" : "", className].filter(Boolean).join(" ")}
  onclick={handleClick}
  onkeydown={handleKeyDown}
>
  {#if children}
    {@render children()}
  {/if}
  {#if submenu}
    {@render submenu()}
  {/if}
</li>
```

- [ ] `registry/svelte/menu/MenuSeparator.svelte` 생성

```svelte
<hr role="separator" />
```

### Step 7.5: Svelte JavaScript 버전

- [ ] `registry/svelte/menu/Menu.js.svelte` 생성

```svelte
<script>
  /** @type {{ class?: string, children?: import('svelte').Snippet }} */
  let { class: className, children } = $props();
</script>

<ul role="menu" class={["menu", className].filter(Boolean).join(" ")}>
  {#if children}
    {@render children()}
  {/if}
</ul>

<style>
  /* inject-css.ts 가 registry/css/menu.css 내용을 여기에 자동 주입 */
</style>
```

- [ ] `registry/svelte/menu/MenuItem.js.svelte` 생성

```svelte
<script>
  /** @type {{ disabled?: boolean, onSelect?: () => void, hasSubmenu?: boolean, class?: string, children?: import('svelte').Snippet, submenu?: import('svelte').Snippet }} */
  let {
    disabled = false,
    onSelect,
    hasSubmenu = false,
    class: className,
    children,
    submenu,
  } = $props();

  function handleClick() {
    if (!disabled && onSelect) {
      onSelect();
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  }
</script>

<li
  role="menuitem"
  aria-disabled={disabled || undefined}
  tabindex={disabled ? -1 : 0}
  class={["menuItem", hasSubmenu || submenu ? "has-submenu" : "", className].filter(Boolean).join(" ")}
  onclick={handleClick}
  onkeydown={handleKeyDown}
>
  {#if children}
    {@render children()}
  {/if}
  {#if submenu}
    {@render submenu()}
  {/if}
</li>
```

- [ ] `registry/svelte/menu/MenuSeparator.js.svelte` 생성

```svelte
<hr role="separator" />
```

### Step 7.6: Vue TypeScript 구현

- [ ] `registry/vue/menu/Menu.vue` 생성

```vue
<script setup lang="ts">
interface Props {
  class?: string;
}

defineProps<Props>();
</script>

<template>
  <ul role="menu" :class="['menu', $props.class]">
    <slot />
  </ul>
</template>

<style scoped>
  /* inject-css.ts 가 registry/css/menu.css 내용을 여기에 자동 주입 */
</style>
```

- [ ] `registry/vue/menu/MenuItem.vue` 생성

```vue
<script setup lang="ts">
interface Props {
  disabled?: boolean;
  hasSubmenu?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  hasSubmenu: false,
});

const emit = defineEmits<{
  select: [];
}>();

function handleClick() {
  if (!props.disabled) {
    emit("select");
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    handleClick();
  }
}
</script>

<template>
  <li
    role="menuitem"
    :aria-disabled="disabled || undefined"
    :tabindex="disabled ? -1 : 0"
    :class="['menuItem', hasSubmenu && 'has-submenu']"
    @click="handleClick"
    @keydown="handleKeyDown"
  >
    <slot />
    <slot name="submenu" />
  </li>
</template>
```

- [ ] `registry/vue/menu/MenuSeparator.vue` 생성

```vue
<template>
  <hr role="separator" />
</template>
```

### Step 7.7: Vue JavaScript 버전

- [ ] `registry/vue/menu/Menu.js.vue` 생성

```vue
<script setup>
defineProps({
  class: { type: String, default: undefined },
});
</script>

<template>
  <ul role="menu" :class="['menu', $props.class]">
    <slot />
  </ul>
</template>

<style scoped>
  /* inject-css.ts 가 registry/css/menu.css 내용을 여기에 자동 주입 */
</style>
```

- [ ] `registry/vue/menu/MenuItem.js.vue` 생성

```vue
<script setup>
const props = defineProps({
  disabled: { type: Boolean, default: false },
  hasSubmenu: { type: Boolean, default: false },
});

const emit = defineEmits(["select"]);

function handleClick() {
  if (!props.disabled) {
    emit("select");
  }
}

function handleKeyDown(e) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    handleClick();
  }
}
</script>

<template>
  <li
    role="menuitem"
    :aria-disabled="disabled || undefined"
    :tabindex="disabled ? -1 : 0"
    :class="['menuItem', hasSubmenu && 'has-submenu']"
    @click="handleClick"
    @keydown="handleKeyDown"
  >
    <slot />
    <slot name="submenu" />
  </li>
</template>
```

- [ ] `registry/vue/menu/MenuSeparator.js.vue` 생성

```vue
<template>
  <hr role="separator" />
</template>
```

### Step 7.8: Svelte/Vue 테스트 작성

- [ ] `registry/svelte/menu/__tests__/menu.test.ts` 생성

```ts
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";
import MenuTest from "./MenuTest.svelte";

describe("Menu (Svelte)", () => {
  it("renders menu with items", () => {
    render(MenuTest);

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getAllByRole("menuitem")).toHaveLength(2);
  });

  it("renders separator", () => {
    render(MenuTest, { props: { showSeparator: true } });
    const menu = screen.getByRole("menu");
    expect(menu.querySelector("hr")).toBeInTheDocument();
  });
});
```

- [ ] `registry/svelte/menu/__tests__/MenuTest.svelte` 생성 — 테스트 래퍼

```svelte
<script lang="ts">
  import Menu from "../Menu.svelte";
  import MenuItem from "../MenuItem.svelte";
  import MenuSeparator from "../MenuSeparator.svelte";

  let { showSeparator = false }: { showSeparator?: boolean } = $props();
</script>

<Menu>
  <MenuItem>File</MenuItem>
  {#if showSeparator}
    <MenuSeparator />
  {/if}
  <MenuItem>Edit</MenuItem>
</Menu>
```

- [ ] `registry/vue/menu/__tests__/menu.test.ts` 생성

```ts
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Menu from "../Menu.vue";
import MenuItem from "../MenuItem.vue";
import MenuSeparator from "../MenuSeparator.vue";

describe("Menu (Vue)", () => {
  it("renders menu with items", () => {
    const wrapper = mount(Menu, {
      slots: {
        default: [
          '<MenuItem>File</MenuItem>',
          '<MenuItem>Edit</MenuItem>',
        ].join(""),
      },
      global: { components: { MenuItem } },
    });

    expect(wrapper.find('[role="menu"]').exists()).toBe(true);
    expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(2);
  });

  it("renders separator", () => {
    const wrapper = mount(Menu, {
      slots: {
        default: [
          '<MenuItem>Cut</MenuItem>',
          '<MenuSeparator />',
          '<MenuItem>Paste</MenuItem>',
        ].join(""),
      },
      global: { components: { MenuItem, MenuSeparator } },
    });

    expect(wrapper.find("hr").exists()).toBe(true);
  });
});
```

### Step 7.9: 전체 Menu 테스트 실행

```bash
pnpm vitest run --reporter=verbose registry/**/menu/**/*.test.*
```

### Step 7.10: 커밋

```bash
git add registry/react/menu/ registry/svelte/menu/ registry/vue/menu/
git commit -m "feat(menu): implement Menu compound component for React/Svelte/Vue (TS/JS)"
```

---

## Task 8: MenuBar 컴포넌트 (Menu 의존) - CSS, JSON, React/Svelte/Vue + 테스트

> MenuBar는 수평 메뉴 바로, Menu 컴포넌트를 하위 드롭다운으로 사용한다.

### Step 8.1: CSS 파일 생성

- [ ] `registry/css/menubar.css` 생성

```css
/* registry/css/menubar.css — 7.css menubar 원본 */
ul[role=menubar] {
  background: linear-gradient(#fff 20%, #f1f4fa 25%, #f1f4fa 43%, #d4dbee 48%, #e6eaf6);
  cursor: default;
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

ul[role=menubar] > [role=menuitem] {
  padding: 6px 10px;
  position: relative;
}

ul[role=menubar] > [role=menuitem]:focus,
ul[role=menubar] > [role=menuitem]:hover {
  background: #39f;
  color: #fff;
  outline: none;
}

ul[role=menubar] > [role=menuitem]:focus-visible {
  outline: 1px dotted #fff;
  outline-offset: -2px;
}

ul[role=menubar] > [role=menuitem] > ul[role=menu] {
  display: none;
  left: 0;
  position: absolute;
  top: 100%;
  z-index: 100;
}

ul[role=menubar] > [role=menuitem]:hover > ul[role=menu],
ul[role=menubar] > [role=menuitem]:focus-within > ul[role=menu] {
  display: block;
}
```

### Step 8.2: JSON 메타데이터

- [ ] `registry/components/menubar.json` 생성

```json
{
  "name": "menubar",
  "displayName": "MenuBar",
  "description": "Windows 7 스타일 수평 메뉴 바. Menu 컴포넌트를 드롭다운으로 사용한다.",
  "dependencies": ["menu"],
  "css": ["css/menubar.css"],
  "files": {
    "react": {
      "ts": [
        "react/menubar/menubar.tsx",
        "react/menubar/menubar-item.tsx"
      ],
      "js": [
        "react/menubar/menubar.jsx",
        "react/menubar/menubar-item.jsx"
      ]
    },
    "svelte": {
      "ts": [
        "svelte/menubar/MenuBar.svelte",
        "svelte/menubar/MenuBarItem.svelte"
      ],
      "js": [
        "svelte/menubar/MenuBar.js.svelte",
        "svelte/menubar/MenuBarItem.js.svelte"
      ]
    },
    "vue": {
      "ts": [
        "vue/menubar/MenuBar.vue",
        "vue/menubar/MenuBarItem.vue"
      ],
      "js": [
        "vue/menubar/MenuBar.js.vue",
        "vue/menubar/MenuBarItem.js.vue"
      ]
    }
  }
}
```

### Step 8.3: 실패 테스트 (React)

- [ ] `registry/react/menubar/__tests__/menubar.test.tsx` 생성

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MenuBar } from "../menubar";
import { MenuBarItem } from "../menubar-item";
import { Menu } from "../../menu/menu";
import { MenuItem } from "../../menu/menu-item";

describe("MenuBar (React)", () => {
  it("renders menubar with items", () => {
    render(
      <MenuBar>
        <MenuBarItem label="File">
          <Menu>
            <MenuItem>New</MenuItem>
            <MenuItem>Open</MenuItem>
          </Menu>
        </MenuBarItem>
        <MenuBarItem label="Edit">
          <Menu>
            <MenuItem>Undo</MenuItem>
          </Menu>
        </MenuBarItem>
      </MenuBar>
    );

    expect(screen.getByRole("menubar")).toBeInTheDocument();
    expect(screen.getByText("File")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("shows dropdown menu on hover", async () => {
    render(
      <MenuBar>
        <MenuBarItem label="File">
          <Menu>
            <MenuItem>New</MenuItem>
          </Menu>
        </MenuBarItem>
      </MenuBar>
    );

    const fileItem = screen.getByText("File");
    await fireEvent.mouseOver(fileItem);
    // CSS :hover 로 표시되므로 DOM에는 항상 존재 (CSS display 제어)
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("has correct ARIA roles", () => {
    render(
      <MenuBar>
        <MenuBarItem label="File">
          <Menu>
            <MenuItem>New</MenuItem>
          </Menu>
        </MenuBarItem>
      </MenuBar>
    );

    expect(screen.getByRole("menubar")).toBeInTheDocument();
    expect(screen.getByText("File").closest('[role="menuitem"]')).toBeInTheDocument();
  });
});
```

### Step 8.4: React TypeScript 구현

- [ ] `registry/react/menubar/menubar.tsx` 생성

```tsx
import React from "react";
import styles from "../../css/menubar.module.css";

interface MenuBarProps extends React.HTMLAttributes<HTMLUListElement> {
  className?: string;
}

export function MenuBar({ className, children, ...props }: MenuBarProps) {
  return (
    <ul
      role="menubar"
      className={`${styles.menubar} ${className ?? ""}`}
      {...props}
    >
      {children}
    </ul>
  );
}
```

- [ ] `registry/react/menubar/menubar-item.tsx` 생성

```tsx
import React from "react";
import styles from "../../css/menubar.module.css";

interface MenuBarItemProps {
  label: string;
  className?: string;
  children?: React.ReactNode;
}

export function MenuBarItem({ label, className, children }: MenuBarItemProps) {
  return (
    <li
      role="menuitem"
      tabIndex={0}
      className={`${styles.menubarItem} ${className ?? ""}`}
    >
      {label}
      {children}
    </li>
  );
}
```

### Step 8.5: React JavaScript 버전

- [ ] `registry/react/menubar/menubar.jsx` 생성

```jsx
import React from "react";
import styles from "../../css/menubar.module.css";

export function MenuBar({ className, children, ...props }) {
  return (
    <ul
      role="menubar"
      className={`${styles.menubar} ${className ?? ""}`}
      {...props}
    >
      {children}
    </ul>
  );
}
```

- [ ] `registry/react/menubar/menubar-item.jsx` 생성

```jsx
import React from "react";
import styles from "../../css/menubar.module.css";

export function MenuBarItem({ label, className, children }) {
  return (
    <li
      role="menuitem"
      tabIndex={0}
      className={`${styles.menubarItem} ${className ?? ""}`}
    >
      {label}
      {children}
    </li>
  );
}
```

### Step 8.6: Svelte TypeScript 구현

- [ ] `registry/svelte/menubar/MenuBar.svelte` 생성

```svelte
<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    class?: string;
    children?: Snippet;
  }

  let { class: className, children }: Props = $props();
</script>

<ul role="menubar" class={["menubar", className].filter(Boolean).join(" ")}>
  {#if children}
    {@render children()}
  {/if}
</ul>

<style>
  /* inject-css.ts 가 registry/css/menubar.css 내용을 여기에 자동 주입 */
</style>
```

- [ ] `registry/svelte/menubar/MenuBarItem.svelte` 생성

```svelte
<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    label: string;
    class?: string;
    children?: Snippet;
  }

  let { label, class: className, children }: Props = $props();
</script>

<li
  role="menuitem"
  tabindex={0}
  class={["menubarItem", className].filter(Boolean).join(" ")}
>
  {label}
  {#if children}
    {@render children()}
  {/if}
</li>
```

### Step 8.7: Svelte JavaScript 버전

- [ ] `registry/svelte/menubar/MenuBar.js.svelte` 생성

```svelte
<script>
  /** @type {{ class?: string, children?: import('svelte').Snippet }} */
  let { class: className, children } = $props();
</script>

<ul role="menubar" class={["menubar", className].filter(Boolean).join(" ")}>
  {#if children}
    {@render children()}
  {/if}
</ul>

<style>
  /* inject-css.ts 가 registry/css/menubar.css 내용을 여기에 자동 주입 */
</style>
```

- [ ] `registry/svelte/menubar/MenuBarItem.js.svelte` 생성

```svelte
<script>
  /** @type {{ label: string, class?: string, children?: import('svelte').Snippet }} */
  let { label, class: className, children } = $props();
</script>

<li
  role="menuitem"
  tabindex={0}
  class={["menubarItem", className].filter(Boolean).join(" ")}
>
  {label}
  {#if children}
    {@render children()}
  {/if}
</li>
```

### Step 8.8: Vue TypeScript 구현

- [ ] `registry/vue/menubar/MenuBar.vue` 생성

```vue
<script setup lang="ts">
interface Props {
  class?: string;
}

defineProps<Props>();
</script>

<template>
  <ul role="menubar" :class="['menubar', $props.class]">
    <slot />
  </ul>
</template>

<style scoped>
  /* inject-css.ts 가 registry/css/menubar.css 내용을 여기에 자동 주입 */
</style>
```

- [ ] `registry/vue/menubar/MenuBarItem.vue` 생성

```vue
<script setup lang="ts">
interface Props {
  label: string;
}

defineProps<Props>();
</script>

<template>
  <li
    role="menuitem"
    tabindex="0"
    class="menubarItem"
  >
    {{ label }}
    <slot />
  </li>
</template>
```

### Step 8.9: Vue JavaScript 버전

- [ ] `registry/vue/menubar/MenuBar.js.vue` 생성

```vue
<script setup>
defineProps({
  class: { type: String, default: undefined },
});
</script>

<template>
  <ul role="menubar" :class="['menubar', $props.class]">
    <slot />
  </ul>
</template>

<style scoped>
  /* inject-css.ts 가 registry/css/menubar.css 내용을 여기에 자동 주입 */
</style>
```

- [ ] `registry/vue/menubar/MenuBarItem.js.vue` 생성

```vue
<script setup>
defineProps({
  label: { type: String, required: true },
});
</script>

<template>
  <li
    role="menuitem"
    tabindex="0"
    class="menubarItem"
  >
    {{ label }}
    <slot />
  </li>
</template>
```

### Step 8.10: Svelte/Vue 테스트

- [ ] `registry/svelte/menubar/__tests__/menubar.test.ts` 생성

```ts
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import MenuBarTest from "./MenuBarTest.svelte";

describe("MenuBar (Svelte)", () => {
  it("renders menubar with items", () => {
    render(MenuBarTest);

    expect(screen.getByRole("menubar")).toBeInTheDocument();
    expect(screen.getByText("File")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });
});
```

- [ ] `registry/svelte/menubar/__tests__/MenuBarTest.svelte` 생성

```svelte
<script lang="ts">
  import MenuBar from "../MenuBar.svelte";
  import MenuBarItem from "../MenuBarItem.svelte";
  import Menu from "../../menu/Menu.svelte";
  import MenuItem from "../../menu/MenuItem.svelte";
</script>

<MenuBar>
  <MenuBarItem label="File">
    <Menu>
      <MenuItem>New</MenuItem>
    </Menu>
  </MenuBarItem>
  <MenuBarItem label="Edit">
    <Menu>
      <MenuItem>Undo</MenuItem>
    </Menu>
  </MenuBarItem>
</MenuBar>
```

- [ ] `registry/vue/menubar/__tests__/menubar.test.ts` 생성

```ts
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import MenuBar from "../MenuBar.vue";
import MenuBarItem from "../MenuBarItem.vue";

describe("MenuBar (Vue)", () => {
  it("renders menubar with items", () => {
    const wrapper = mount(MenuBar, {
      slots: {
        default: [
          '<MenuBarItem label="File" />',
          '<MenuBarItem label="Edit" />',
        ].join(""),
      },
      global: { components: { MenuBarItem } },
    });

    expect(wrapper.find('[role="menubar"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("File");
    expect(wrapper.text()).toContain("Edit");
  });
});
```

### Step 8.11: 테스트 실행

```bash
pnpm vitest run --reporter=verbose registry/**/menubar/**/*.test.*
```

### Step 8.12: 커밋

```bash
git add registry/css/menubar.css registry/components/menubar.json registry/react/menubar/ registry/svelte/menubar/ registry/vue/menubar/
git commit -m "feat(menubar): implement MenuBar component with Menu dependency for React/Svelte/Vue (TS/JS)"
```

---

## Task 9: Collapse 컴포넌트 - CSS, JSON, React/Svelte/Vue + 테스트

> details/summary 기반의 접기/펼치기 컴포넌트.

### Step 9.1: CSS 파일 생성

- [ ] `registry/css/collapse.css` 생성

```css
/* registry/css/collapse.css — 7.css collapse 원본 */
details {
  margin-top: 0;
}

details > summary {
  cursor: pointer;
  display: inline;
  margin-bottom: 0;
  position: relative;
}

details > summary:before {
  border: 5px solid transparent;
  border-left-color: #000;
  border-radius: 3px;
  content: "";
  position: absolute;
  right: 100%;
  top: calc(50% - 5px);
}

details > summary::-webkit-details-marker,
details > summary::marker {
  display: none;
}

details[open] > summary:before {
  top: calc(50% - 2.5px);
  transform: rotate(45deg);
}
```

### Step 9.2: JSON 메타데이터

- [ ] `registry/components/collapse.json` 생성

```json
{
  "name": "collapse",
  "displayName": "Collapse",
  "description": "Windows 7 스타일 접기/펼치기 컴포넌트. HTML details/summary 기반.",
  "dependencies": [],
  "css": ["css/collapse.css"],
  "files": {
    "react": {
      "ts": ["react/collapse/collapse.tsx"],
      "js": ["react/collapse/collapse.jsx"]
    },
    "svelte": {
      "ts": ["svelte/collapse/Collapse.svelte"],
      "js": ["svelte/collapse/Collapse.js.svelte"]
    },
    "vue": {
      "ts": ["vue/collapse/Collapse.vue"],
      "js": ["vue/collapse/Collapse.js.vue"]
    }
  }
}
```

### Step 9.3: 실패 테스트 (React)

- [ ] `registry/react/collapse/__tests__/collapse.test.tsx` 생성

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Collapse } from "../collapse";

describe("Collapse (React)", () => {
  it("renders with summary text", () => {
    render(
      <Collapse summary="Click to expand">
        <p>Hidden content</p>
      </Collapse>
    );

    expect(screen.getByText("Click to expand")).toBeInTheDocument();
  });

  it("is collapsed by default", () => {
    render(
      <Collapse summary="Title">
        <p>Content</p>
      </Collapse>
    );

    const details = screen.getByText("Title").closest("details");
    expect(details).not.toHaveAttribute("open");
  });

  it("supports defaultOpen prop", () => {
    render(
      <Collapse summary="Title" defaultOpen>
        <p>Content</p>
      </Collapse>
    );

    const details = screen.getByText("Title").closest("details");
    expect(details).toHaveAttribute("open");
  });

  it("toggles on click", async () => {
    render(
      <Collapse summary="Title">
        <p>Content</p>
      </Collapse>
    );

    const summary = screen.getByText("Title");
    await fireEvent.click(summary);

    const details = summary.closest("details");
    expect(details).toHaveAttribute("open");
  });

  it("calls onToggle when toggled", async () => {
    const onToggle = vi.fn();
    render(
      <Collapse summary="Title" onToggle={onToggle}>
        <p>Content</p>
      </Collapse>
    );

    await fireEvent.click(screen.getByText("Title"));
    expect(onToggle).toHaveBeenCalled();
  });

  it("supports controlled open prop", () => {
    const { rerender } = render(
      <Collapse summary="Title" open={false}>
        <p>Content</p>
      </Collapse>
    );

    const details = screen.getByText("Title").closest("details");
    expect(details).not.toHaveAttribute("open");

    rerender(
      <Collapse summary="Title" open={true}>
        <p>Content</p>
      </Collapse>
    );

    expect(details).toHaveAttribute("open");
  });
});
```

### Step 9.4: React TypeScript 구현

- [ ] `registry/react/collapse/collapse.tsx` 생성

```tsx
import React from "react";
import styles from "../../css/collapse.module.css";

interface CollapseProps extends Omit<React.DetailsHTMLAttributes<HTMLDetailsElement>, "onToggle"> {
  summary: string;
  defaultOpen?: boolean;
  open?: boolean;
  onToggle?: (open: boolean) => void;
  className?: string;
  children: React.ReactNode;
}

export function Collapse({
  summary,
  defaultOpen,
  open: controlledOpen,
  onToggle,
  className,
  children,
  ...props
}: CollapseProps) {
  const isControlled = controlledOpen !== undefined;

  const handleToggle = (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    const details = e.currentTarget;
    onToggle?.(details.open);

    if (isControlled && details.open !== controlledOpen) {
      // 제어 모드에서는 DOM 상태를 props로 강제 복원
      details.open = controlledOpen;
    }
  };

  return (
    <details
      open={isControlled ? controlledOpen : defaultOpen}
      onToggle={handleToggle}
      className={`${styles.details} ${className ?? ""}`}
      {...props}
    >
      <summary className={styles.summary}>{summary}</summary>
      {children}
    </details>
  );
}
```

### Step 9.5: React JavaScript 버전

- [ ] `registry/react/collapse/collapse.jsx` 생성

```jsx
import React from "react";
import styles from "../../css/collapse.module.css";

export function Collapse({
  summary,
  defaultOpen,
  open: controlledOpen,
  onToggle,
  className,
  children,
  ...props
}) {
  const isControlled = controlledOpen !== undefined;

  const handleToggle = (e) => {
    const details = e.currentTarget;
    onToggle?.(details.open);

    if (isControlled && details.open !== controlledOpen) {
      details.open = controlledOpen;
    }
  };

  return (
    <details
      open={isControlled ? controlledOpen : defaultOpen}
      onToggle={handleToggle}
      className={`${styles.details} ${className ?? ""}`}
      {...props}
    >
      <summary className={styles.summary}>{summary}</summary>
      {children}
    </details>
  );
}
```

### Step 9.6: Svelte TypeScript 구현

- [ ] `registry/svelte/collapse/Collapse.svelte` 생성

```svelte
<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    summary: string;
    defaultOpen?: boolean;
    open?: boolean;
    onToggle?: (open: boolean) => void;
    class?: string;
    children?: Snippet;
  }

  let {
    summary,
    defaultOpen = false,
    open: controlledOpen,
    onToggle,
    class: className,
    children,
  }: Props = $props();

  let isControlled = $derived(controlledOpen !== undefined);
  let internalOpen = $state(defaultOpen);

  let isOpen = $derived(isControlled ? controlledOpen : internalOpen);

  function handleToggle(e: Event) {
    const details = e.currentTarget as HTMLDetailsElement;
    if (!isControlled) {
      internalOpen = details.open;
    }
    onToggle?.(details.open);
  }
</script>

<details
  open={isOpen}
  ontoggle={handleToggle}
  class={["collapse", className].filter(Boolean).join(" ")}
>
  <summary>{summary}</summary>
  {#if children}
    {@render children()}
  {/if}
</details>

<style>
  /* inject-css.ts 가 registry/css/collapse.css 내용을 여기에 자동 주입 */
</style>
```

### Step 9.7: Svelte JavaScript 버전

- [ ] `registry/svelte/collapse/Collapse.js.svelte` 생성

```svelte
<script>
  /** @type {{ summary: string, defaultOpen?: boolean, open?: boolean, onToggle?: (open: boolean) => void, class?: string, children?: import('svelte').Snippet }} */
  let {
    summary,
    defaultOpen = false,
    open: controlledOpen,
    onToggle,
    class: className,
    children,
  } = $props();

  let isControlled = $derived(controlledOpen !== undefined);
  let internalOpen = $state(defaultOpen);

  let isOpen = $derived(isControlled ? controlledOpen : internalOpen);

  function handleToggle(e) {
    const details = e.currentTarget;
    if (!isControlled) {
      internalOpen = details.open;
    }
    onToggle?.(details.open);
  }
</script>

<details
  open={isOpen}
  ontoggle={handleToggle}
  class={["collapse", className].filter(Boolean).join(" ")}
>
  <summary>{summary}</summary>
  {#if children}
    {@render children()}
  {/if}
</details>

<style>
  /* inject-css.ts 가 registry/css/collapse.css 내용을 여기에 자동 주입 */
</style>
```

### Step 9.8: Vue TypeScript 구현

- [ ] `registry/vue/collapse/Collapse.vue` 생성

```vue
<script setup lang="ts">
import { ref, computed, watch } from "vue";

interface Props {
  summary: string;
  defaultOpen?: boolean;
  open?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  defaultOpen: false,
  open: undefined,
});

const emit = defineEmits<{
  toggle: [open: boolean];
}>();

const isControlled = computed(() => props.open !== undefined);
const internalOpen = ref(props.defaultOpen);
const isOpen = computed(() => (isControlled.value ? props.open : internalOpen.value));

function handleToggle(e: Event) {
  const details = e.currentTarget as HTMLDetailsElement;
  if (!isControlled.value) {
    internalOpen.value = details.open;
  }
  emit("toggle", details.open);
}
</script>

<template>
  <details
    :open="isOpen"
    @toggle="handleToggle"
    class="collapse"
  >
    <summary>{{ summary }}</summary>
    <slot />
  </details>
</template>

<style scoped>
  /* inject-css.ts 가 registry/css/collapse.css 내용을 여기에 자동 주입 */
</style>
```

### Step 9.9: Vue JavaScript 버전

- [ ] `registry/vue/collapse/Collapse.js.vue` 생성

```vue
<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  summary: { type: String, required: true },
  defaultOpen: { type: Boolean, default: false },
  open: { type: Boolean, default: undefined },
});

const emit = defineEmits(["toggle"]);

const isControlled = computed(() => props.open !== undefined);
const internalOpen = ref(props.defaultOpen);
const isOpen = computed(() => (isControlled.value ? props.open : internalOpen.value));

function handleToggle(e) {
  const details = e.currentTarget;
  if (!isControlled.value) {
    internalOpen.value = details.open;
  }
  emit("toggle", details.open);
}
</script>

<template>
  <details
    :open="isOpen"
    @toggle="handleToggle"
    class="collapse"
  >
    <summary>{{ summary }}</summary>
    <slot />
  </details>
</template>

<style scoped>
  /* inject-css.ts 가 registry/css/collapse.css 내용을 여기에 자동 주입 */
</style>
```

### Step 9.10: Svelte/Vue 테스트

- [ ] `registry/svelte/collapse/__tests__/collapse.test.ts` 생성

```ts
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";
import CollapseTest from "./CollapseTest.svelte";

describe("Collapse (Svelte)", () => {
  it("renders with summary text", () => {
    render(CollapseTest, { props: { summary: "Click me" } });
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("is collapsed by default", () => {
    render(CollapseTest, { props: { summary: "Title" } });
    const details = screen.getByText("Title").closest("details");
    expect(details).not.toHaveAttribute("open");
  });

  it("supports defaultOpen", () => {
    render(CollapseTest, { props: { summary: "Title", defaultOpen: true } });
    const details = screen.getByText("Title").closest("details");
    expect(details).toHaveAttribute("open");
  });
});
```

- [ ] `registry/svelte/collapse/__tests__/CollapseTest.svelte` 생성

```svelte
<script lang="ts">
  import Collapse from "../Collapse.svelte";

  let { summary = "Toggle", defaultOpen = false }: { summary?: string; defaultOpen?: boolean } = $props();
</script>

<Collapse {summary} {defaultOpen}>
  <p>Collapsible content</p>
</Collapse>
```

- [ ] `registry/vue/collapse/__tests__/collapse.test.ts` 생성

```ts
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Collapse from "../Collapse.vue";

describe("Collapse (Vue)", () => {
  it("renders with summary text", () => {
    const wrapper = mount(Collapse, {
      props: { summary: "Click me" },
      slots: { default: "<p>Content</p>" },
    });

    expect(wrapper.text()).toContain("Click me");
  });

  it("is collapsed by default", () => {
    const wrapper = mount(Collapse, {
      props: { summary: "Title" },
      slots: { default: "<p>Content</p>" },
    });

    expect(wrapper.find("details").attributes("open")).toBeUndefined();
  });

  it("supports defaultOpen", () => {
    const wrapper = mount(Collapse, {
      props: { summary: "Title", defaultOpen: true },
      slots: { default: "<p>Content</p>" },
    });

    expect(wrapper.find("details").attributes("open")).toBeDefined();
  });
});
```

### Step 9.11: 테스트 실행

```bash
pnpm vitest run --reporter=verbose registry/**/collapse/**/*.test.*
```

### Step 9.12: 커밋

```bash
git add registry/css/collapse.css registry/components/collapse.json registry/react/collapse/ registry/svelte/collapse/ registry/vue/collapse/
git commit -m "feat(collapse): implement Collapse component for React/Svelte/Vue (TS/JS)"
```

---

## Task 10: ProgressBar 컴포넌트 - CSS, JSON, React/Svelte/Vue + 테스트

> 애니메이션 포함 프로그래스 바. 상태별(normal, paused, error) 스타일과 marquee(불확정) 모드 지원.

### Step 10.1: CSS 파일 생성

- [ ] `registry/css/progressbar.css` 생성

```css
/* registry/css/progressbar.css — 7.css progressbar 원본 */
[role=progressbar] {
  background: radial-gradient(circle at 0 50%, #0000001f 10px, transparent 30px),
    radial-gradient(circle at 100% 50%, #0000001f 10px, transparent 30px),
    linear-gradient(180deg, #f3f3f3af, #fcfcfcaf 3px, #dbdbdbaf 6px, #cacacaaf 0, #d5d5d5af),
    #ddd;
  border: 1px solid #8e8f8f;
  border-radius: 3px;
  box-shadow: inset 0 0 0 1px #f3f3f388, 0 0 0 1px #eaeaea88;
  height: 15px;
  margin: 2px 0;
  overflow: hidden;
}

[role=progressbar] > div {
  background-color: #0bd82c;
  background-image: linear-gradient(180deg, #f3f3f3af, #fcfcfcaf 3px, #dbdbdbaf 6px, transparent 0),
    radial-gradient(circle at 0 50%, #0000002f 10px, transparent 30px),
    radial-gradient(circle at 100% 50%, #0000002f 10px, transparent 30px),
    linear-gradient(180deg, transparent 65%, #ffffff55),
    linear-gradient(180deg, transparent 6px, #cacaca33 0, #d5d5d533);
  box-shadow: inset 0 0 0 1px #ffffff1f;
  height: 100%;
  overflow: hidden;
}

[role=progressbar].paused > div {
  background-color: #e6df1b;
}

[role=progressbar].error > div {
  background-color: #ef0000;
}

[role=progressbar].animate > div:before,
[role=progressbar].marquee:before {
  animation: progressbar 3s linear infinite;
  background: linear-gradient(90deg, transparent, #ffffff80, transparent 40%);
  content: "";
  display: block;
  height: 100%;
}

@keyframes progressbar {
  0% {
    transform: translateX(-40%);
  }
  60% {
    transform: translateX(100%);
  }
  to {
    transform: translateX(100%);
  }
}
```

### Step 10.2: JSON 메타데이터

- [ ] `registry/components/progressbar.json` 생성

```json
{
  "name": "progressbar",
  "displayName": "ProgressBar",
  "description": "Windows 7 스타일 프로그래스 바. 확정/불확정 모드, 일시정지/오류 상태, 애니메이션 지원.",
  "dependencies": [],
  "css": ["css/progressbar.css"],
  "files": {
    "react": {
      "ts": ["react/progressbar/progressbar.tsx"],
      "js": ["react/progressbar/progressbar.jsx"]
    },
    "svelte": {
      "ts": ["svelte/progressbar/ProgressBar.svelte"],
      "js": ["svelte/progressbar/ProgressBar.js.svelte"]
    },
    "vue": {
      "ts": ["vue/progressbar/ProgressBar.vue"],
      "js": ["vue/progressbar/ProgressBar.js.vue"]
    }
  }
}
```

### Step 10.3: 실패 테스트 (React)

- [ ] `registry/react/progressbar/__tests__/progressbar.test.tsx` 생성

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "../progressbar";

describe("ProgressBar (React)", () => {
  it("renders with value", () => {
    render(<ProgressBar value={50} />);

    const bar = screen.getByRole("progressbar");
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute("aria-valuenow", "50");
  });

  it("sets min and max attributes", () => {
    render(<ProgressBar value={30} min={0} max={100} />);

    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("renders inner div with correct width percentage", () => {
    const { container } = render(<ProgressBar value={75} />);

    const inner = container.querySelector('[role="progressbar"] > div');
    expect(inner).toHaveStyle({ width: "75%" });
  });

  it("applies paused state", () => {
    render(<ProgressBar value={50} state="paused" />);

    const bar = screen.getByRole("progressbar");
    expect(bar.className).toContain("paused");
  });

  it("applies error state", () => {
    render(<ProgressBar value={50} state="error" />);

    const bar = screen.getByRole("progressbar");
    expect(bar.className).toContain("error");
  });

  it("renders animate variant", () => {
    render(<ProgressBar value={50} animate />);

    const bar = screen.getByRole("progressbar");
    expect(bar.className).toContain("animate");
  });

  it("renders marquee (indeterminate) mode", () => {
    render(<ProgressBar marquee />);

    const bar = screen.getByRole("progressbar");
    expect(bar.className).toContain("marquee");
    expect(bar).not.toHaveAttribute("aria-valuenow");
  });

  it("clamps value between min and max", () => {
    const { container } = render(<ProgressBar value={150} min={0} max={100} />);

    const inner = container.querySelector('[role="progressbar"] > div');
    expect(inner).toHaveStyle({ width: "100%" });
  });
});
```

### Step 10.4: React TypeScript 구현

- [ ] `registry/react/progressbar/progressbar.tsx` 생성

```tsx
import React from "react";
import styles from "../../css/progressbar.module.css";

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  min?: number;
  max?: number;
  state?: "normal" | "paused" | "error";
  animate?: boolean;
  marquee?: boolean;
  className?: string;
}

export function ProgressBar({
  value = 0,
  min = 0,
  max = 100,
  state = "normal",
  animate = false,
  marquee = false,
  className,
  ...props
}: ProgressBarProps) {
  const clampedValue = Math.min(Math.max(value, min), max);
  const percentage = ((clampedValue - min) / (max - min)) * 100;

  const barClass = [
    styles.progressbar,
    state === "paused" ? styles.paused : "",
    state === "error" ? styles.error : "",
    animate ? styles.animate : "",
    marquee ? styles.marquee : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      role="progressbar"
      aria-valuenow={marquee ? undefined : clampedValue}
      aria-valuemin={min}
      aria-valuemax={max}
      className={barClass}
      {...props}
    >
      {!marquee && <div style={{ width: `${percentage}%` }} />}
    </div>
  );
}
```

### Step 10.5: React JavaScript 버전

- [ ] `registry/react/progressbar/progressbar.jsx` 생성

```jsx
import React from "react";
import styles from "../../css/progressbar.module.css";

export function ProgressBar({
  value = 0,
  min = 0,
  max = 100,
  state = "normal",
  animate = false,
  marquee = false,
  className,
  ...props
}) {
  const clampedValue = Math.min(Math.max(value, min), max);
  const percentage = ((clampedValue - min) / (max - min)) * 100;

  const barClass = [
    styles.progressbar,
    state === "paused" ? styles.paused : "",
    state === "error" ? styles.error : "",
    animate ? styles.animate : "",
    marquee ? styles.marquee : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      role="progressbar"
      aria-valuenow={marquee ? undefined : clampedValue}
      aria-valuemin={min}
      aria-valuemax={max}
      className={barClass}
      {...props}
    >
      {!marquee && <div style={{ width: `${percentage}%` }} />}
    </div>
  );
}
```

### Step 10.6: Svelte TypeScript 구현

- [ ] `registry/svelte/progressbar/ProgressBar.svelte` 생성

```svelte
<script lang="ts">
  interface Props {
    value?: number;
    min?: number;
    max?: number;
    state?: "normal" | "paused" | "error";
    animate?: boolean;
    marquee?: boolean;
    class?: string;
  }

  let {
    value = 0,
    min = 0,
    max = 100,
    state = "normal",
    animate = false,
    marquee = false,
    class: className,
  }: Props = $props();

  let clampedValue = $derived(Math.min(Math.max(value, min), max));
  let percentage = $derived(((clampedValue - min) / (max - min)) * 100);
</script>

<div
  role="progressbar"
  aria-valuenow={marquee ? undefined : clampedValue}
  aria-valuemin={min}
  aria-valuemax={max}
  class={[
    "progressbar",
    state === "paused" && "paused",
    state === "error" && "error",
    animate && "animate",
    marquee && "marquee",
    className,
  ].filter(Boolean).join(" ")}
>
  {#if !marquee}
    <div style="width: {percentage}%"></div>
  {/if}
</div>

<style>
  /* inject-css.ts 가 registry/css/progressbar.css 내용을 여기에 자동 주입 */
</style>
```

### Step 10.7: Svelte JavaScript 버전

- [ ] `registry/svelte/progressbar/ProgressBar.js.svelte` 생성

```svelte
<script>
  /** @type {{ value?: number, min?: number, max?: number, state?: "normal" | "paused" | "error", animate?: boolean, marquee?: boolean, class?: string }} */
  let {
    value = 0,
    min = 0,
    max = 100,
    state = "normal",
    animate = false,
    marquee = false,
    class: className,
  } = $props();

  let clampedValue = $derived(Math.min(Math.max(value, min), max));
  let percentage = $derived(((clampedValue - min) / (max - min)) * 100);
</script>

<div
  role="progressbar"
  aria-valuenow={marquee ? undefined : clampedValue}
  aria-valuemin={min}
  aria-valuemax={max}
  class={[
    "progressbar",
    state === "paused" && "paused",
    state === "error" && "error",
    animate && "animate",
    marquee && "marquee",
    className,
  ].filter(Boolean).join(" ")}
>
  {#if !marquee}
    <div style="width: {percentage}%"></div>
  {/if}
</div>

<style>
  /* inject-css.ts 가 registry/css/progressbar.css 내용을 여기에 자동 주입 */
</style>
```

### Step 10.8: Vue TypeScript 구현

- [ ] `registry/vue/progressbar/ProgressBar.vue` 생성

```vue
<script setup lang="ts">
import { computed } from "vue";

interface Props {
  value?: number;
  min?: number;
  max?: number;
  state?: "normal" | "paused" | "error";
  animate?: boolean;
  marquee?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
  min: 0,
  max: 100,
  state: "normal",
  animate: false,
  marquee: false,
});

const clampedValue = computed(() => Math.min(Math.max(props.value, props.min), props.max));
const percentage = computed(
  () => ((clampedValue.value - props.min) / (props.max - props.min)) * 100
);
</script>

<template>
  <div
    role="progressbar"
    :aria-valuenow="marquee ? undefined : clampedValue"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :class="[
      'progressbar',
      state === 'paused' && 'paused',
      state === 'error' && 'error',
      animate && 'animate',
      marquee && 'marquee',
    ]"
  >
    <div v-if="!marquee" :style="{ width: `${percentage}%` }" />
  </div>
</template>

<style scoped>
  /* inject-css.ts 가 registry/css/progressbar.css 내용을 여기에 자동 주입 */
</style>
```

### Step 10.9: Vue JavaScript 버전

- [ ] `registry/vue/progressbar/ProgressBar.js.vue` 생성

```vue
<script setup>
import { computed } from "vue";

const props = defineProps({
  value: { type: Number, default: 0 },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  state: { type: String, default: "normal" },
  animate: { type: Boolean, default: false },
  marquee: { type: Boolean, default: false },
});

const clampedValue = computed(() => Math.min(Math.max(props.value, props.min), props.max));
const percentage = computed(
  () => ((clampedValue.value - props.min) / (props.max - props.min)) * 100
);
</script>

<template>
  <div
    role="progressbar"
    :aria-valuenow="marquee ? undefined : clampedValue"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :class="[
      'progressbar',
      state === 'paused' && 'paused',
      state === 'error' && 'error',
      animate && 'animate',
      marquee && 'marquee',
    ]"
  >
    <div v-if="!marquee" :style="{ width: `${percentage}%` }" />
  </div>
</template>

<style scoped>
  /* inject-css.ts 가 registry/css/progressbar.css 내용을 여기에 자동 주입 */
</style>
```

### Step 10.10: Svelte/Vue 테스트

- [ ] `registry/svelte/progressbar/__tests__/progressbar.test.ts` 생성

```ts
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import ProgressBar from "../ProgressBar.svelte";

describe("ProgressBar (Svelte)", () => {
  it("renders with value", () => {
    render(ProgressBar, { props: { value: 50 } });

    const bar = screen.getByRole("progressbar");
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute("aria-valuenow", "50");
  });

  it("applies paused state", () => {
    render(ProgressBar, { props: { value: 50, state: "paused" } });

    const bar = screen.getByRole("progressbar");
    expect(bar.className).toContain("paused");
  });

  it("applies error state", () => {
    render(ProgressBar, { props: { value: 50, state: "error" } });

    const bar = screen.getByRole("progressbar");
    expect(bar.className).toContain("error");
  });

  it("renders marquee mode without aria-valuenow", () => {
    render(ProgressBar, { props: { marquee: true } });

    const bar = screen.getByRole("progressbar");
    expect(bar.className).toContain("marquee");
    expect(bar.hasAttribute("aria-valuenow")).toBe(false);
  });
});
```

- [ ] `registry/vue/progressbar/__tests__/progressbar.test.ts` 생성

```ts
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ProgressBar from "../ProgressBar.vue";

describe("ProgressBar (Vue)", () => {
  it("renders with value", () => {
    const wrapper = mount(ProgressBar, {
      props: { value: 50 },
    });

    const bar = wrapper.find('[role="progressbar"]');
    expect(bar.exists()).toBe(true);
    expect(bar.attributes("aria-valuenow")).toBe("50");
  });

  it("renders inner div with correct width", () => {
    const wrapper = mount(ProgressBar, {
      props: { value: 75 },
    });

    const inner = wrapper.find('[role="progressbar"] > div');
    expect(inner.attributes("style")).toContain("width: 75%");
  });

  it("applies paused state", () => {
    const wrapper = mount(ProgressBar, {
      props: { value: 50, state: "paused" },
    });

    expect(wrapper.find('[role="progressbar"]').classes()).toContain("paused");
  });

  it("applies error state", () => {
    const wrapper = mount(ProgressBar, {
      props: { value: 50, state: "error" },
    });

    expect(wrapper.find('[role="progressbar"]').classes()).toContain("error");
  });

  it("renders marquee mode", () => {
    const wrapper = mount(ProgressBar, {
      props: { marquee: true },
    });

    const bar = wrapper.find('[role="progressbar"]');
    expect(bar.classes()).toContain("marquee");
    expect(bar.attributes("aria-valuenow")).toBeUndefined();
  });
});
```

### Step 10.11: 테스트 실행

```bash
pnpm vitest run --reporter=verbose registry/**/progressbar/**/*.test.*
```

### Step 10.12: 커밋

```bash
git add registry/css/progressbar.css registry/components/progressbar.json registry/react/progressbar/ registry/svelte/progressbar/ registry/vue/progressbar/
git commit -m "feat(progressbar): implement ProgressBar component for React/Svelte/Vue (TS/JS)"
```

---

## Task 11: Registry 업데이트 + 통합 테스트

> Batch 3의 5개 컴포넌트를 registry index.json에 추가하고 전체 정합성 테스트를 수행한다.

### Step 11.1: index.json 업데이트

- [ ] `registry/index.json`의 `components` 배열에 Batch 3 컴포넌트 5개 추가

```json
{
  "name": "tabs",
  "displayName": "Tabs",
  "description": "Windows 7 스타일 탭 내비게이션",
  "dependencies": []
},
{
  "name": "menu",
  "displayName": "Menu",
  "description": "Windows 7 스타일 컨텍스트 메뉴",
  "dependencies": []
},
{
  "name": "menubar",
  "displayName": "MenuBar",
  "description": "Windows 7 스타일 수평 메뉴 바",
  "dependencies": ["menu"]
},
{
  "name": "collapse",
  "displayName": "Collapse",
  "description": "Windows 7 스타일 접기/펼치기",
  "dependencies": []
},
{
  "name": "progressbar",
  "displayName": "ProgressBar",
  "description": "Windows 7 스타일 프로그래스 바",
  "dependencies": []
}
```

### Step 11.2: Registry 파일 정합성 검증 스크립트

- [ ] 모든 Batch 3 컴포넌트의 JSON 메타데이터와 실제 파일이 일치하는지 검증

```bash
node -e "
const fs = require('fs');
const path = require('path');
const components = ['tabs', 'menu', 'menubar', 'collapse', 'progressbar'];
let allOk = true;
for (const name of components) {
  const metaPath = path.join('registry', 'components', name + '.json');
  if (!fs.existsSync(metaPath)) {
    console.error('Missing meta:', metaPath);
    allOk = false;
    continue;
  }
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));

  // CSS 파일 확인
  for (const cssPath of meta.css) {
    const full = path.join('registry', cssPath);
    if (!fs.existsSync(full)) {
      console.error('Missing CSS:', full);
      allOk = false;
    }
  }

  // 프레임워크 파일 확인
  for (const [fw, variants] of Object.entries(meta.files)) {
    for (const [variant, files] of Object.entries(variants)) {
      for (const filePath of files) {
        const full = path.join('registry', filePath);
        if (!fs.existsSync(full)) {
          console.error('Missing file:', full, '(' + fw + '/' + variant + ')');
          allOk = false;
        }
      }
    }
  }
}
if (allOk) console.log('All Batch 3 registry files verified.');
else process.exit(1);
"
```

### Step 11.3: CSS inject 파이프라인 검증

- [ ] `inject-css.ts` 스크립트 실행하여 Svelte/Vue `<style>` 블록이 올바르게 주입되는지 확인

```bash
pnpm inject-css
```

- [ ] 주입 후 Svelte/Vue 파일의 `<style>` 블록에 실제 CSS 내용이 들어있는지 grep으로 확인

```bash
# Svelte 파일에서 role=tablist 등의 실제 CSS 선택자가 존재하는지 확인
grep -l "role=tablist" registry/svelte/tabs/Tabs.svelte
grep -l "role=menu" registry/svelte/menu/Menu.svelte
grep -l "role=progressbar" registry/svelte/progressbar/ProgressBar.svelte
```

### Step 11.4: 전체 Batch 3 테스트 실행

```bash
pnpm vitest run --reporter=verbose \
  registry/**/tabs/**/*.test.* \
  registry/**/menu/**/*.test.* \
  registry/**/menubar/**/*.test.* \
  registry/**/collapse/**/*.test.* \
  registry/**/progressbar/**/*.test.*
```

### Step 11.5: Cross-component 의존성 테스트

- [ ] MenuBar가 Menu를 올바르게 포함하는지 통합 테스트

```tsx
// registry/react/menubar/__tests__/menubar-integration.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MenuBar } from "../menubar";
import { MenuBarItem } from "../menubar-item";
import { Menu } from "../../menu/menu";
import { MenuItem } from "../../menu/menu-item";
import { MenuSeparator } from "../../menu/menu-separator";

describe("MenuBar + Menu Integration", () => {
  it("renders full menubar with nested menus", () => {
    render(
      <MenuBar>
        <MenuBarItem label="File">
          <Menu>
            <MenuItem>New</MenuItem>
            <MenuItem>Open</MenuItem>
            <MenuSeparator />
            <MenuItem>Exit</MenuItem>
          </Menu>
        </MenuBarItem>
        <MenuBarItem label="Edit">
          <Menu>
            <MenuItem>Undo</MenuItem>
            <MenuItem>Redo</MenuItem>
          </Menu>
        </MenuBarItem>
        <MenuBarItem label="Help">
          <Menu>
            <MenuItem>About</MenuItem>
          </Menu>
        </MenuBarItem>
      </MenuBar>
    );

    expect(screen.getByRole("menubar")).toBeInTheDocument();
    expect(screen.getByText("File")).toBeInTheDocument();
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.getByText("Exit")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });
});
```

### Step 11.6: 커밋

```bash
git add registry/index.json registry/react/menubar/__tests__/menubar-integration.test.tsx
git commit -m "feat(batch3): update registry index and add integration tests for all Batch 3 components"
```

---

## 파일 목록 요약

### CSS (5 files)
| 파일 | 설명 |
|------|------|
| `registry/css/tabs.css` | 탭 내비게이션 |
| `registry/css/menu.css` | 컨텍스트 메뉴 |
| `registry/css/menubar.css` | 수평 메뉴 바 |
| `registry/css/collapse.css` | 접기/펼치기 |
| `registry/css/progressbar.css` | 프로그래스 바 |

### JSON Metadata (5 files)
| 파일 | 의존성 |
|------|--------|
| `registry/components/tabs.json` | 없음 |
| `registry/components/menu.json` | 없음 |
| `registry/components/menubar.json` | menu |
| `registry/components/collapse.json` | 없음 |
| `registry/components/progressbar.json` | 없음 |

### React 컴포넌트 (20 files = 10 TS + 10 JS)
| 디렉토리 | TS 파일 | JS 파일 |
|----------|---------|---------|
| `react/tabs/` | tabs.tsx, tab.tsx, tab-panel.tsx, tabs-context.ts | tabs.jsx, tab.jsx, tab-panel.jsx |
| `react/menu/` | menu.tsx, menu-item.tsx, menu-separator.tsx | menu.jsx, menu-item.jsx, menu-separator.jsx |
| `react/menubar/` | menubar.tsx, menubar-item.tsx | menubar.jsx, menubar-item.jsx |
| `react/collapse/` | collapse.tsx | collapse.jsx |
| `react/progressbar/` | progressbar.tsx | progressbar.jsx |

### Svelte 컴포넌트 (20 files = 10 TS + 10 JS)
| 디렉토리 | TS 파일 | JS 파일 |
|----------|---------|---------|
| `svelte/tabs/` | Tabs.svelte, Tab.svelte, TabPanel.svelte | Tabs.js.svelte, Tab.js.svelte, TabPanel.js.svelte |
| `svelte/menu/` | Menu.svelte, MenuItem.svelte, MenuSeparator.svelte | Menu.js.svelte, MenuItem.js.svelte, MenuSeparator.js.svelte |
| `svelte/menubar/` | MenuBar.svelte, MenuBarItem.svelte | MenuBar.js.svelte, MenuBarItem.js.svelte |
| `svelte/collapse/` | Collapse.svelte | Collapse.js.svelte |
| `svelte/progressbar/` | ProgressBar.svelte | ProgressBar.js.svelte |

### Vue 컴포넌트 (20 files = 10 TS + 10 JS)
| 디렉토리 | TS 파일 | JS 파일 |
|----------|---------|---------|
| `vue/tabs/` | Tabs.vue, Tab.vue, TabPanel.vue | Tabs.js.vue, Tab.js.vue, TabPanel.js.vue |
| `vue/menu/` | Menu.vue, MenuItem.vue, MenuSeparator.vue | Menu.js.vue, MenuItem.js.vue, MenuSeparator.js.vue |
| `vue/menubar/` | MenuBar.vue, MenuBarItem.vue | MenuBar.js.vue, MenuBarItem.js.vue |
| `vue/collapse/` | Collapse.vue | Collapse.js.vue |
| `vue/progressbar/` | ProgressBar.vue | ProgressBar.js.vue |

### 테스트 파일 (approx. 15+ files)
| 경로 | 범위 |
|------|------|
| `registry/react/tabs/__tests__/tabs.test.tsx` | React Tabs 기본 |
| `registry/react/tabs/__tests__/tabs-a11y.test.tsx` | React Tabs 접근성 |
| `registry/svelte/tabs/__tests__/tabs.test.ts` | Svelte Tabs |
| `registry/vue/tabs/__tests__/tabs.test.ts` | Vue Tabs |
| `registry/react/menu/__tests__/menu.test.tsx` | React Menu |
| `registry/svelte/menu/__tests__/menu.test.ts` | Svelte Menu |
| `registry/vue/menu/__tests__/menu.test.ts` | Vue Menu |
| `registry/react/menubar/__tests__/menubar.test.tsx` | React MenuBar |
| `registry/svelte/menubar/__tests__/menubar.test.ts` | Svelte MenuBar |
| `registry/vue/menubar/__tests__/menubar.test.ts` | Vue MenuBar |
| `registry/react/collapse/__tests__/collapse.test.tsx` | React Collapse |
| `registry/svelte/collapse/__tests__/collapse.test.ts` | Svelte Collapse |
| `registry/vue/collapse/__tests__/collapse.test.ts` | Vue Collapse |
| `registry/react/progressbar/__tests__/progressbar.test.tsx` | React ProgressBar |
| `registry/svelte/progressbar/__tests__/progressbar.test.ts` | Svelte ProgressBar |
| `registry/vue/progressbar/__tests__/progressbar.test.ts` | Vue ProgressBar |
| `registry/react/menubar/__tests__/menubar-integration.test.tsx` | MenuBar+Menu 통합 |
