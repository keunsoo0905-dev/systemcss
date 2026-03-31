# Batch 5: Window + Scrollbar + Balloon + Typography + 마무리 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** win7ui의 마지막 4개 컴포넌트(window, scrollbar, balloon, typography)를 구현하고, 전체 21개 컴포넌트 통합 테스트, 문서 사이트 기본 구조, npm 배포 준비를 완료하여 v1.0.0 릴리즈 가능 상태로 만든다.

**Architecture:** Window는 Compound Component 패턴으로 Window + TitleBar + WindowBody + StatusBar + GlassFrame + DialogBox를 하나의 모듈로 구성한다. CSS는 registry/css/에서 단일 소스로 관리하며, inject-css.ts가 Svelte/Vue의 `<style>` 블록에 자동 주입한다. Scrollbar는 브라우저 네이티브 스크롤바를 CSS로 커스터마이징하며, Balloon은 tooltip role 기반의 위치 변형 컴포넌트, Typography는 기본 텍스트 스타일 유틸리티이다.

**Tech Stack:** TypeScript, React 18+, Svelte 5 (runes), Vue 3 (Composition API), CSS Modules (React), Vitest, pnpm workspace, tsup, Commander.js

---

## Task 1: Window CSS 추출 + JSON 메타데이터

> 7.css npm 패키지에서 window.css(25.9kB)를 추출하고, registry JSON 메타데이터를 생성한다.

### Step 1.1: 7.css에서 window.css 복사

- [ ] 7.css npm 패키지에서 window.css를 추출하여 `registry/css/window.css`에 복사

```bash
# 7.css 패키지에서 CSS 추출
cd /Users/kim/projects/systemcss
mkdir -p /tmp/7css-extract
cd /tmp/7css-extract
npm pack 7.css@0.21.1
tar -xzf 7.css-0.21.1.tgz
# window.css 복사
cp package/dist/gui/window.css /Users/kim/projects/systemcss/registry/css/window.css
```

- [ ] 복사된 CSS 파일의 크기와 내용 검증

```bash
wc -c /Users/kim/projects/systemcss/registry/css/window.css
# 예상: ~25.9kB
```

### Step 1.2: Window 컴포넌트 JSON 메타데이터 생성

- [ ] `registry/components/window.json` 생성

```json
{
  "name": "window",
  "displayName": "Window",
  "description": "Windows 7 윈도우 프레임. TitleBar, WindowBody, StatusBar, GlassFrame, DialogBox 하위 컴포넌트 포함.",
  "dependencies": [],
  "css": ["css/window.css"],
  "files": {
    "react": {
      "ts": [
        "react/window/window.tsx",
        "react/window/title-bar.tsx",
        "react/window/window-body.tsx",
        "react/window/status-bar.tsx",
        "react/window/glass-frame.tsx",
        "react/window/dialog-box.tsx",
        "react/window/index.ts"
      ],
      "js": [
        "react/window/window.jsx",
        "react/window/title-bar.jsx",
        "react/window/window-body.jsx",
        "react/window/status-bar.jsx",
        "react/window/glass-frame.jsx",
        "react/window/dialog-box.jsx",
        "react/window/index.js"
      ]
    },
    "svelte": {
      "ts": [
        "svelte/window/Window.svelte",
        "svelte/window/TitleBar.svelte",
        "svelte/window/WindowBody.svelte",
        "svelte/window/StatusBar.svelte",
        "svelte/window/GlassFrame.svelte",
        "svelte/window/DialogBox.svelte",
        "svelte/window/index.ts"
      ],
      "js": [
        "svelte/window/Window.js.svelte",
        "svelte/window/TitleBar.js.svelte",
        "svelte/window/WindowBody.js.svelte",
        "svelte/window/StatusBar.js.svelte",
        "svelte/window/GlassFrame.js.svelte",
        "svelte/window/DialogBox.js.svelte",
        "svelte/window/index.js"
      ]
    },
    "vue": {
      "ts": [
        "vue/window/Window.vue",
        "vue/window/TitleBar.vue",
        "vue/window/WindowBody.vue",
        "vue/window/StatusBar.vue",
        "vue/window/GlassFrame.vue",
        "vue/window/DialogBox.vue",
        "vue/window/index.ts"
      ],
      "js": [
        "vue/window/Window.js.vue",
        "vue/window/TitleBar.js.vue",
        "vue/window/WindowBody.js.vue",
        "vue/window/StatusBar.js.vue",
        "vue/window/GlassFrame.js.vue",
        "vue/window/DialogBox.js.vue",
        "vue/window/index.js"
      ]
    }
  }
}
```

- [ ] `registry/index.json`에 window 컴포넌트 항목 추가

```json
{
  "name": "window",
  "displayName": "Window",
  "description": "Windows 7 윈도우 프레임",
  "dependencies": []
}
```

### Step 1.3: 커밋

```bash
git add registry/css/window.css registry/components/window.json
git commit -m "feat(window): extract window.css from 7.css and add registry metadata"
```

---

## Task 2: Window Compound Component 설계 — TitleBar, WindowBody, StatusBar 하위 컴포넌트

> Window의 핵심 하위 컴포넌트 3개의 Props 인터페이스와 HTML 구조를 확정한다.

### Step 2.1: 7.css window.css의 HTML 구조 분석

7.css가 기대하는 HTML 구조:

```html
<!-- 기본 Window -->
<div class="window" role="dialog">
  <div class="title-bar">
    <div class="title-bar-text">Window Title</div>
    <div class="title-bar-controls">
      <button aria-label="Minimize"></button>
      <button aria-label="Maximize"></button>
      <button aria-label="Close"></button>
    </div>
  </div>
  <div class="window-body">
    <p>Window content here</p>
  </div>
  <div class="status-bar">
    <p class="status-bar-field">Status text</p>
    <p class="status-bar-field">Field 2</p>
    <p class="status-bar-field">Field 3</p>
  </div>
</div>

<!-- Glass Frame 변형 -->
<div class="window glass">
  <div class="title-bar">
    <div class="title-bar-text">Glass Window</div>
    <div class="title-bar-controls">
      <button aria-label="Minimize"></button>
      <button aria-label="Maximize"></button>
      <button aria-label="Close"></button>
    </div>
  </div>
  <div class="window-body has-space">
    <p>Content with padding</p>
  </div>
</div>

<!-- Dialog Box 변형 -->
<div class="window" role="dialog">
  <div class="title-bar">
    <div class="title-bar-text">Dialog Title</div>
    <div class="title-bar-controls">
      <button aria-label="Close"></button>
    </div>
  </div>
  <div class="window-body has-space">
    <p>Dialog content</p>
  </div>
</div>
```

### Step 2.2: Props 인터페이스 설계

```typescript
// --- Window ---
interface WindowProps {
  /** "default" | "glass" - glass 프레임 적용 여부 */
  variant?: "default" | "glass";
  /** role 속성, 기본값 없음 (사용자 지정) */
  role?: string;
  className?: string; // React
  // class?: string; // Svelte, Vue
  children?: React.ReactNode; // React
  // <slot /> // Svelte, Vue
}

// --- TitleBar ---
interface TitleBarProps {
  /** 타이틀바에 표시할 텍스트 */
  title: string;
  /** 표시할 컨트롤 버튼들. 기본값: ["minimize", "maximize", "close"] */
  controls?: Array<"minimize" | "maximize" | "close" | "help">;
  /** 각 컨트롤 버튼 클릭 핸들러 */
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  onHelp?: () => void;
  /** 아이콘 (title-bar-text 앞에 표시되는 이미지) */
  icon?: string; // img src
  className?: string;
}

// --- WindowBody ---
interface WindowBodyProps {
  /** padding 추가 여부 (has-space 클래스) */
  hasSpace?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// --- StatusBar ---
interface StatusBarProps {
  /** 상태바 필드 텍스트 배열 */
  fields: string[];
  className?: string;
}
```

### Step 2.3: 커밋

```bash
git commit -m "docs(window): define compound component props interfaces and HTML structure"
```

---

## Task 3: Window React TS/JS 구현

> Window의 React TypeScript 및 JavaScript 버전을 구현한다.

### Step 3.1: 테스트 먼저 작성 (TDD - Red)

- [ ] `registry/react/window/__tests__/window.test.tsx` 생성

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Window } from "../window";
import { TitleBar } from "../title-bar";
import { WindowBody } from "../window-body";
import { StatusBar } from "../status-bar";

describe("Window", () => {
  it("renders a window with default class", () => {
    const { container } = render(<Window>content</Window>);
    expect(container.querySelector(".window")).toBeTruthy();
  });

  it("applies glass variant class", () => {
    const { container } = render(<Window variant="glass">content</Window>);
    const el = container.querySelector(".window");
    expect(el?.classList.contains("glass")).toBe(true);
  });

  it("forwards role attribute", () => {
    render(<Window role="dialog">content</Window>);
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("merges custom className", () => {
    const { container } = render(<Window className="custom">content</Window>);
    const el = container.querySelector(".window");
    expect(el?.classList.contains("custom")).toBe(true);
  });
});

describe("TitleBar", () => {
  it("renders title text", () => {
    render(<TitleBar title="My Window" />);
    expect(screen.getByText("My Window")).toBeTruthy();
  });

  it("renders default controls (minimize, maximize, close)", () => {
    render(<TitleBar title="Test" />);
    expect(screen.getByLabelText("Minimize")).toBeTruthy();
    expect(screen.getByLabelText("Maximize")).toBeTruthy();
    expect(screen.getByLabelText("Close")).toBeTruthy();
  });

  it("renders only specified controls", () => {
    render(<TitleBar title="Dialog" controls={["close"]} />);
    expect(screen.getByLabelText("Close")).toBeTruthy();
    expect(screen.queryByLabelText("Minimize")).toBeNull();
    expect(screen.queryByLabelText("Maximize")).toBeNull();
  });

  it("renders icon when provided", () => {
    render(<TitleBar title="With Icon" icon="/icon.png" />);
    const img = screen.getByRole("img");
    expect(img).toBeTruthy();
    expect(img.getAttribute("src")).toBe("/icon.png");
  });
});

describe("WindowBody", () => {
  it("renders children", () => {
    render(<WindowBody>Hello</WindowBody>);
    expect(screen.getByText("Hello")).toBeTruthy();
  });

  it("applies has-space class when hasSpace is true", () => {
    const { container } = render(<WindowBody hasSpace>content</WindowBody>);
    const el = container.querySelector(".window-body");
    expect(el?.classList.contains("has-space")).toBe(true);
  });

  it("does not apply has-space by default", () => {
    const { container } = render(<WindowBody>content</WindowBody>);
    const el = container.querySelector(".window-body");
    expect(el?.classList.contains("has-space")).toBe(false);
  });
});

describe("StatusBar", () => {
  it("renders status bar fields", () => {
    render(<StatusBar fields={["Ready", "Ln 1, Col 1", "UTF-8"]} />);
    expect(screen.getByText("Ready")).toBeTruthy();
    expect(screen.getByText("Ln 1, Col 1")).toBeTruthy();
    expect(screen.getByText("UTF-8")).toBeTruthy();
  });

  it("applies status-bar-field class to each field", () => {
    const { container } = render(<StatusBar fields={["A", "B"]} />);
    const fields = container.querySelectorAll(".status-bar-field");
    expect(fields.length).toBe(2);
  });
});
```

- [ ] 테스트 실행 -- 실패 확인 (Red)

```bash
cd /Users/kim/projects/systemcss
pnpm vitest run registry/react/window/__tests__/window.test.tsx
```

### Step 3.2: React TypeScript 구현 (Green)

- [ ] `registry/react/window/window.tsx` 생성

```tsx
import React from "react";
import styles from "../../css/window.module.css";

interface WindowProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass";
}

export function Window({
  variant = "default",
  className,
  children,
  ...props
}: WindowProps) {
  const classNames = [
    styles.window,
    variant === "glass" ? styles.glass : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  );
}
```

- [ ] `registry/react/window/title-bar.tsx` 생성

```tsx
import React from "react";
import styles from "../../css/window.module.css";

type ControlButton = "minimize" | "maximize" | "close" | "help";

interface TitleBarProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  controls?: ControlButton[];
  icon?: string;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  onHelp?: () => void;
}

const controlLabels: Record<ControlButton, string> = {
  minimize: "Minimize",
  maximize: "Maximize",
  close: "Close",
  help: "Help",
};

export function TitleBar({
  title,
  controls = ["minimize", "maximize", "close"],
  icon,
  onMinimize,
  onMaximize,
  onClose,
  onHelp,
  className,
  ...props
}: TitleBarProps) {
  const handlers: Record<ControlButton, (() => void) | undefined> = {
    minimize: onMinimize,
    maximize: onMaximize,
    close: onClose,
    help: onHelp,
  };

  return (
    <div
      className={`${styles["title-bar"]} ${className ?? ""}`.trim()}
      {...props}
    >
      {icon && (
        <img
          src={icon}
          alt=""
          className={styles["title-bar-icon"]}
          aria-hidden="true"
        />
      )}
      <div className={styles["title-bar-text"]}>{title}</div>
      <div className={styles["title-bar-controls"]}>
        {controls.map((control) => (
          <button
            key={control}
            aria-label={controlLabels[control]}
            onClick={handlers[control]}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] `registry/react/window/window-body.tsx` 생성

```tsx
import React from "react";
import styles from "../../css/window.module.css";

interface WindowBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  hasSpace?: boolean;
}

export function WindowBody({
  hasSpace = false,
  className,
  children,
  ...props
}: WindowBodyProps) {
  const classNames = [
    styles["window-body"],
    hasSpace ? styles["has-space"] : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  );
}
```

- [ ] `registry/react/window/status-bar.tsx` 생성

```tsx
import React from "react";
import styles from "../../css/window.module.css";

interface StatusBarProps extends React.HTMLAttributes<HTMLDivElement> {
  fields: string[];
}

export function StatusBar({ fields, className, ...props }: StatusBarProps) {
  return (
    <div
      className={`${styles["status-bar"]} ${className ?? ""}`.trim()}
      {...props}
    >
      {fields.map((field, index) => (
        <p key={index} className={styles["status-bar-field"]}>
          {field}
        </p>
      ))}
    </div>
  );
}
```

- [ ] `registry/react/window/index.ts` 생성 (barrel export)

```ts
export { Window } from "./window";
export { TitleBar } from "./title-bar";
export { WindowBody } from "./window-body";
export { StatusBar } from "./status-bar";
export { GlassFrame } from "./glass-frame";
export { DialogBox } from "./dialog-box";
```

### Step 3.3: 테스트 통과 확인 (Green)

```bash
pnpm vitest run registry/react/window/__tests__/window.test.tsx
```

### Step 3.4: React JavaScript 버전 생성

- [ ] `registry/react/window/window.jsx` -- TS 버전에서 타입 어노테이션 제거

```jsx
import React from "react";
import styles from "../../css/window.module.css";

export function Window({
  variant = "default",
  className,
  children,
  ...props
}) {
  const classNames = [
    styles.window,
    variant === "glass" ? styles.glass : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  );
}
```

- [ ] `registry/react/window/title-bar.jsx`

```jsx
import React from "react";
import styles from "../../css/window.module.css";

const controlLabels = {
  minimize: "Minimize",
  maximize: "Maximize",
  close: "Close",
  help: "Help",
};

export function TitleBar({
  title,
  controls = ["minimize", "maximize", "close"],
  icon,
  onMinimize,
  onMaximize,
  onClose,
  onHelp,
  className,
  ...props
}) {
  const handlers = {
    minimize: onMinimize,
    maximize: onMaximize,
    close: onClose,
    help: onHelp,
  };

  return (
    <div
      className={`${styles["title-bar"]} ${className ?? ""}`.trim()}
      {...props}
    >
      {icon && (
        <img
          src={icon}
          alt=""
          className={styles["title-bar-icon"]}
          aria-hidden="true"
        />
      )}
      <div className={styles["title-bar-text"]}>{title}</div>
      <div className={styles["title-bar-controls"]}>
        {controls.map((control) => (
          <button
            key={control}
            aria-label={controlLabels[control]}
            onClick={handlers[control]}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] `registry/react/window/window-body.jsx`

```jsx
import React from "react";
import styles from "../../css/window.module.css";

export function WindowBody({
  hasSpace = false,
  className,
  children,
  ...props
}) {
  const classNames = [
    styles["window-body"],
    hasSpace ? styles["has-space"] : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  );
}
```

- [ ] `registry/react/window/status-bar.jsx`

```jsx
import React from "react";
import styles from "../../css/window.module.css";

export function StatusBar({ fields, className, ...props }) {
  return (
    <div
      className={`${styles["status-bar"]} ${className ?? ""}`.trim()}
      {...props}
    >
      {fields.map((field, index) => (
        <p key={index} className={styles["status-bar-field"]}>
          {field}
        </p>
      ))}
    </div>
  );
}
```

- [ ] `registry/react/window/index.js` 생성 (barrel export)

```js
export { Window } from "./window";
export { TitleBar } from "./title-bar";
export { WindowBody } from "./window-body";
export { StatusBar } from "./status-bar";
export { GlassFrame } from "./glass-frame";
export { DialogBox } from "./dialog-box";
```

### Step 3.5: 커밋

```bash
git add registry/react/window/
git commit -m "feat(window): implement Window compound component for React (TS/JS)

Includes Window, TitleBar, WindowBody, StatusBar with tests."
```

---

## Task 4: Window Svelte TS/JS 구현

> Window의 Svelte 5 (runes) TypeScript 및 JavaScript 버전을 구현한다.

### Step 4.1: 테스트 먼저 작성 (TDD - Red)

- [ ] `registry/svelte/window/__tests__/window.test.ts` 생성

```ts
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import Window from "../Window.svelte";
import TitleBar from "../TitleBar.svelte";
import WindowBody from "../WindowBody.svelte";
import StatusBar from "../StatusBar.svelte";

describe("Window (Svelte)", () => {
  it("renders a window with default class", () => {
    const { container } = render(Window);
    expect(container.querySelector(".window")).toBeTruthy();
  });

  it("applies glass variant", () => {
    const { container } = render(Window, { props: { variant: "glass" } });
    const el = container.querySelector(".window");
    expect(el?.classList.contains("glass")).toBe(true);
  });
});

describe("TitleBar (Svelte)", () => {
  it("renders title text", () => {
    render(TitleBar, { props: { title: "My Window" } });
    expect(screen.getByText("My Window")).toBeTruthy();
  });

  it("renders default controls", () => {
    render(TitleBar, { props: { title: "Test" } });
    expect(screen.getByLabelText("Minimize")).toBeTruthy();
    expect(screen.getByLabelText("Maximize")).toBeTruthy();
    expect(screen.getByLabelText("Close")).toBeTruthy();
  });

  it("renders only specified controls", () => {
    render(TitleBar, { props: { title: "Dialog", controls: ["close"] } });
    expect(screen.getByLabelText("Close")).toBeTruthy();
    expect(screen.queryByLabelText("Minimize")).toBeNull();
  });
});

describe("WindowBody (Svelte)", () => {
  it("applies has-space class when prop is true", () => {
    const { container } = render(WindowBody, { props: { hasSpace: true } });
    const el = container.querySelector(".window-body");
    expect(el?.classList.contains("has-space")).toBe(true);
  });
});

describe("StatusBar (Svelte)", () => {
  it("renders status bar fields", () => {
    render(StatusBar, {
      props: { fields: ["Ready", "Ln 1", "UTF-8"] },
    });
    expect(screen.getByText("Ready")).toBeTruthy();
    expect(screen.getByText("UTF-8")).toBeTruthy();
  });
});
```

### Step 4.2: Svelte TypeScript 구현

- [ ] `registry/svelte/window/Window.svelte`

```svelte
<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "glass";
  }

  let { variant = "default", class: className, children, ...rest }: Props = $props();
</script>

<div
  class="window {variant === 'glass' ? 'glass' : ''} {className ?? ''}"
  {...rest}
>
  {@render children?.()}
</div>

<style>
  /* inject-css.ts: window.css */
</style>
```

- [ ] `registry/svelte/window/TitleBar.svelte`

```svelte
<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type ControlButton = "minimize" | "maximize" | "close" | "help";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    title: string;
    controls?: ControlButton[];
    icon?: string;
    onMinimize?: () => void;
    onMaximize?: () => void;
    onClose?: () => void;
    onHelp?: () => void;
  }

  let {
    title,
    controls = ["minimize", "maximize", "close"],
    icon,
    onMinimize,
    onMaximize,
    onClose,
    onHelp,
    class: className,
    ...rest
  }: Props = $props();

  const controlLabels: Record<ControlButton, string> = {
    minimize: "Minimize",
    maximize: "Maximize",
    close: "Close",
    help: "Help",
  };

  function getHandler(control: ControlButton): (() => void) | undefined {
    const map: Record<ControlButton, (() => void) | undefined> = {
      minimize: onMinimize,
      maximize: onMaximize,
      close: onClose,
      help: onHelp,
    };
    return map[control];
  }
</script>

<div class="title-bar {className ?? ''}" {...rest}>
  {#if icon}
    <img src={icon} alt="" class="title-bar-icon" aria-hidden="true" />
  {/if}
  <div class="title-bar-text">{title}</div>
  <div class="title-bar-controls">
    {#each controls as control}
      <button aria-label={controlLabels[control]} onclick={getHandler(control)}></button>
    {/each}
  </div>
</div>

<style>
  /* inject-css.ts: window.css */
</style>
```

- [ ] `registry/svelte/window/WindowBody.svelte`

```svelte
<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    hasSpace?: boolean;
  }

  let { hasSpace = false, class: className, children, ...rest }: Props = $props();
</script>

<div
  class="window-body {hasSpace ? 'has-space' : ''} {className ?? ''}"
  {...rest}
>
  {@render children?.()}
</div>

<style>
  /* inject-css.ts: window.css */
</style>
```

- [ ] `registry/svelte/window/StatusBar.svelte`

```svelte
<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    fields: string[];
  }

  let { fields, class: className, ...rest }: Props = $props();
</script>

<div class="status-bar {className ?? ''}" {...rest}>
  {#each fields as field}
    <p class="status-bar-field">{field}</p>
  {/each}
</div>

<style>
  /* inject-css.ts: window.css */
</style>
```

- [ ] `registry/svelte/window/index.ts`

```ts
export { default as Window } from "./Window.svelte";
export { default as TitleBar } from "./TitleBar.svelte";
export { default as WindowBody } from "./WindowBody.svelte";
export { default as StatusBar } from "./StatusBar.svelte";
export { default as GlassFrame } from "./GlassFrame.svelte";
export { default as DialogBox } from "./DialogBox.svelte";
```

### Step 4.3: Svelte JavaScript 버전 생성

- [ ] `registry/svelte/window/Window.js.svelte` -- `lang="ts"` 제거, 인터페이스 제거

```svelte
<script>
  let { variant = "default", class: className, children, ...rest } = $props();
</script>

<div
  class="window {variant === 'glass' ? 'glass' : ''} {className ?? ''}"
  {...rest}
>
  {@render children?.()}
</div>

<style>
  /* inject-css.ts: window.css */
</style>
```

- [ ] `registry/svelte/window/TitleBar.js.svelte`

```svelte
<script>
  let {
    title,
    controls = ["minimize", "maximize", "close"],
    icon,
    onMinimize,
    onMaximize,
    onClose,
    onHelp,
    class: className,
    ...rest
  } = $props();

  const controlLabels = {
    minimize: "Minimize",
    maximize: "Maximize",
    close: "Close",
    help: "Help",
  };

  function getHandler(control) {
    const map = { minimize: onMinimize, maximize: onMaximize, close: onClose, help: onHelp };
    return map[control];
  }
</script>

<div class="title-bar {className ?? ''}" {...rest}>
  {#if icon}
    <img src={icon} alt="" class="title-bar-icon" aria-hidden="true" />
  {/if}
  <div class="title-bar-text">{title}</div>
  <div class="title-bar-controls">
    {#each controls as control}
      <button aria-label={controlLabels[control]} onclick={getHandler(control)}></button>
    {/each}
  </div>
</div>

<style>
  /* inject-css.ts: window.css */
</style>
```

- [ ] `registry/svelte/window/WindowBody.js.svelte`

```svelte
<script>
  let { hasSpace = false, class: className, children, ...rest } = $props();
</script>

<div
  class="window-body {hasSpace ? 'has-space' : ''} {className ?? ''}"
  {...rest}
>
  {@render children?.()}
</div>

<style>
  /* inject-css.ts: window.css */
</style>
```

- [ ] `registry/svelte/window/StatusBar.js.svelte`

```svelte
<script>
  let { fields, class: className, ...rest } = $props();
</script>

<div class="status-bar {className ?? ''}" {...rest}>
  {#each fields as field}
    <p class="status-bar-field">{field}</p>
  {/each}
</div>

<style>
  /* inject-css.ts: window.css */
</style>
```

- [ ] `registry/svelte/window/index.js`

```js
export { default as Window } from "./Window.js.svelte";
export { default as TitleBar } from "./TitleBar.js.svelte";
export { default as WindowBody } from "./WindowBody.js.svelte";
export { default as StatusBar } from "./StatusBar.js.svelte";
export { default as GlassFrame } from "./GlassFrame.js.svelte";
export { default as DialogBox } from "./DialogBox.js.svelte";
```

### Step 4.4: 테스트 통과 확인 + inject-css.ts 실행

```bash
pnpm vitest run registry/svelte/window/__tests__/window.test.ts
pnpm inject-css -- --component window
```

### Step 4.5: 커밋

```bash
git add registry/svelte/window/
git commit -m "feat(window): implement Window compound component for Svelte 5 (TS/JS)"
```

---

## Task 5: Window Vue TS/JS 구현

> Window의 Vue 3 Composition API TypeScript 및 JavaScript 버전을 구현한다.

### Step 5.1: 테스트 먼저 작성 (TDD - Red)

- [ ] `registry/vue/window/__tests__/window.test.ts` 생성

```ts
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Window from "../Window.vue";
import TitleBar from "../TitleBar.vue";
import WindowBody from "../WindowBody.vue";
import StatusBar from "../StatusBar.vue";

describe("Window (Vue)", () => {
  it("renders a window with default class", () => {
    const wrapper = mount(Window, { slots: { default: "content" } });
    expect(wrapper.find(".window").exists()).toBe(true);
  });

  it("applies glass variant", () => {
    const wrapper = mount(Window, {
      props: { variant: "glass" },
      slots: { default: "content" },
    });
    expect(wrapper.find(".window.glass").exists()).toBe(true);
  });
});

describe("TitleBar (Vue)", () => {
  it("renders title text", () => {
    const wrapper = mount(TitleBar, { props: { title: "My Window" } });
    expect(wrapper.find(".title-bar-text").text()).toBe("My Window");
  });

  it("renders default controls", () => {
    const wrapper = mount(TitleBar, { props: { title: "Test" } });
    expect(wrapper.find('[aria-label="Minimize"]').exists()).toBe(true);
    expect(wrapper.find('[aria-label="Maximize"]').exists()).toBe(true);
    expect(wrapper.find('[aria-label="Close"]').exists()).toBe(true);
  });

  it("renders only specified controls", () => {
    const wrapper = mount(TitleBar, {
      props: { title: "Dialog", controls: ["close"] },
    });
    expect(wrapper.find('[aria-label="Close"]').exists()).toBe(true);
    expect(wrapper.find('[aria-label="Minimize"]').exists()).toBe(false);
  });
});

describe("WindowBody (Vue)", () => {
  it("applies has-space class", () => {
    const wrapper = mount(WindowBody, {
      props: { hasSpace: true },
      slots: { default: "content" },
    });
    expect(wrapper.find(".window-body.has-space").exists()).toBe(true);
  });
});

describe("StatusBar (Vue)", () => {
  it("renders fields", () => {
    const wrapper = mount(StatusBar, {
      props: { fields: ["Ready", "Ln 1", "UTF-8"] },
    });
    const fields = wrapper.findAll(".status-bar-field");
    expect(fields.length).toBe(3);
    expect(fields[0].text()).toBe("Ready");
  });
});
```

### Step 5.2: Vue TypeScript 구현

- [ ] `registry/vue/window/Window.vue`

```vue
<script setup lang="ts">
interface Props {
  variant?: "default" | "glass";
}

const { variant = "default" } = defineProps<Props>();
</script>

<template>
  <div :class="['window', variant === 'glass' && 'glass']">
    <slot />
  </div>
</template>

<style scoped>
  /* inject-css.ts: window.css */
</style>
```

- [ ] `registry/vue/window/TitleBar.vue`

```vue
<script setup lang="ts">
type ControlButton = "minimize" | "maximize" | "close" | "help";

interface Props {
  title: string;
  controls?: ControlButton[];
  icon?: string;
}

const props = withDefaults(defineProps<Props>(), {
  controls: () => ["minimize", "maximize", "close"],
});

const emit = defineEmits<{
  minimize: [];
  maximize: [];
  close: [];
  help: [];
}>();

const controlLabels: Record<ControlButton, string> = {
  minimize: "Minimize",
  maximize: "Maximize",
  close: "Close",
  help: "Help",
};

function handleControl(control: ControlButton) {
  emit(control);
}
</script>

<template>
  <div class="title-bar">
    <img
      v-if="props.icon"
      :src="props.icon"
      alt=""
      class="title-bar-icon"
      aria-hidden="true"
    />
    <div class="title-bar-text">{{ props.title }}</div>
    <div class="title-bar-controls">
      <button
        v-for="control in props.controls"
        :key="control"
        :aria-label="controlLabels[control]"
        @click="handleControl(control)"
      />
    </div>
  </div>
</template>

<style scoped>
  /* inject-css.ts: window.css */
</style>
```

- [ ] `registry/vue/window/WindowBody.vue`

```vue
<script setup lang="ts">
interface Props {
  hasSpace?: boolean;
}

const { hasSpace = false } = defineProps<Props>();
</script>

<template>
  <div :class="['window-body', hasSpace && 'has-space']">
    <slot />
  </div>
</template>

<style scoped>
  /* inject-css.ts: window.css */
</style>
```

- [ ] `registry/vue/window/StatusBar.vue`

```vue
<script setup lang="ts">
interface Props {
  fields: string[];
}

const { fields } = defineProps<Props>();
</script>

<template>
  <div class="status-bar">
    <p
      v-for="(field, index) in fields"
      :key="index"
      class="status-bar-field"
    >
      {{ field }}
    </p>
  </div>
</template>

<style scoped>
  /* inject-css.ts: window.css */
</style>
```

- [ ] `registry/vue/window/index.ts`

```ts
export { default as Window } from "./Window.vue";
export { default as TitleBar } from "./TitleBar.vue";
export { default as WindowBody } from "./WindowBody.vue";
export { default as StatusBar } from "./StatusBar.vue";
export { default as GlassFrame } from "./GlassFrame.vue";
export { default as DialogBox } from "./DialogBox.vue";
```

### Step 5.3: Vue JavaScript 버전 생성

- [ ] `registry/vue/window/Window.js.vue` -- `lang="ts"` 제거, defineProps를 런타임 선언으로 변경

```vue
<script setup>
const props = defineProps({
  variant: { type: String, default: "default" },
});
</script>

<template>
  <div :class="['window', props.variant === 'glass' && 'glass']">
    <slot />
  </div>
</template>

<style scoped>
  /* inject-css.ts: window.css */
</style>
```

- [ ] `registry/vue/window/TitleBar.js.vue`

```vue
<script setup>
const props = defineProps({
  title: { type: String, required: true },
  controls: { type: Array, default: () => ["minimize", "maximize", "close"] },
  icon: { type: String, default: undefined },
});

const emit = defineEmits(["minimize", "maximize", "close", "help"]);

const controlLabels = {
  minimize: "Minimize",
  maximize: "Maximize",
  close: "Close",
  help: "Help",
};

function handleControl(control) {
  emit(control);
}
</script>

<template>
  <div class="title-bar">
    <img
      v-if="props.icon"
      :src="props.icon"
      alt=""
      class="title-bar-icon"
      aria-hidden="true"
    />
    <div class="title-bar-text">{{ props.title }}</div>
    <div class="title-bar-controls">
      <button
        v-for="control in props.controls"
        :key="control"
        :aria-label="controlLabels[control]"
        @click="handleControl(control)"
      />
    </div>
  </div>
</template>

<style scoped>
  /* inject-css.ts: window.css */
</style>
```

- [ ] `registry/vue/window/WindowBody.js.vue`

```vue
<script setup>
const props = defineProps({
  hasSpace: { type: Boolean, default: false },
});
</script>

<template>
  <div :class="['window-body', props.hasSpace && 'has-space']">
    <slot />
  </div>
</template>

<style scoped>
  /* inject-css.ts: window.css */
</style>
```

- [ ] `registry/vue/window/StatusBar.js.vue`

```vue
<script setup>
const props = defineProps({
  fields: { type: Array, required: true },
});
</script>

<template>
  <div class="status-bar">
    <p
      v-for="(field, index) in props.fields"
      :key="index"
      class="status-bar-field"
    >
      {{ field }}
    </p>
  </div>
</template>

<style scoped>
  /* inject-css.ts: window.css */
</style>
```

- [ ] `registry/vue/window/index.js`

```js
export { default as Window } from "./Window.js.vue";
export { default as TitleBar } from "./TitleBar.js.vue";
export { default as WindowBody } from "./WindowBody.js.vue";
export { default as StatusBar } from "./StatusBar.js.vue";
export { default as GlassFrame } from "./GlassFrame.js.vue";
export { default as DialogBox } from "./DialogBox.js.vue";
```

### Step 5.4: 테스트 통과 확인 + inject-css.ts 실행

```bash
pnpm vitest run registry/vue/window/__tests__/window.test.ts
pnpm inject-css -- --component window
```

### Step 5.5: 커밋

```bash
git add registry/vue/window/
git commit -m "feat(window): implement Window compound component for Vue 3 (TS/JS)"
```

---

## Task 6: Window GlassFrame + DialogBox 변형

> Window의 특수 변형 컴포넌트 2개를 구현한다. GlassFrame은 Aero Glass 스타일의 투명 프레임, DialogBox는 모달 다이얼로그 래퍼이다.

### Step 6.1: GlassFrame / DialogBox Props 설계

```typescript
// --- GlassFrame ---
// Window variant="glass"의 편의 래퍼. 내부적으로 Window + TitleBar + WindowBody를 조합.
interface GlassFrameProps {
  title: string;
  controls?: Array<"minimize" | "maximize" | "close">;
  hasSpace?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  className?: string;
  children?: React.ReactNode;
}

// --- DialogBox ---
// role="dialog"가 자동 설정되는 Window 래퍼. controls 기본값이 ["close"]만.
interface DialogBoxProps {
  title: string;
  controls?: Array<"close" | "help">;
  hasSpace?: boolean;
  onClose?: () => void;
  onHelp?: () => void;
  className?: string;
  children?: React.ReactNode;
}
```

### Step 6.2: 테스트 작성 (TDD - Red)

- [ ] `registry/react/window/__tests__/glass-frame.test.tsx` 생성

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GlassFrame } from "../glass-frame";

describe("GlassFrame", () => {
  it("renders with glass class", () => {
    const { container } = render(
      <GlassFrame title="Glass Window">content</GlassFrame>
    );
    const el = container.querySelector(".window");
    expect(el?.classList.contains("glass")).toBe(true);
  });

  it("renders title bar with specified title", () => {
    render(<GlassFrame title="My Glass">content</GlassFrame>);
    expect(screen.getByText("My Glass")).toBeTruthy();
  });

  it("renders window-body with has-space by default", () => {
    const { container } = render(
      <GlassFrame title="Test">content</GlassFrame>
    );
    const body = container.querySelector(".window-body");
    expect(body?.classList.contains("has-space")).toBe(true);
  });
});
```

- [ ] `registry/react/window/__tests__/dialog-box.test.tsx` 생성

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DialogBox } from "../dialog-box";

describe("DialogBox", () => {
  it("renders with role=dialog", () => {
    render(<DialogBox title="Confirm">Are you sure?</DialogBox>);
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("renders only close control by default", () => {
    render(<DialogBox title="Alert">message</DialogBox>);
    expect(screen.getByLabelText("Close")).toBeTruthy();
    expect(screen.queryByLabelText("Minimize")).toBeNull();
    expect(screen.queryByLabelText("Maximize")).toBeNull();
  });

  it("renders window-body with has-space by default", () => {
    const { container } = render(
      <DialogBox title="Test">content</DialogBox>
    );
    const body = container.querySelector(".window-body");
    expect(body?.classList.contains("has-space")).toBe(true);
  });
});
```

### Step 6.3: React 구현

- [ ] `registry/react/window/glass-frame.tsx`

```tsx
import React from "react";
import { Window } from "./window";
import { TitleBar } from "./title-bar";
import { WindowBody } from "./window-body";

type ControlButton = "minimize" | "maximize" | "close";

interface GlassFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  controls?: ControlButton[];
  hasSpace?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

export function GlassFrame({
  title,
  controls = ["minimize", "maximize", "close"],
  hasSpace = true,
  onMinimize,
  onMaximize,
  onClose,
  className,
  children,
  ...props
}: GlassFrameProps) {
  return (
    <Window variant="glass" className={className} {...props}>
      <TitleBar
        title={title}
        controls={controls}
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        onClose={onClose}
      />
      <WindowBody hasSpace={hasSpace}>{children}</WindowBody>
    </Window>
  );
}
```

- [ ] `registry/react/window/dialog-box.tsx`

```tsx
import React from "react";
import { Window } from "./window";
import { TitleBar } from "./title-bar";
import { WindowBody } from "./window-body";

type ControlButton = "close" | "help";

interface DialogBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  controls?: ControlButton[];
  hasSpace?: boolean;
  onClose?: () => void;
  onHelp?: () => void;
}

export function DialogBox({
  title,
  controls = ["close"],
  hasSpace = true,
  onClose,
  onHelp,
  className,
  children,
  ...props
}: DialogBoxProps) {
  return (
    <Window role="dialog" className={className} {...props}>
      <TitleBar
        title={title}
        controls={controls}
        onClose={onClose}
        onHelp={onHelp}
      />
      <WindowBody hasSpace={hasSpace}>{children}</WindowBody>
    </Window>
  );
}
```

- [ ] `registry/react/window/glass-frame.jsx` (JS 버전)

```jsx
import React from "react";
import { Window } from "./window";
import { TitleBar } from "./title-bar";
import { WindowBody } from "./window-body";

export function GlassFrame({
  title,
  controls = ["minimize", "maximize", "close"],
  hasSpace = true,
  onMinimize,
  onMaximize,
  onClose,
  className,
  children,
  ...props
}) {
  return (
    <Window variant="glass" className={className} {...props}>
      <TitleBar
        title={title}
        controls={controls}
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        onClose={onClose}
      />
      <WindowBody hasSpace={hasSpace}>{children}</WindowBody>
    </Window>
  );
}
```

- [ ] `registry/react/window/dialog-box.jsx` (JS 버전)

```jsx
import React from "react";
import { Window } from "./window";
import { TitleBar } from "./title-bar";
import { WindowBody } from "./window-body";

export function DialogBox({
  title,
  controls = ["close"],
  hasSpace = true,
  onClose,
  onHelp,
  className,
  children,
  ...props
}) {
  return (
    <Window role="dialog" className={className} {...props}>
      <TitleBar title={title} controls={controls} onClose={onClose} onHelp={onHelp} />
      <WindowBody hasSpace={hasSpace}>{children}</WindowBody>
    </Window>
  );
}
```

### Step 6.4: Svelte 구현

- [ ] `registry/svelte/window/GlassFrame.svelte`

```svelte
<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import Window from "./Window.svelte";
  import TitleBar from "./TitleBar.svelte";
  import WindowBody from "./WindowBody.svelte";

  type ControlButton = "minimize" | "maximize" | "close";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    title: string;
    controls?: ControlButton[];
    hasSpace?: boolean;
    onMinimize?: () => void;
    onMaximize?: () => void;
    onClose?: () => void;
  }

  let {
    title,
    controls = ["minimize", "maximize", "close"],
    hasSpace = true,
    onMinimize,
    onMaximize,
    onClose,
    class: className,
    children,
    ...rest
  }: Props = $props();
</script>

<Window variant="glass" class={className} {...rest}>
  <TitleBar {title} {controls} {onMinimize} {onMaximize} {onClose} />
  <WindowBody {hasSpace}>
    {@render children?.()}
  </WindowBody>
</Window>
```

- [ ] `registry/svelte/window/GlassFrame.js.svelte` (JS 버전)

```svelte
<script>
  import Window from "./Window.js.svelte";
  import TitleBar from "./TitleBar.js.svelte";
  import WindowBody from "./WindowBody.js.svelte";

  let {
    title,
    controls = ["minimize", "maximize", "close"],
    hasSpace = true,
    onMinimize,
    onMaximize,
    onClose,
    class: className,
    children,
    ...rest
  } = $props();
</script>

<Window variant="glass" class={className} {...rest}>
  <TitleBar {title} {controls} {onMinimize} {onMaximize} {onClose} />
  <WindowBody {hasSpace}>
    {@render children?.()}
  </WindowBody>
</Window>
```

- [ ] `registry/svelte/window/DialogBox.svelte`

```svelte
<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import Window from "./Window.svelte";
  import TitleBar from "./TitleBar.svelte";
  import WindowBody from "./WindowBody.svelte";

  type ControlButton = "close" | "help";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    title: string;
    controls?: ControlButton[];
    hasSpace?: boolean;
    onClose?: () => void;
    onHelp?: () => void;
  }

  let {
    title,
    controls = ["close"],
    hasSpace = true,
    onClose,
    onHelp,
    class: className,
    children,
    ...rest
  }: Props = $props();
</script>

<Window role="dialog" class={className} {...rest}>
  <TitleBar {title} {controls} {onClose} {onHelp} />
  <WindowBody {hasSpace}>
    {@render children?.()}
  </WindowBody>
</Window>
```

- [ ] `registry/svelte/window/DialogBox.js.svelte` (JS 버전)

```svelte
<script>
  import Window from "./Window.js.svelte";
  import TitleBar from "./TitleBar.js.svelte";
  import WindowBody from "./WindowBody.js.svelte";

  let {
    title,
    controls = ["close"],
    hasSpace = true,
    onClose,
    onHelp,
    class: className,
    children,
    ...rest
  } = $props();
</script>

<Window role="dialog" class={className} {...rest}>
  <TitleBar {title} {controls} {onClose} {onHelp} />
  <WindowBody {hasSpace}>
    {@render children?.()}
  </WindowBody>
</Window>
```

### Step 6.5: Vue 구현

- [ ] `registry/vue/window/GlassFrame.vue`

```vue
<script setup lang="ts">
import Window from "./Window.vue";
import TitleBar from "./TitleBar.vue";
import WindowBody from "./WindowBody.vue";

type ControlButton = "minimize" | "maximize" | "close";

interface Props {
  title: string;
  controls?: ControlButton[];
  hasSpace?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  controls: () => ["minimize", "maximize", "close"],
  hasSpace: true,
});

const emit = defineEmits<{
  minimize: [];
  maximize: [];
  close: [];
}>();
</script>

<template>
  <Window variant="glass">
    <TitleBar
      :title="props.title"
      :controls="props.controls"
      @minimize="emit('minimize')"
      @maximize="emit('maximize')"
      @close="emit('close')"
    />
    <WindowBody :has-space="props.hasSpace">
      <slot />
    </WindowBody>
  </Window>
</template>
```

- [ ] `registry/vue/window/GlassFrame.js.vue` (JS 버전)

```vue
<script setup>
import Window from "./Window.js.vue";
import TitleBar from "./TitleBar.js.vue";
import WindowBody from "./WindowBody.js.vue";

const props = defineProps({
  title: { type: String, required: true },
  controls: { type: Array, default: () => ["minimize", "maximize", "close"] },
  hasSpace: { type: Boolean, default: true },
});

const emit = defineEmits(["minimize", "maximize", "close"]);
</script>

<template>
  <Window variant="glass">
    <TitleBar
      :title="props.title"
      :controls="props.controls"
      @minimize="emit('minimize')"
      @maximize="emit('maximize')"
      @close="emit('close')"
    />
    <WindowBody :has-space="props.hasSpace">
      <slot />
    </WindowBody>
  </Window>
</template>
```

- [ ] `registry/vue/window/DialogBox.vue`

```vue
<script setup lang="ts">
import Window from "./Window.vue";
import TitleBar from "./TitleBar.vue";
import WindowBody from "./WindowBody.vue";

type ControlButton = "close" | "help";

interface Props {
  title: string;
  controls?: ControlButton[];
  hasSpace?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  controls: () => ["close"],
  hasSpace: true,
});

const emit = defineEmits<{
  close: [];
  help: [];
}>();
</script>

<template>
  <Window role="dialog">
    <TitleBar
      :title="props.title"
      :controls="props.controls"
      @close="emit('close')"
      @help="emit('help')"
    />
    <WindowBody :has-space="props.hasSpace">
      <slot />
    </WindowBody>
  </Window>
</template>
```

- [ ] `registry/vue/window/DialogBox.js.vue` (JS 버전)

```vue
<script setup>
import Window from "./Window.js.vue";
import TitleBar from "./TitleBar.js.vue";
import WindowBody from "./WindowBody.js.vue";

const props = defineProps({
  title: { type: String, required: true },
  controls: { type: Array, default: () => ["close"] },
  hasSpace: { type: Boolean, default: true },
});

const emit = defineEmits(["close", "help"]);
</script>

<template>
  <Window role="dialog">
    <TitleBar
      :title="props.title"
      :controls="props.controls"
      @close="emit('close')"
      @help="emit('help')"
    />
    <WindowBody :has-space="props.hasSpace">
      <slot />
    </WindowBody>
  </Window>
</template>
```

### Step 6.6: 전체 Window 테스트 확인 + 커밋

```bash
pnpm vitest run registry/react/window/__tests__/
pnpm vitest run registry/svelte/window/__tests__/
pnpm vitest run registry/vue/window/__tests__/
git add registry/react/window/ registry/svelte/window/ registry/vue/window/
git commit -m "feat(window): add GlassFrame and DialogBox convenience wrappers (React/Svelte/Vue)"
```

---

## Task 7: Window 전체 테스트

> Window Compound Component의 통합 테스트 및 스냅샷 테스트를 추가한다.

### Step 7.1: React 통합 테스트

- [ ] `registry/react/window/__tests__/integration.test.tsx` 생성

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Window, TitleBar, WindowBody, StatusBar, GlassFrame, DialogBox } from "../index";

describe("Window integration", () => {
  it("renders complete window with all sub-components", () => {
    const { container } = render(
      <Window>
        <TitleBar title="My App" />
        <WindowBody hasSpace>
          <p>Hello World</p>
        </WindowBody>
        <StatusBar fields={["Ready", "100%"]} />
      </Window>
    );

    expect(container.querySelector(".window")).toBeTruthy();
    expect(screen.getByText("My App")).toBeTruthy();
    expect(screen.getByText("Hello World")).toBeTruthy();
    expect(screen.getByText("Ready")).toBeTruthy();
    expect(screen.getByText("100%")).toBeTruthy();
  });

  it("fires control button events", async () => {
    const onClose = vi.fn();
    const onMinimize = vi.fn();

    render(<TitleBar title="Test" onClose={onClose} onMinimize={onMinimize} />);

    await fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalledOnce();

    await fireEvent.click(screen.getByLabelText("Minimize"));
    expect(onMinimize).toHaveBeenCalledOnce();
  });
});

describe("GlassFrame integration", () => {
  it("renders glass window with title and body", () => {
    const { container } = render(
      <GlassFrame title="Aero Window">Glass content</GlassFrame>
    );

    expect(container.querySelector(".window.glass")).toBeTruthy();
    expect(screen.getByText("Aero Window")).toBeTruthy();
    expect(screen.getByText("Glass content")).toBeTruthy();
  });
});

describe("DialogBox integration", () => {
  it("renders dialog with role and close button only", () => {
    const onClose = vi.fn();
    render(
      <DialogBox title="Confirm Delete" onClose={onClose}>
        <p>Are you sure?</p>
      </DialogBox>
    );

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("Confirm Delete")).toBeTruthy();
    expect(screen.getByLabelText("Close")).toBeTruthy();
    expect(screen.queryByLabelText("Minimize")).toBeNull();
  });
});
```

### Step 7.2: 스냅샷 테스트

- [ ] `registry/react/window/__tests__/snapshot.test.tsx` 생성

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Window, TitleBar, WindowBody, StatusBar, GlassFrame, DialogBox } from "../index";

describe("Window snapshots", () => {
  it("default window", () => {
    const { container } = render(
      <Window>
        <TitleBar title="Snapshot Test" />
        <WindowBody>Body content</WindowBody>
        <StatusBar fields={["OK"]} />
      </Window>
    );
    expect(container.innerHTML).toMatchSnapshot();
  });

  it("glass frame", () => {
    const { container } = render(
      <GlassFrame title="Glass Snapshot">Content</GlassFrame>
    );
    expect(container.innerHTML).toMatchSnapshot();
  });

  it("dialog box", () => {
    const { container } = render(
      <DialogBox title="Dialog Snapshot">Content</DialogBox>
    );
    expect(container.innerHTML).toMatchSnapshot();
  });
});
```

### Step 7.3: 테스트 실행 및 커밋

```bash
pnpm vitest run registry/react/window/__tests__/
pnpm vitest run registry/svelte/window/__tests__/
pnpm vitest run registry/vue/window/__tests__/
git add registry/
git commit -m "test(window): add integration and snapshot tests for Window compound component"
```

---

## Task 8: Scrollbar 컴포넌트 -- CSS + JSON + React/Svelte/Vue + 테스트

> 7.css의 scrollbar.css(12.9kB)를 추출하고, 커스텀 스크롤바 래퍼 컴포넌트를 구현한다. Scrollbar는 CSS-only 컴포넌트로, 래퍼가 적용 영역에 스크롤바 스타일 클래스를 부여한다.

### Step 8.1: CSS 추출 + JSON

- [ ] 7.css에서 scrollbar.css 복사

```bash
cp /tmp/7css-extract/package/dist/gui/scrollbar.css /Users/kim/projects/systemcss/registry/css/scrollbar.css
```

- [ ] `registry/components/scrollbar.json` 생성

```json
{
  "name": "scrollbar",
  "displayName": "Scrollbar",
  "description": "Windows 7 스타일 커스텀 스크롤바. 적용 영역에 스크롤바 CSS를 부여하는 래퍼 컴포넌트.",
  "dependencies": [],
  "css": ["css/scrollbar.css"],
  "files": {
    "react": {
      "ts": ["react/scrollbar/scrollbar.tsx"],
      "js": ["react/scrollbar/scrollbar.jsx"]
    },
    "svelte": {
      "ts": ["svelte/scrollbar/Scrollbar.svelte"],
      "js": ["svelte/scrollbar/Scrollbar.js.svelte"]
    },
    "vue": {
      "ts": ["vue/scrollbar/Scrollbar.vue"],
      "js": ["vue/scrollbar/Scrollbar.js.vue"]
    }
  }
}
```

- [ ] `registry/index.json`에 scrollbar 항목 추가

### Step 8.2: 테스트 작성 (TDD - Red)

- [ ] `registry/react/scrollbar/__tests__/scrollbar.test.tsx`

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Scrollbar } from "../scrollbar";

describe("Scrollbar", () => {
  it("renders a scrollable container with win7 scrollbar class", () => {
    const { container } = render(
      <Scrollbar>
        <p>Scrollable content</p>
      </Scrollbar>
    );
    const el = container.firstElementChild;
    expect(el?.classList.contains("win7-scrollbar")).toBe(true);
  });

  it("applies custom height via style prop", () => {
    const { container } = render(
      <Scrollbar style={{ height: "200px" }}>content</Scrollbar>
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.height).toBe("200px");
  });

  it("supports horizontal scrolling via direction prop", () => {
    const { container } = render(
      <Scrollbar direction="horizontal">content</Scrollbar>
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.overflowX).toBe("auto");
    expect(el.style.overflowY).toBe("hidden");
  });

  it("defaults to vertical scrolling", () => {
    const { container } = render(<Scrollbar>content</Scrollbar>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.overflowY).toBe("auto");
  });

  it("supports both directions", () => {
    const { container } = render(
      <Scrollbar direction="both">content</Scrollbar>
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.overflow).toBe("auto");
  });

  it("merges custom className", () => {
    const { container } = render(
      <Scrollbar className="my-scroll">content</Scrollbar>
    );
    const el = container.firstElementChild;
    expect(el?.classList.contains("my-scroll")).toBe(true);
  });
});
```

### Step 8.3: React 구현

- [ ] `registry/react/scrollbar/scrollbar.tsx`

```tsx
import React from "react";
import styles from "../../css/scrollbar.module.css";

type ScrollDirection = "vertical" | "horizontal" | "both";

interface ScrollbarProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: ScrollDirection;
}

function getOverflowStyle(direction: ScrollDirection): React.CSSProperties {
  switch (direction) {
    case "horizontal":
      return { overflowX: "auto", overflowY: "hidden" };
    case "both":
      return { overflow: "auto" };
    case "vertical":
    default:
      return { overflowY: "auto" };
  }
}

export function Scrollbar({
  direction = "vertical",
  className,
  style,
  children,
  ...props
}: ScrollbarProps) {
  const overflowStyle = getOverflowStyle(direction);

  return (
    <div
      className={`${styles["win7-scrollbar"]} ${className ?? ""}`.trim()}
      style={{ ...overflowStyle, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
```

- [ ] `registry/react/scrollbar/scrollbar.jsx` (JS 버전)

```jsx
import React from "react";
import styles from "../../css/scrollbar.module.css";

function getOverflowStyle(direction) {
  switch (direction) {
    case "horizontal":
      return { overflowX: "auto", overflowY: "hidden" };
    case "both":
      return { overflow: "auto" };
    case "vertical":
    default:
      return { overflowY: "auto" };
  }
}

export function Scrollbar({
  direction = "vertical",
  className,
  style,
  children,
  ...props
}) {
  const overflowStyle = getOverflowStyle(direction);

  return (
    <div
      className={`${styles["win7-scrollbar"]} ${className ?? ""}`.trim()}
      style={{ ...overflowStyle, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
```

### Step 8.4: Svelte 구현

- [ ] `registry/svelte/scrollbar/Scrollbar.svelte`

```svelte
<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type ScrollDirection = "vertical" | "horizontal" | "both";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    direction?: ScrollDirection;
  }

  let { direction = "vertical", class: className, style, children, ...rest }: Props = $props();

  const overflowStyle = $derived(
    direction === "horizontal"
      ? "overflow-x: auto; overflow-y: hidden;"
      : direction === "both"
        ? "overflow: auto;"
        : "overflow-y: auto;"
  );

  const mergedStyle = $derived(
    `${overflowStyle} ${style ?? ""}`
  );
</script>

<div class="win7-scrollbar {className ?? ''}" style={mergedStyle} {...rest}>
  {@render children?.()}
</div>

<style>
  /* inject-css.ts: scrollbar.css */
</style>
```

- [ ] `registry/svelte/scrollbar/Scrollbar.js.svelte` (JS 버전)

```svelte
<script>
  let { direction = "vertical", class: className, style, children, ...rest } = $props();

  const overflowStyle = $derived(
    direction === "horizontal"
      ? "overflow-x: auto; overflow-y: hidden;"
      : direction === "both"
        ? "overflow: auto;"
        : "overflow-y: auto;"
  );

  const mergedStyle = $derived(`${overflowStyle} ${style ?? ""}`);
</script>

<div class="win7-scrollbar {className ?? ''}" style={mergedStyle} {...rest}>
  {@render children?.()}
</div>

<style>
  /* inject-css.ts: scrollbar.css */
</style>
```

### Step 8.5: Vue 구현

- [ ] `registry/vue/scrollbar/Scrollbar.vue`

```vue
<script setup lang="ts">
import { computed } from "vue";

type ScrollDirection = "vertical" | "horizontal" | "both";

interface Props {
  direction?: ScrollDirection;
}

const { direction = "vertical" } = defineProps<Props>();

const overflowStyle = computed(() => {
  switch (direction) {
    case "horizontal":
      return { overflowX: "auto" as const, overflowY: "hidden" as const };
    case "both":
      return { overflow: "auto" as const };
    default:
      return { overflowY: "auto" as const };
  }
});
</script>

<template>
  <div class="win7-scrollbar" :style="overflowStyle">
    <slot />
  </div>
</template>

<style scoped>
  /* inject-css.ts: scrollbar.css */
</style>
```

- [ ] `registry/vue/scrollbar/Scrollbar.js.vue` (JS 버전)

```vue
<script setup>
import { computed } from "vue";

const props = defineProps({
  direction: { type: String, default: "vertical" },
});

const overflowStyle = computed(() => {
  switch (props.direction) {
    case "horizontal":
      return { overflowX: "auto", overflowY: "hidden" };
    case "both":
      return { overflow: "auto" };
    default:
      return { overflowY: "auto" };
  }
});
</script>

<template>
  <div class="win7-scrollbar" :style="overflowStyle">
    <slot />
  </div>
</template>

<style scoped>
  /* inject-css.ts: scrollbar.css */
</style>
```

### Step 8.6: inject-css.ts 실행 + 테스트 + 커밋

```bash
pnpm inject-css -- --component scrollbar
pnpm vitest run registry/react/scrollbar/__tests__/
git add registry/css/scrollbar.css registry/components/scrollbar.json registry/react/scrollbar/ registry/svelte/scrollbar/ registry/vue/scrollbar/
git commit -m "feat(scrollbar): implement Scrollbar component with CSS extraction (React/Svelte/Vue TS/JS)"
```

---

## Task 9: Balloon 컴포넌트 -- CSS + JSON + React/Svelte/Vue + 테스트

> Balloon은 tooltip 기반 컴포넌트로, 위치 변형(top/bottom)과 화살표 정렬(left/right)을 Props로 제어한다. CSS는 1.13kB로 가볍다.

### Step 9.1: CSS 생성 + JSON

- [ ] `registry/css/balloon.css` 생성 (7.css 원본 기반)

```css
[role=tooltip]{background:#ffffe1;border:1px solid #000;border-radius:2px;box-shadow:2px 2px 5px #0003;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;max-width:250px;padding:8px 10px;position:absolute}[role=tooltip]:after,[role=tooltip]:before{border:8px solid transparent;content:"";left:20px;position:absolute}[role=tooltip]:before{border-bottom-color:#000;top:-17px}[role=tooltip]:after{border-bottom-color:#ffffe1;top:-16px}[role=tooltip].is-top:before{border-bottom-color:transparent;border-top-color:#000;bottom:-17px;top:auto}[role=tooltip].is-top:after{border-bottom-color:transparent;border-top-color:#ffffe1;bottom:-16px;top:auto}[role=tooltip].is-right:after,[role=tooltip].is-right:before{left:auto;right:20px}
```

- [ ] `registry/components/balloon.json` 생성

```json
{
  "name": "balloon",
  "displayName": "Balloon",
  "description": "Windows 7 스타일 말풍선 툴팁. 위치 변형(top/bottom) 및 화살표 정렬(left/right) 지원.",
  "dependencies": [],
  "css": ["css/balloon.css"],
  "files": {
    "react": {
      "ts": ["react/balloon/balloon.tsx"],
      "js": ["react/balloon/balloon.jsx"]
    },
    "svelte": {
      "ts": ["svelte/balloon/Balloon.svelte"],
      "js": ["svelte/balloon/Balloon.js.svelte"]
    },
    "vue": {
      "ts": ["vue/balloon/Balloon.vue"],
      "js": ["vue/balloon/Balloon.js.vue"]
    }
  }
}
```

### Step 9.2: 테스트 작성 (TDD - Red)

- [ ] `registry/react/balloon/__tests__/balloon.test.tsx`

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Balloon } from "../balloon";

describe("Balloon", () => {
  it("renders with role=tooltip", () => {
    render(<Balloon>Tooltip text</Balloon>);
    expect(screen.getByRole("tooltip")).toBeTruthy();
  });

  it("renders children content", () => {
    render(<Balloon>Hello Balloon</Balloon>);
    expect(screen.getByText("Hello Balloon")).toBeTruthy();
  });

  it("defaults to bottom position (no extra class)", () => {
    const { container } = render(<Balloon>text</Balloon>);
    const el = container.querySelector('[role="tooltip"]');
    expect(el?.classList.contains("is-top")).toBe(false);
    expect(el?.classList.contains("is-right")).toBe(false);
  });

  it("applies is-top class for top position", () => {
    const { container } = render(<Balloon position="top">text</Balloon>);
    const el = container.querySelector('[role="tooltip"]');
    expect(el?.classList.contains("is-top")).toBe(true);
  });

  it("applies is-right class for right-aligned arrow", () => {
    const { container } = render(<Balloon arrowAlign="right">text</Balloon>);
    const el = container.querySelector('[role="tooltip"]');
    expect(el?.classList.contains("is-right")).toBe(true);
  });

  it("combines position and arrowAlign classes", () => {
    const { container } = render(
      <Balloon position="top" arrowAlign="right">text</Balloon>
    );
    const el = container.querySelector('[role="tooltip"]');
    expect(el?.classList.contains("is-top")).toBe(true);
    expect(el?.classList.contains("is-right")).toBe(true);
  });

  it("merges custom className", () => {
    const { container } = render(
      <Balloon className="custom-tip">text</Balloon>
    );
    const el = container.querySelector('[role="tooltip"]');
    expect(el?.classList.contains("custom-tip")).toBe(true);
  });
});
```

### Step 9.3: React 구현

- [ ] `registry/react/balloon/balloon.tsx`

```tsx
import React from "react";

interface BalloonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 말풍선 화살표 방향: bottom(화살표 위 = 기본), top(화살표 아래) */
  position?: "top" | "bottom";
  /** 화살표 수평 정렬 */
  arrowAlign?: "left" | "right";
}

export function Balloon({
  position = "bottom",
  arrowAlign = "left",
  className,
  children,
  ...props
}: BalloonProps) {
  const classNames = [
    position === "top" ? "is-top" : "",
    arrowAlign === "right" ? "is-right" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div role="tooltip" className={classNames || undefined} {...props}>
      {children}
    </div>
  );
}
```

- [ ] `registry/react/balloon/balloon.jsx` (JS 버전)

```jsx
import React from "react";

export function Balloon({
  position = "bottom",
  arrowAlign = "left",
  className,
  children,
  ...props
}) {
  const classNames = [
    position === "top" ? "is-top" : "",
    arrowAlign === "right" ? "is-right" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div role="tooltip" className={classNames || undefined} {...props}>
      {children}
    </div>
  );
}
```

### Step 9.4: Svelte 구현

- [ ] `registry/svelte/balloon/Balloon.svelte`

```svelte
<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    position?: "top" | "bottom";
    arrowAlign?: "left" | "right";
  }

  let {
    position = "bottom",
    arrowAlign = "left",
    class: className,
    children,
    ...rest
  }: Props = $props();

  const positionClass = $derived(position === "top" ? "is-top" : "");
  const alignClass = $derived(arrowAlign === "right" ? "is-right" : "");
</script>

<div role="tooltip" class="{positionClass} {alignClass} {className ?? ''}" {...rest}>
  {@render children?.()}
</div>

<style>
  /* inject-css.ts: balloon.css */
</style>
```

- [ ] `registry/svelte/balloon/Balloon.js.svelte` (JS 버전)

```svelte
<script>
  let {
    position = "bottom",
    arrowAlign = "left",
    class: className,
    children,
    ...rest
  } = $props();

  const positionClass = $derived(position === "top" ? "is-top" : "");
  const alignClass = $derived(arrowAlign === "right" ? "is-right" : "");
</script>

<div role="tooltip" class="{positionClass} {alignClass} {className ?? ''}" {...rest}>
  {@render children?.()}
</div>

<style>
  /* inject-css.ts: balloon.css */
</style>
```

### Step 9.5: Vue 구현

- [ ] `registry/vue/balloon/Balloon.vue`

```vue
<script setup lang="ts">
interface Props {
  position?: "top" | "bottom";
  arrowAlign?: "left" | "right";
}

const { position = "bottom", arrowAlign = "left" } = defineProps<Props>();
</script>

<template>
  <div
    role="tooltip"
    :class="[
      position === 'top' && 'is-top',
      arrowAlign === 'right' && 'is-right',
    ]"
  >
    <slot />
  </div>
</template>

<style scoped>
  /* inject-css.ts: balloon.css */
</style>
```

- [ ] `registry/vue/balloon/Balloon.js.vue` (JS 버전)

```vue
<script setup>
const props = defineProps({
  position: { type: String, default: "bottom" },
  arrowAlign: { type: String, default: "left" },
});
</script>

<template>
  <div
    role="tooltip"
    :class="[
      props.position === 'top' && 'is-top',
      props.arrowAlign === 'right' && 'is-right',
    ]"
  >
    <slot />
  </div>
</template>

<style scoped>
  /* inject-css.ts: balloon.css */
</style>
```

### Step 9.6: inject-css.ts 실행 + 테스트 + 커밋

```bash
pnpm inject-css -- --component balloon
pnpm vitest run registry/react/balloon/__tests__/
git add registry/css/balloon.css registry/components/balloon.json registry/react/balloon/ registry/svelte/balloon/ registry/vue/balloon/
git commit -m "feat(balloon): implement Balloon tooltip component with position variants (React/Svelte/Vue TS/JS)"
```

---

## Task 10: Typography 컴포넌트 -- CSS + JSON + React/Svelte/Vue + 테스트

> Typography는 기본 텍스트 스타일 유틸리티 컴포넌트이다. Link, Instruction, Header 등의 텍스트 스타일을 제공한다. 515B CSS로 매우 가볍다.

### Step 10.1: CSS 생성 + JSON

- [ ] `registry/css/typography.css` 생성 (7.css 원본 기반)

```css
a{color:#06c;text-decoration:none}a:focus-visible{outline:1px dotted #06c}a:focus,a:hover{color:#39f;text-decoration:underline}.instruction{color:#000;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;font-weight:400;margin:0 0 20px}.instruction-primary{color:#039;font-size:12pt}.header{font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;font-weight:400}.header-document{color:#000;font-family:Calibri,Noto Sans,sans-serif;font-size:17pt}.header-group{color:#039;font-size:11pt}
```

- [ ] `registry/components/typography.json` 생성

```json
{
  "name": "typography",
  "displayName": "Typography",
  "description": "Windows 7 스타일 기본 텍스트 스타일. Link, Instruction, Header 컴포넌트 제공.",
  "dependencies": [],
  "css": ["css/typography.css"],
  "files": {
    "react": {
      "ts": ["react/typography/typography.tsx"],
      "js": ["react/typography/typography.jsx"]
    },
    "svelte": {
      "ts": ["svelte/typography/Typography.svelte"],
      "js": ["svelte/typography/Typography.js.svelte"]
    },
    "vue": {
      "ts": ["vue/typography/Typography.vue"],
      "js": ["vue/typography/Typography.js.vue"]
    }
  }
}
```

### Step 10.2: 테스트 작성 (TDD - Red)

- [ ] `registry/react/typography/__tests__/typography.test.tsx`

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Instruction, InstructionPrimary, HeaderDocument, HeaderGroup } from "../typography";

describe("Instruction", () => {
  it("renders with instruction class", () => {
    const { container } = render(<Instruction>Follow these steps</Instruction>);
    const el = container.querySelector(".instruction");
    expect(el).toBeTruthy();
    expect(el?.textContent).toBe("Follow these steps");
  });
});

describe("InstructionPrimary", () => {
  it("renders with instruction and instruction-primary classes", () => {
    const { container } = render(
      <InstructionPrimary>Main instruction</InstructionPrimary>
    );
    const el = container.querySelector(".instruction.instruction-primary");
    expect(el).toBeTruthy();
  });
});

describe("HeaderDocument", () => {
  it("renders with header and header-document classes", () => {
    const { container } = render(
      <HeaderDocument>Document Title</HeaderDocument>
    );
    const el = container.querySelector(".header.header-document");
    expect(el).toBeTruthy();
    expect(el?.textContent).toBe("Document Title");
  });
});

describe("HeaderGroup", () => {
  it("renders with header and header-group classes", () => {
    const { container } = render(
      <HeaderGroup>Group Title</HeaderGroup>
    );
    const el = container.querySelector(".header.header-group");
    expect(el).toBeTruthy();
  });
});
```

### Step 10.3: React 구현

- [ ] `registry/react/typography/typography.tsx`

```tsx
import React from "react";

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

export function Instruction({
  as: Tag = "p",
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Tag className={`instruction ${className ?? ""}`.trim()} {...props}>
      {children}
    </Tag>
  );
}

export function InstructionPrimary({
  as: Tag = "p",
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Tag
      className={`instruction instruction-primary ${className ?? ""}`.trim()}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function HeaderDocument({
  as: Tag = "h1",
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Tag
      className={`header header-document ${className ?? ""}`.trim()}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function HeaderGroup({
  as: Tag = "h2",
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Tag
      className={`header header-group ${className ?? ""}`.trim()}
      {...props}
    >
      {children}
    </Tag>
  );
}
```

- [ ] `registry/react/typography/typography.jsx` (JS 버전)

```jsx
import React from "react";

export function Instruction({
  as: Tag = "p",
  className,
  children,
  ...props
}) {
  return (
    <Tag className={`instruction ${className ?? ""}`.trim()} {...props}>
      {children}
    </Tag>
  );
}

export function InstructionPrimary({
  as: Tag = "p",
  className,
  children,
  ...props
}) {
  return (
    <Tag
      className={`instruction instruction-primary ${className ?? ""}`.trim()}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function HeaderDocument({
  as: Tag = "h1",
  className,
  children,
  ...props
}) {
  return (
    <Tag
      className={`header header-document ${className ?? ""}`.trim()}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function HeaderGroup({
  as: Tag = "h2",
  className,
  children,
  ...props
}) {
  return (
    <Tag
      className={`header header-group ${className ?? ""}`.trim()}
      {...props}
    >
      {children}
    </Tag>
  );
}
```

### Step 10.4: Svelte 구현

- [ ] `registry/svelte/typography/Typography.svelte` (variant prop으로 다형성 지원)

```svelte
<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type Variant = "instruction" | "instruction-primary" | "header-document" | "header-group";

  interface Props extends HTMLAttributes<HTMLElement> {
    variant: Variant;
    as?: string;
  }

  let { variant, as: tag, class: className, children, ...rest }: Props = $props();

  const variantClasses: Record<Variant, string> = {
    "instruction": "instruction",
    "instruction-primary": "instruction instruction-primary",
    "header-document": "header header-document",
    "header-group": "header header-group",
  };

  const defaultTags: Record<Variant, string> = {
    "instruction": "p",
    "instruction-primary": "p",
    "header-document": "h1",
    "header-group": "h2",
  };

  const resolvedTag = $derived(tag || defaultTags[variant]);
  const resolvedClass = $derived(`${variantClasses[variant]} ${className ?? ""}`.trim());
</script>

<svelte:element this={resolvedTag} class={resolvedClass} {...rest}>
  {@render children?.()}
</svelte:element>

<style>
  /* inject-css.ts: typography.css */
</style>
```

- [ ] `registry/svelte/typography/Typography.js.svelte` (JS 버전)

```svelte
<script>
  let { variant, as: tag, class: className, children, ...rest } = $props();

  const variantClasses = {
    "instruction": "instruction",
    "instruction-primary": "instruction instruction-primary",
    "header-document": "header header-document",
    "header-group": "header header-group",
  };

  const defaultTags = {
    "instruction": "p",
    "instruction-primary": "p",
    "header-document": "h1",
    "header-group": "h2",
  };

  const resolvedTag = $derived(tag || defaultTags[variant]);
  const resolvedClass = $derived(`${variantClasses[variant]} ${className ?? ""}`.trim());
</script>

<svelte:element this={resolvedTag} class={resolvedClass} {...rest}>
  {@render children?.()}
</svelte:element>

<style>
  /* inject-css.ts: typography.css */
</style>
```

### Step 10.5: Vue 구현

- [ ] `registry/vue/typography/Typography.vue`

```vue
<script setup lang="ts">
import { computed } from "vue";

type Variant = "instruction" | "instruction-primary" | "header-document" | "header-group";

interface Props {
  variant: Variant;
  as?: string;
}

const props = withDefaults(defineProps<Props>(), {
  as: undefined,
});

const variantClasses: Record<Variant, string> = {
  "instruction": "instruction",
  "instruction-primary": "instruction instruction-primary",
  "header-document": "header header-document",
  "header-group": "header header-group",
};

const defaultTags: Record<Variant, string> = {
  "instruction": "p",
  "instruction-primary": "p",
  "header-document": "h1",
  "header-group": "h2",
};

const resolvedTag = computed(() => props.as || defaultTags[props.variant]);
const resolvedClass = computed(() => variantClasses[props.variant]);
</script>

<template>
  <component :is="resolvedTag" :class="resolvedClass">
    <slot />
  </component>
</template>

<style scoped>
  /* inject-css.ts: typography.css */
</style>
```

- [ ] `registry/vue/typography/Typography.js.vue` (JS 버전)

```vue
<script setup>
import { computed } from "vue";

const props = defineProps({
  variant: { type: String, required: true },
  as: { type: String, default: undefined },
});

const variantClasses = {
  "instruction": "instruction",
  "instruction-primary": "instruction instruction-primary",
  "header-document": "header header-document",
  "header-group": "header header-group",
};

const defaultTags = {
  "instruction": "p",
  "instruction-primary": "p",
  "header-document": "h1",
  "header-group": "h2",
};

const resolvedTag = computed(() => props.as || defaultTags[props.variant]);
const resolvedClass = computed(() => variantClasses[props.variant]);
</script>

<template>
  <component :is="resolvedTag" :class="resolvedClass">
    <slot />
  </component>
</template>

<style scoped>
  /* inject-css.ts: typography.css */
</style>
```

### Step 10.6: inject-css.ts 실행 + 테스트 + 커밋

```bash
pnpm inject-css -- --component typography
pnpm vitest run registry/react/typography/__tests__/
git add registry/css/typography.css registry/components/typography.json registry/react/typography/ registry/svelte/typography/ registry/vue/typography/
git commit -m "feat(typography): implement Typography text style components (React/Svelte/Vue TS/JS)"
```

---

## Task 11: 전체 21개 컴포넌트 통합 테스트

> Batch 1~5의 모든 컴포넌트가 registry에 올바르게 등록되어 있고, CLI가 정상적으로 설치/제거할 수 있는지 검증한다.

### Step 11.1: Registry 정합성 테스트

- [ ] `scripts/__tests__/registry-integrity.test.ts` 생성

```ts
import { describe, it, expect } from "vitest";
import fs from "fs-extra";
import path from "path";

const REGISTRY_ROOT = path.resolve(__dirname, "../../registry");

// 전체 21개 컴포넌트 목록
const ALL_COMPONENTS = [
  // Batch 1
  "button", "textbox", "checkbox", "radiobutton", "groupbox",
  // Batch 2
  "dropdown", "combobox", "listbox", "listview", "searchbox",
  // Batch 3
  "tabs", "menu", "menubar", "collapse", "progressbar",
  // Batch 4
  "slider", "spinner", "treeview",
  // Batch 5
  "window", "scrollbar", "balloon", "typography",
];

const FRAMEWORKS = ["react", "svelte", "vue"];

describe("Registry integrity", () => {
  it("index.json contains all 21 components", async () => {
    const index = await fs.readJson(path.join(REGISTRY_ROOT, "index.json"));
    const names = index.components.map((c: { name: string }) => c.name);
    for (const comp of ALL_COMPONENTS) {
      expect(names).toContain(comp);
    }
    expect(names.length).toBe(21);
  });

  it("each component has a valid JSON metadata file", async () => {
    for (const comp of ALL_COMPONENTS) {
      const jsonPath = path.join(REGISTRY_ROOT, "components", `${comp}.json`);
      expect(await fs.pathExists(jsonPath)).toBe(true);
      const meta = await fs.readJson(jsonPath);
      expect(meta.name).toBe(comp);
      expect(meta.css).toBeDefined();
      expect(meta.files).toBeDefined();
    }
  });

  it("all CSS files referenced in metadata exist", async () => {
    for (const comp of ALL_COMPONENTS) {
      const meta = await fs.readJson(
        path.join(REGISTRY_ROOT, "components", `${comp}.json`)
      );
      for (const cssFile of meta.css) {
        const cssPath = path.join(REGISTRY_ROOT, cssFile);
        expect(await fs.pathExists(cssPath)).toBe(true);
      }
    }
  });

  it("all framework source files referenced in metadata exist", async () => {
    for (const comp of ALL_COMPONENTS) {
      const meta = await fs.readJson(
        path.join(REGISTRY_ROOT, "components", `${comp}.json`)
      );
      for (const framework of FRAMEWORKS) {
        if (!meta.files[framework]) continue;
        for (const variant of ["ts", "js"]) {
          if (!meta.files[framework][variant]) continue;
          for (const file of meta.files[framework][variant]) {
            const filePath = path.join(REGISTRY_ROOT, file);
            expect(
              await fs.pathExists(filePath),
              `Missing: ${filePath}`
            ).toBe(true);
          }
        }
      }
    }
  });

  it("base.css exists", async () => {
    const baseCssPath = path.join(REGISTRY_ROOT, "css", "base.css");
    expect(await fs.pathExists(baseCssPath)).toBe(true);
  });
});
```

### Step 11.2: CLI E2E 테스트 (전체 컴포넌트 순회)

- [ ] `packages/cli/__tests__/e2e-full.test.ts` 생성

```ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import os from "os";
import { execFileSync } from "child_process";

const CLI_BIN = path.resolve(__dirname, "../dist/index.js");

describe("CLI E2E - full component cycle", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "win7ui-e2e-"));
    // 가짜 package.json 생성 (React 프로젝트로 감지)
    await fs.writeJson(path.join(tmpDir, "package.json"), {
      name: "test-project",
      dependencies: { react: "^18.0.0", "react-dom": "^18.0.0" },
    });
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it("init creates config file", () => {
    execFileSync("node", [CLI_BIN, "init", "--yes"], { cwd: tmpDir });
    const configPath = path.join(tmpDir, "win7ui.config.json");
    expect(fs.existsSync(configPath)).toBe(true);
    const config = fs.readJsonSync(configPath);
    expect(config.framework).toBe("react");
  });

  it("add installs a component with all expected files", () => {
    execFileSync("node", [CLI_BIN, "init", "--yes"], { cwd: tmpDir });
    execFileSync("node", [CLI_BIN, "add", "button"], { cwd: tmpDir });

    const componentDir = path.join(tmpDir, "src/components/win7ui");
    expect(fs.existsSync(path.join(componentDir, "css/base.css"))).toBe(true);
    expect(fs.existsSync(path.join(componentDir, "css/button.module.css"))).toBe(true);
  });

  it("add window installs compound component files", () => {
    execFileSync("node", [CLI_BIN, "init", "--yes"], { cwd: tmpDir });
    execFileSync("node", [CLI_BIN, "add", "window"], { cwd: tmpDir });

    const windowDir = path.join(tmpDir, "src/components/win7ui");
    // TypeScript 파일들 존재 확인
    expect(fs.existsSync(path.join(windowDir, "window.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(windowDir, "title-bar.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(windowDir, "window-body.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(windowDir, "status-bar.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(windowDir, "glass-frame.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(windowDir, "dialog-box.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(windowDir, "css/window.module.css"))).toBe(true);
  });

  it("remove deletes component files", () => {
    execFileSync("node", [CLI_BIN, "init", "--yes"], { cwd: tmpDir });
    execFileSync("node", [CLI_BIN, "add", "button"], { cwd: tmpDir });
    execFileSync("node", [CLI_BIN, "remove", "button", "--force"], { cwd: tmpDir });

    const componentDir = path.join(tmpDir, "src/components/win7ui");
    expect(fs.existsSync(path.join(componentDir, "css/button.module.css"))).toBe(false);
  });

  it("list shows all 21 components", () => {
    execFileSync("node", [CLI_BIN, "init", "--yes"], { cwd: tmpDir });
    const output = execFileSync("node", [CLI_BIN, "list"], { cwd: tmpDir }).toString();
    expect(output).toContain("window");
    expect(output).toContain("scrollbar");
    expect(output).toContain("balloon");
    expect(output).toContain("typography");
    expect(output).toContain("button");
  });
});
```

### Step 11.3: build-registry.ts 실행으로 최종 검증

```bash
pnpm build-registry
pnpm vitest run scripts/__tests__/registry-integrity.test.ts
pnpm vitest run packages/cli/__tests__/e2e-full.test.ts
```

### Step 11.4: 커밋

```bash
git add scripts/__tests__/registry-integrity.test.ts packages/cli/__tests__/e2e-full.test.ts
git commit -m "test: add registry integrity and CLI E2E tests for all 21 components"
```

---

## Task 12: 문서 사이트 기본 구조

> 문서 사이트의 디렉토리 구조와 기본 페이지를 생성한다. 컴포넌트별 사용 예제와 Props 레퍼런스를 포함.

### Step 12.1: 문서 디렉토리 구조 생성

```bash
mkdir -p docs/site/{public,src/{pages/{components,guides},layouts,components}}
```

- [ ] 기술 스택: Astro (정적 사이트 생성) + 7.css (문서 자체가 Windows 7 UI)

### Step 12.2: docs/site/package.json

- [ ] `docs/site/package.json` 생성

```json
{
  "name": "win7ui-docs",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "7.css": "^0.21.1"
  }
}
```

### Step 12.3: docs/site/astro.config.mjs

- [ ] `docs/site/astro.config.mjs` 생성

```js
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://win7ui.dev",
  outDir: "./dist",
});
```

### Step 12.4: 기본 레이아웃

- [ ] `docs/site/src/layouts/BaseLayout.astro` 생성

```astro
---
interface Props {
  title: string;
}

const { title } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} | win7ui</title>
    <link rel="stylesheet" href="https://unpkg.com/7.css@0.21.1/dist/7.css" />
    <style>
      body {
        font-family: "Segoe UI", sans-serif;
        background: #f0f0f0;
        margin: 0;
        padding: 20px;
      }
      .docs-layout {
        display: flex;
        gap: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }
      .docs-sidebar {
        width: 240px;
        flex-shrink: 0;
      }
      .docs-content {
        flex: 1;
        min-width: 0;
      }
    </style>
  </head>
  <body>
    <div class="docs-layout">
      <nav class="docs-sidebar">
        <div class="window">
          <div class="title-bar">
            <div class="title-bar-text">win7ui</div>
          </div>
          <div class="window-body">
            <ul class="tree-view">
              <li><a href="/">Home</a></li>
              <li><a href="/guides/getting-started">Getting Started</a></li>
              <li>
                Components
                <ul>
                  <li><a href="/components/button">Button</a></li>
                  <li><a href="/components/textbox">Textbox</a></li>
                  <li><a href="/components/checkbox">Checkbox</a></li>
                  <li><a href="/components/window">Window</a></li>
                  <li><a href="/components/scrollbar">Scrollbar</a></li>
                  <li><a href="/components/balloon">Balloon</a></li>
                  <li><a href="/components/typography">Typography</a></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <main class="docs-content">
        <div class="window">
          <div class="title-bar">
            <div class="title-bar-text">{title}</div>
          </div>
          <div class="window-body has-space">
            <slot />
          </div>
        </div>
      </main>
    </div>
  </body>
</html>
```

### Step 12.5: 주요 페이지 생성

- [ ] `docs/site/src/pages/index.astro` -- 홈페이지

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
---

<BaseLayout title="Home">
  <h1 class="header header-document">win7ui</h1>
  <p class="instruction">
    Windows 7 UI component library for React, Svelte, and Vue.
  </p>
  <p class="instruction">
    Install components directly into your project source code, shadcn/ui style.
  </p>

  <h2 class="header header-group">Quick Start</h2>
  <pre><code>npx win7ui init
npx win7ui add button window</code></pre>

  <h2 class="header header-group">Features</h2>
  <ul>
    <li>21 Windows 7-styled components</li>
    <li>React 18+, Svelte 5, Vue 3 support</li>
    <li>TypeScript and JavaScript variants</li>
    <li>Based on 7.css for authentic Windows 7 look</li>
    <li>CLI installs only what you need</li>
  </ul>
</BaseLayout>
```

- [ ] `docs/site/src/pages/guides/getting-started.astro` -- Getting Started

```astro
---
import BaseLayout from "../../layouts/BaseLayout.astro";
---

<BaseLayout title="Getting Started">
  <h1 class="header header-document">Getting Started</h1>

  <h2 class="header header-group">1. Initialize</h2>
  <p class="instruction">Run in your project root:</p>
  <pre><code>npx win7ui init</code></pre>
  <p class="instruction">Auto-detects your framework and creates <code>win7ui.config.json</code>.</p>

  <h2 class="header header-group">2. Add Components</h2>
  <pre><code>npx win7ui add button window tabs</code></pre>
  <p class="instruction">Component source code is copied into your project.</p>

  <h2 class="header header-group">3. Use</h2>
  <pre><code>import &lbrace; Button &rbrace; from "./components/win7ui";</code></pre>

  <h2 class="header header-group">4. List / Remove</h2>
  <pre><code>npx win7ui list        # List all components
npx win7ui remove tabs  # Remove a component</code></pre>
</BaseLayout>
```

- [ ] `docs/site/src/pages/components/window.astro` -- Window 컴포넌트 문서 (대표 예시)

```astro
---
import BaseLayout from "../../layouts/BaseLayout.astro";
---

<BaseLayout title="Window">
  <h1 class="header header-document">Window</h1>
  <p class="instruction">
    Windows 7 window frame. Compose with TitleBar, WindowBody, StatusBar, GlassFrame, and DialogBox.
  </p>

  <h2 class="header header-group">Installation</h2>
  <pre><code>npx win7ui add window</code></pre>

  <h2 class="header header-group">Basic Usage</h2>
  <div class="window" style="max-width: 400px;">
    <div class="title-bar">
      <div class="title-bar-text">My Window</div>
      <div class="title-bar-controls">
        <button aria-label="Minimize"></button>
        <button aria-label="Maximize"></button>
        <button aria-label="Close"></button>
      </div>
    </div>
    <div class="window-body has-space">
      <p>Window content goes here.</p>
    </div>
    <div class="status-bar">
      <p class="status-bar-field">Ready</p>
      <p class="status-bar-field">100%</p>
    </div>
  </div>

  <h2 class="header header-group">Glass Frame</h2>
  <div class="window glass" style="max-width: 400px;">
    <div class="title-bar">
      <div class="title-bar-text">Aero Glass</div>
      <div class="title-bar-controls">
        <button aria-label="Minimize"></button>
        <button aria-label="Maximize"></button>
        <button aria-label="Close"></button>
      </div>
    </div>
    <div class="window-body has-space">
      <p>Glass frame content.</p>
    </div>
  </div>

  <h2 class="header header-group">Dialog Box</h2>
  <div class="window" role="dialog" style="max-width: 300px;">
    <div class="title-bar">
      <div class="title-bar-text">Confirm</div>
      <div class="title-bar-controls">
        <button aria-label="Close"></button>
      </div>
    </div>
    <div class="window-body has-space">
      <p>Are you sure you want to continue?</p>
      <div style="display: flex; gap: 6px; justify-content: flex-end; margin-top: 16px;">
        <button>OK</button>
        <button>Cancel</button>
      </div>
    </div>
  </div>

  <h2 class="header header-group">Props</h2>

  <h3>Window</h3>
  <table>
    <thead><tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td>variant</td><td>"default" | "glass"</td><td>"default"</td><td>Window frame style</td></tr>
      <tr><td>role</td><td>string</td><td>-</td><td>ARIA role attribute</td></tr>
    </tbody>
  </table>

  <h3>TitleBar</h3>
  <table>
    <thead><tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td>title</td><td>string</td><td>required</td><td>Title bar text</td></tr>
      <tr><td>controls</td><td>Array</td><td>["minimize","maximize","close"]</td><td>Control buttons to display</td></tr>
      <tr><td>icon</td><td>string</td><td>-</td><td>Icon image src</td></tr>
    </tbody>
  </table>

  <h3>WindowBody</h3>
  <table>
    <thead><tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td>hasSpace</td><td>boolean</td><td>false</td><td>Add inner padding</td></tr>
    </tbody>
  </table>

  <h3>StatusBar</h3>
  <table>
    <thead><tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td>fields</td><td>string[]</td><td>required</td><td>Status bar field texts</td></tr>
    </tbody>
  </table>
</BaseLayout>
```

### Step 12.6: pnpm-workspace.yaml에 docs 추가

- [ ] `pnpm-workspace.yaml`에 `docs/site` 추가

```yaml
packages:
  - "packages/*"
  - "docs/site"
```

### Step 12.7: 커밋

```bash
git add docs/site/ pnpm-workspace.yaml
git commit -m "docs: create documentation site basic structure with Astro

Includes base layout, home page, getting started guide, and window component page."
```

---

## Task 13: npm 배포 준비

> CLI 패키지의 npm 배포를 위한 메타데이터, 설정 파일, CI 파이프라인을 준비한다.

### Step 13.1: packages/cli/package.json 완성

- [ ] `packages/cli/package.json` 업데이트

```json
{
  "name": "win7ui",
  "version": "1.0.0",
  "description": "Windows 7 UI component library for React, Svelte, and Vue. Install components via CLI.",
  "keywords": [
    "windows-7",
    "ui",
    "components",
    "react",
    "svelte",
    "vue",
    "7.css",
    "retro",
    "aero",
    "design-system",
    "cli"
  ],
  "homepage": "https://github.com/user/win7ui",
  "bugs": "https://github.com/user/win7ui/issues",
  "repository": {
    "type": "git",
    "url": "https://github.com/user/win7ui.git",
    "directory": "packages/cli"
  },
  "license": "MIT",
  "author": "",
  "type": "module",
  "exports": {
    ".": "./dist/index.js"
  },
  "bin": {
    "win7ui": "./dist/index.js"
  },
  "files": [
    "dist",
    "registry-snapshot",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts",
    "build:registry": "tsx ../../scripts/build-registry.ts && cp -r ../../registry registry-snapshot",
    "prepublishOnly": "pnpm build && pnpm build:registry",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "commander": "^13.0.0",
    "@clack/prompts": "^0.9.0",
    "fs-extra": "^11.0.0",
    "picocolors": "^1.1.0",
    "diff": "^7.0.0",
    "semver": "^7.6.0"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.7.0",
    "vitest": "^3.0.0",
    "@types/fs-extra": "^11.0.0",
    "@types/diff": "^7.0.0"
  },
  "engines": {
    "node": ">=18"
  }
}
```

### Step 13.2: .npmignore

- [ ] `packages/cli/.npmignore` 생성

```
src/
__tests__/
*.test.ts
*.test.tsx
*.spec.ts
tsconfig.json
vitest.config.ts
.turbo/
node_modules/
```

### Step 13.3: LICENSE (루트)

- [ ] 프로젝트 루트 `LICENSE` 생성

```
MIT License

Copyright (c) 2026 win7ui contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Step 13.4: README.md (CLI 패키지용)

- [ ] `packages/cli/README.md` 생성

````markdown
# win7ui

Windows 7 UI component library for React, Svelte, and Vue.

> Install only the components you need, directly into your project source code. Inspired by [shadcn/ui](https://ui.shadcn.com/).

## Quick Start

```bash
npx win7ui init
npx win7ui add button window tabs
```

## Features

- 21 Windows 7-styled components
- React 18+, Svelte 5, Vue 3 support
- TypeScript and JavaScript variants
- Source code ownership (copy, not dependency)
- Based on [7.css](https://khang-nd.github.io/7.css/)

## Commands

| Command | Description |
|---------|-------------|
| `npx win7ui init` | Initialize project configuration |
| `npx win7ui add <components...>` | Add components to your project |
| `npx win7ui remove <components...>` | Remove components |
| `npx win7ui list` | List all available components |

## Components

button, textbox, checkbox, radiobutton, groupbox, dropdown, combobox, listbox, listview, searchbox, tabs, menu, menubar, collapse, progressbar, slider, spinner, treeview, window, scrollbar, balloon, typography

## License

MIT
````

### Step 13.5: GitHub Actions CI

- [ ] `.github/workflows/ci.yml` 생성

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm turbo typecheck

      - name: Run tests
        run: pnpm turbo test

      - name: Registry integrity check
        run: pnpm vitest run scripts/__tests__/registry-integrity.test.ts

      - name: Build CLI
        run: pnpm turbo build --filter=win7ui

  publish:
    needs: lint-and-test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    permissions:
      contents: write
      id-token: write

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
          registry-url: "https://registry.npmjs.org"

      - run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm turbo build --filter=win7ui

      - name: Build registry snapshot
        run: pnpm --filter=win7ui build:registry
```

- [ ] `.github/workflows/release.yml` 생성

```yaml
name: Release

on:
  push:
    tags:
      - "v*"

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      id-token: write

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
          registry-url: "https://registry.npmjs.org"

      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo build --filter=win7ui
      - run: pnpm --filter=win7ui build:registry
      - run: pnpm turbo test

      - name: Publish to npm
        run: cd packages/cli && npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          generate_release_notes: true
          files: |
            packages/cli/registry-snapshot/**
```

### Step 13.6: 루트 README.md

- [ ] 프로젝트 루트 `README.md` 생성

````markdown
# win7ui

> Windows 7 UI component library for React, Svelte, and Vue

A shadcn/ui-style component library that brings authentic Windows 7 aesthetics to modern web frameworks. Components are copied directly into your project source code via CLI.

## Usage

```bash
npx win7ui init
npx win7ui add button window
```

See [packages/cli/README.md](packages/cli/README.md) for full documentation.

## Development

```bash
pnpm install
pnpm turbo build
pnpm turbo test
```

## Project Structure

- `packages/cli/` - CLI tool (published to npm as `win7ui`)
- `registry/` - Component source code and CSS
- `scripts/` - Build automation
- `docs/site/` - Documentation website

## License

MIT
````

### Step 13.7: 커밋

```bash
git add packages/cli/package.json packages/cli/.npmignore packages/cli/README.md LICENSE README.md .github/
git commit -m "chore: prepare npm publish configuration, CI/CD, README, and LICENSE"
```

---

## Task 14: 최종 registry 빌드 + 검증

> build-registry.ts를 실행하여 최종 registry를 빌드하고, 모든 테스트를 통과하는지 검증한다.

### Step 14.1: build-registry.ts 실행

```bash
cd /Users/kim/projects/systemcss
pnpm build-registry
```

- [ ] `registry/index.json`이 21개 컴포넌트를 포함하는지 확인
- [ ] 모든 `registry/components/*.json`이 올바른 파일 참조를 가지는지 확인

### Step 14.2: inject-css.ts 전체 실행

```bash
pnpm inject-css
```

- [ ] 모든 Svelte/Vue 컴포넌트의 `<style>` 블록에 CSS가 주입되었는지 확인

### Step 14.3: 전체 테스트 실행

```bash
# 모든 테스트 실행
pnpm turbo test

# Registry 정합성 테스트
pnpm vitest run scripts/__tests__/registry-integrity.test.ts

# CLI E2E 테스트
pnpm vitest run packages/cli/__tests__/e2e-full.test.ts
```

### Step 14.4: CLI 빌드 + registry 스냅샷 번들

```bash
pnpm --filter=win7ui build
pnpm --filter=win7ui build:registry
```

- [ ] `packages/cli/dist/index.js` 존재 확인
- [ ] `packages/cli/registry-snapshot/` 디렉토리에 전체 registry 복사 확인

### Step 14.5: 최종 Dry-run 테스트

```bash
# npm publish dry-run으로 패키지 내용 확인
cd packages/cli
npm pack --dry-run
```

- [ ] 출력에서 `dist/`, `registry-snapshot/`, `README.md`, `LICENSE`가 포함되는지 확인
- [ ] 불필요한 파일(테스트, src/, tsconfig 등)이 제외되는지 확인

### Step 14.6: 최종 커밋

```bash
git add -A
git commit -m "chore: final registry build and validation for v1.0.0

All 21 components implemented across React, Svelte 5, and Vue 3.
Registry integrity verified, CLI E2E tests passing."
```

---

## 완료 체크리스트

| # | 항목 | 상태 |
|---|------|------|
| 1 | Window CSS 추출 + JSON | [ ] |
| 2 | Window Compound Component 설계 | [ ] |
| 3 | Window React TS/JS | [ ] |
| 4 | Window Svelte TS/JS | [ ] |
| 5 | Window Vue TS/JS | [ ] |
| 6 | GlassFrame + DialogBox 변형 | [ ] |
| 7 | Window 전체 테스트 | [ ] |
| 8 | Scrollbar CSS + React/Svelte/Vue + 테스트 | [ ] |
| 9 | Balloon CSS + React/Svelte/Vue + 테스트 | [ ] |
| 10 | Typography CSS + React/Svelte/Vue + 테스트 | [ ] |
| 11 | 전체 21개 통합 테스트 | [ ] |
| 12 | 문서 사이트 기본 구조 | [ ] |
| 13 | npm 배포 준비 | [ ] |
| 14 | 최종 registry 빌드 + 검증 | [ ] |

## 의존 관계

```
Task 1 (CSS 추출)
  -> Task 2 (설계)
    -> Task 3 (React) --+
    -> Task 4 (Svelte) --+--> Task 6 (GlassFrame/DialogBox) --> Task 7 (Window 테스트)
    -> Task 5 (Vue) ----+

Task 8 (Scrollbar) ------+
Task 9 (Balloon) ---------+--> Task 11 (통합 테스트) --> Task 14 (최종 검증)
Task 10 (Typography) ----+

Task 12 (문서) ------> Task 14
Task 13 (npm 준비) --> Task 14
```

**병렬 가능 그룹:**
- Task 3, 4, 5 (React/Svelte/Vue Window 구현)
- Task 8, 9, 10 (Scrollbar/Balloon/Typography -- Window 완료 후)
- Task 12, 13 (문서/npm 준비 -- 컴포넌트 구현과 병렬)
