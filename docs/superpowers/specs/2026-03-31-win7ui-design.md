# win7ui - Windows 7 UI Component Library Design Spec

## Overview

7.css(Windows 7 CSS 프레임워크)를 기반으로 React, Svelte, Vue를 지원하는 shadcn/ui 스타일 컴포넌트 라이브러리. CLI를 통해 원하는 컴포넌트의 소스 코드를 사용자 프로젝트에 복사하는 방식.

## 핵심 결정사항

| 항목 | 결정 |
|------|------|
| 프로젝트 이름 | `win7ui` |
| 배포 모델 | shadcn/ui 스타일 (소스 코드 복사) |
| 스타일링 | 7.css 원본 CSS 유지, 프레임워크 네이티브 스코핑 |
| TypeScript | JS/TS 둘 다 지원 (`--typescript` 플래그) |
| 프레임워크 | React, Svelte, Vue |
| CLI 소스 | JSON 레지스트리 파일 (GitHub raw URL 기반 다운로드) |
| 컴포넌트 수 | 21개 전체 |
| 모노레포 | pnpm workspace + Turborepo |

---

## 1. 프로젝트 구조

```
win7ui/
├── packages/
│   ├── cli/                    # npm 패키지: win7ui
│   │   ├── src/
│   │   │   ├── commands/
│   │   │   │   ├── add.ts      # npx win7ui add <component>
│   │   │   │   ├── init.ts     # npx win7ui init
│   │   │   │   └── list.ts     # npx win7ui list
│   │   │   ├── utils/
│   │   │   │   ├── detect-framework.ts
│   │   │   │   ├── registry.ts
│   │   │   │   └── file-writer.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── registry/               # 컴포넌트 소스 저장소
│       ├── registry.json       # 메타데이터
│       ├── css/                # 공통 CSS (7.css 원본 기반)
│       │   ├── base.css
│       │   ├── button.css
│       │   └── ...
│       ├── react/
│       │   ├── button/
│       │   │   ├── button.tsx
│       │   │   ├── button.jsx
│       │   │   └── button.module.css
│       │   └── ...
│       ├── svelte/
│       │   ├── button/
│       │   │   ├── Button.svelte
│       │   │   └── Button.js.svelte
│       │   └── ...
│       └── vue/
│           ├── button/
│           │   ├── Button.vue
│           │   └── Button.js.vue
│           └── ...
│
├── docs/
├── pnpm-workspace.yaml
├── package.json
└── turbo.json
```

### CSS 스코핑 전략

| 프레임워크 | 방식 |
|------------|------|
| React | CSS Modules (`.module.css`) |
| Svelte | `<style>` 블록에 CSS 내장 (자동 스코핑) |
| Vue | `<style scoped>` 블록에 CSS 내장 |

---

## 2. CLI 설계

### 명령어

#### `npx win7ui init`

프로젝트 초기화. `win7ui.config.json` 생성.

```json
{
  "framework": "react",
  "typescript": true,
  "componentDir": "src/components/win7ui",
  "cssDir": "src/components/win7ui/css"
}
```

프레임워크 자동 감지:
- `react` / `react-dom` → React
- `svelte` → Svelte
- `vue` → Vue
- 여러 개 감지 시 프롬프트로 선택

#### `npx win7ui add <component...>`

컴포넌트 소스 코드를 사용자 프로젝트에 복사.

동작 규칙:
- `base.css`는 최초 `add` 시 자동 설치
- 컴포넌트 간 의존성 자동 설치 (예: `window` → `titlebar`, `statusbar`)
- 이미 설치된 컴포넌트 스킵 (`--overwrite`로 덮어쓰기)
- `--typescript` / `--no-typescript`로 설정 오버라이드

#### `npx win7ui list`

설치 가능한 전체 컴포넌트 목록 + 설치 상태 표시.

### CLI 기술 스택

- **Commander.js** — 명령어 파싱
- **@clack/prompts** — 인터랙티브 프롬프트
- **fs-extra** — 파일 복사
- **picocolors** — 터미널 컬러
- **tsup** — CLI 번들링

---

## 3. 레지스트리 구조

### registry.json 스키마

```json
{
  "version": "1.0.0",
  "baseUrl": "https://raw.githubusercontent.com/<owner>/win7ui/main/packages/registry",
  "base": {
    "css": ["css/base.css"]
  },
  "components": {
    "<component-name>": {
      "name": "<DisplayName>",
      "description": "<설명>",
      "dependencies": ["<다른-컴포넌트-이름>"],
      "css": ["css/<name>.css"],
      "files": {
        "react": {
          "ts": ["react/<name>/<name>.tsx"],
          "js": ["react/<name>/<name>.jsx"]
        },
        "svelte": {
          "ts": ["svelte/<name>/<Name>.svelte"],
          "js": ["svelte/<name>/<Name>.js.svelte"]
        },
        "vue": {
          "ts": ["vue/<name>/<Name>.vue"],
          "js": ["vue/<name>/<Name>.js.vue"]
        }
      }
    }
  }
}
```

### 사용자 프로젝트 설치 후 구조

```
src/components/win7ui/
├── css/
│   ├── base.css
│   ├── button.css        # React만 (CSS Modules)
│   └── ...
├── Button.tsx
├── Checkbox.tsx
└── index.ts               # add 시 자동 업데이트
```

---

## 4. 컴포넌트 작성 패턴

### React (TypeScript)

```tsx
import React from "react";
import styles from "./button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary";
}

export function Button({ variant = "default", className, ...props }: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${variant === "primary" ? styles.default : ""} ${className ?? ""}`}
      {...props}
    />
  );
}
```

### Svelte (TypeScript)

```svelte
<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";

  interface Props extends HTMLButtonAttributes {
    variant?: "default" | "primary";
  }

  let { variant = "default", class: className, ...rest }: Props = $props();
</script>

<button class="button {variant === 'primary' ? 'default' : ''} {className ?? ''}" {...rest}>
  <slot />
</button>

<style>
  /* 7.css button.css 내용 내장 */
</style>
```

### Vue (TypeScript)

```vue
<script setup lang="ts">
interface Props {
  variant?: "default" | "primary";
}

const { variant = "default" } = defineProps<Props>();
</script>

<template>
  <button :class="['button', variant === 'primary' && 'default']">
    <slot />
  </button>
</template>

<style scoped>
  /* 7.css button.css 내용 내장 */
</style>
```

---

## 5. 컴포넌트 배치 (5개 배치)

### Batch 1: 기초 인프라 + 핵심 입력

모노레포 셋업, CLI 기본 구조, registry 스키마, base.css 추출, 3개 프레임워크 x JS/TS 템플릿 확립.

| 컴포넌트 | 난이도 |
|----------|--------|
| button | 낮음 |
| textbox | 낮음 |
| checkbox | 낮음 |
| radiobutton | 낮음 |
| groupbox | 낮음 |

### Batch 2: 복합 입력 + 리스트

| 컴포넌트 | 난이도 |
|----------|--------|
| combobox | 중간 |
| dropdown | 중간 |
| listbox | 중간 |
| listview | 중간 |
| searchbox | 중간 |

### Batch 3: 내비게이션 + 구조

| 컴포넌트 | 난이도 |
|----------|--------|
| tabs | 중간 |
| menu | 중간 |
| menubar | 중간 |
| collapse | 낮음 |

### Batch 4: 상태 표시 + 고급 입력

| 컴포넌트 | 난이도 |
|----------|--------|
| progressbar | 중간 |
| slider | 높음 |
| spinner | 높음 |
| scrollbar | 높음 |

### Batch 5: 윈도우 + 부가 + 마무리

전체 통합 테스트, 문서 사이트 기본 구조, npm 배포 준비.

| 컴포넌트 | 난이도 |
|----------|--------|
| window | 높음 |
| treeview | 중간 |
| balloon | 낮음 |

### 배치 간 의존 관계

```
Batch 1 (기초) → Batch 2~4 (독립 병렬 가능) → Batch 5 (통합 마무리)
```

---

## 6. 테스팅 전략

| 레이어 | 도구 | 대상 |
|--------|------|------|
| CLI 유닛 테스트 | Vitest | 명령어 파싱, 프레임워크 감지, 파일 복사 로직 |
| CLI E2E 테스트 | Vitest + 임시 디렉토리 | init → add → 파일 생성 검증 |
| 컴포넌트 스냅샷 | 프레임워크별 Vitest | 렌더링 출력 스냅샷 |
| CSS 시각 검증 | Storybook (추후) | 7.css 원본과 동일한 렌더링 검증 |

---

## 7. 빌드 및 배포

### 빌드
- CLI만 빌드 대상 (`tsup`으로 번들링)
- registry 컴포넌트는 빌드하지 않음 (소스 그대로)
- `registry.json`은 스크립트로 자동 생성

### npm 배포

| 패키지 | 이름 | 내용 |
|--------|------|------|
| CLI | `win7ui` | `npx win7ui` 실행 가능한 CLI |

- CLI 패키지 하나만 npm에 배포
- registry 컴포넌트는 GitHub raw URL에서 다운로드

### 에러 처리

| 상황 | 동작 |
|------|------|
| 네트워크 오류 | 재시도 1회 → 에러 메시지 |
| 존재하지 않는 컴포넌트 | 유사 이름 제안 |
| 이미 설치된 컴포넌트 | 스킵 + `--overwrite` 안내 |
| init 안 된 상태에서 add | init 먼저 실행 유도 |
| 지원하지 않는 프레임워크 | 지원 목록 안내 |

### 릴리즈 워크플로

```
코드 작성 → 테스트 통과 → GitHub push → GitHub Actions CI → npm publish (CLI만)
```
