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
| CLI 소스 | 이중 전략: npm 번들(기본) + 원격 업데이트(`--latest`) |
| 컴포넌트 수 | 21개 전체 |
| 모노레포 | pnpm workspace + Turborepo |

---

## 1. 프로젝트 구조

```
win7ui/
├── packages/
│   └── cli/                    # npm 패키지: win7ui
│       ├── src/
│       │   ├── commands/
│       │   │   ├── add.ts      # npx win7ui add <component>
│       │   │   ├── init.ts     # npx win7ui init
│       │   │   ├── list.ts     # npx win7ui list
│       │   │   └── remove.ts   # npx win7ui remove <component>
│       │   ├── utils/
│       │   │   ├── detect-framework.ts
│       │   │   ├── registry.ts
│       │   │   ├── file-writer.ts
│       │   │   └── version-check.ts
│       │   └── index.ts
│       └── package.json
│
├── registry/                   # 컴포넌트 소스 저장소 (npm에 배포하지 않음)
│   ├── index.json              # 컴포넌트 목록 + 메타데이터 요약
│   ├── components/             # 컴포넌트별 개별 메타데이터
│   │   ├── button.json
│   │   ├── textbox.json
│   │   └── ...
│   ├── css/                    # 공통 CSS — 단일 소스 (7.css 원본 기반)
│   │   ├── base.css
│   │   ├── button.css
│   │   └── ...
│   ├── react/
│   │   ├── button/
│   │   │   ├── button.tsx
│   │   │   └── button.jsx
│   │   └── ...
│   ├── svelte/
│   │   ├── button/
│   │   │   ├── Button.svelte
│   │   │   └── Button.js.svelte
│   │   └── ...
│   └── vue/
│       ├── button/
│       │   ├── Button.vue
│       │   └── Button.js.vue
│       └── ...
│
├── scripts/
│   ├── build-registry.ts       # registry JSON 자동 생성
│   ├── inject-css.ts           # CSS → Svelte/Vue <style> 블록 자동 주입
│   └── sync-7css.ts            # 7.css 원본과 동기화
│
├── docs/
├── pnpm-workspace.yaml
├── package.json
└── turbo.json
```

### 주요 구조 변경 (리뷰 반영)

- `registry/`를 `packages/` 밖 최상위로 이동 — npm 패키지가 아닌 정적 에셋이므로
- `registry.json` → `index.json` + 컴포넌트별 개별 JSON으로 분할
- `scripts/` 디렉토리 추가 — CSS 주입, 레지스트리 빌드, 7.css 동기화 자동화
- `remove.ts` 명령어 추가
- `version-check.ts` 유틸 추가

### CSS 단일 소스 전략

CSS는 `registry/css/`에 **한 곳에서만** 관리한다.

```
css/button.css (단일 소스)
     ├── React: 그대로 .module.css로 복사하여 사용
     ├── Svelte: 빌드 스크립트(inject-css.ts)가 <style> 블록에 자동 주입
     └── Vue: 빌드 스크립트(inject-css.ts)가 <style scoped> 블록에 자동 주입
```

- 7.css 업데이트 시 `css/` 디렉토리만 갱신하면 `inject-css.ts`가 Svelte/Vue 파일을 자동 재생성
- React 컴포넌트는 CSS를 외부 `.module.css`로 import하므로 별도 처리 불필요

### CSS 스코핑 전략

| 프레임워크 | 방식 |
|------------|------|
| React | CSS Modules (`.module.css`) — CSS 파일 별도 복사 |
| Svelte | `<style>` 블록에 CSS 내장 (빌드 스크립트 자동 주입) |
| Vue | `<style scoped>` 블록에 CSS 내장 (빌드 스크립트 자동 주입) |

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

프레임워크 자동 감지 로직:
- `react` / `react-dom` / `next` → React
- `svelte` / `@sveltejs/kit` → Svelte
- `vue` / `nuxt` → Vue
- `dependencies` + `devDependencies` 모두 검사
- 여러 개 감지 시 프롬프트로 선택
- `package.json` 없는 경우 프롬프트로 선택

#### `npx win7ui add <component...>`

컴포넌트 소스 코드를 사용자 프로젝트에 복사.

동작 규칙:
- `base.css`는 최초 `add` 시 자동 설치
- 컴포넌트 간 의존성 자동 설치 (예: `window` → `titlebar`, `statusbar`)
- 이미 설치된 컴포넌트는 스킵 + 안내
- 덮어쓰기 시: diff 표시 → 사용자 선택 (덮어쓰기/스킵/백업 후 덮어쓰기)
- `--overwrite` 플래그로 확인 없이 덮어쓰기 (원본 `.bak` 자동 백업)
- `--typescript` / `--no-typescript`로 init 설정 오버라이드
- `--latest` 플래그로 원격 최신 registry에서 가져오기 (기본은 CLI 번들 사용)

#### `npx win7ui remove <component...>`

설치된 컴포넌트 제거.

동작 규칙:
- 해당 컴포넌트 파일 + CSS 파일 삭제
- 다른 컴포넌트가 의존하는 경우 경고 + 확인
- `index.ts`에서 해당 export 자동 제거
- `--force` 플래그로 의존성 무시하고 강제 삭제

#### `npx win7ui list`

설치 가능한 전체 컴포넌트 목록 + 설치 상태 표시.

### CLI 기술 스택

- **Commander.js** — 명령어 파싱
- **@clack/prompts** — 인터랙티브 프롬프트
- **fs-extra** — 파일 복사
- **picocolors** — 터미널 컬러
- **tsup** — CLI 번들링
- **diff** — 컴포넌트 업데이트 시 diff 표시

---

## 3. 레지스트리 구조

### 이중 배포 전략 (리뷰 반영)

1. **주 소스 (기본)**: CLI npm 패키지 내부에 registry 스냅샷 번들
   - `npx win7ui add button` → 로컬 번들에서 즉시 복사
   - 오프라인 동작 가능, rate limiting 없음, 버전 고정
2. **업데이트 채널**: `--latest` 플래그 시 GitHub Releases artifact에서 최신 registry 다운로드
   - `npx win7ui add button --latest` → 원격에서 최신 가져오기
   - GitHub Releases에 버전별 아카이브 첨부 (raw URL 대신)

### 레지스트리 파일 구조 (분할)

**index.json** — 컴포넌트 목록 요약:
```json
{
  "registryVersion": "1.0.0",
  "minCliVersion": "1.0.0",
  "maxCliVersion": "1.x.x",
  "base": {
    "css": ["css/base.css"]
  },
  "components": [
    {
      "name": "button",
      "displayName": "Button",
      "description": "Windows 7 스타일 푸시 버튼",
      "dependencies": []
    },
    {
      "name": "window",
      "displayName": "Window",
      "description": "Windows 7 윈도우 프레임",
      "dependencies": ["titlebar", "statusbar"]
    }
  ]
}
```

**components/button.json** — 개별 컴포넌트 상세:
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

### CLI-레지스트리 버전 호환성 (리뷰 반영)

CLI가 registry를 로드할 때 호환성 체크:
- `registryVersion`이 CLI의 지원 범위(`minCliVersion` ~ `maxCliVersion`) 내인지 검증
- 호환되지 않으면 CLI 업데이트 안내 메시지 표시
- semver 범위 체크 사용

### 사용자 프로젝트 설치 후 구조

```
src/components/win7ui/
├── css/
│   ├── base.css
│   ├── button.module.css   # React만 (CSS Modules)
│   └── ...
├── Button.tsx
├── Checkbox.tsx
└── index.ts                # add/remove 시 자동 업데이트
```

`index.ts` 자동 관리 규칙:
- `add` 시: 해당 컴포넌트 export 라인 추가
- `remove` 시: 해당 컴포넌트 export 라인 제거
- 파일 전체를 재생성 (사용자 수정 보존하지 않음 — barrel export 파일이므로)
- 사용자가 커스텀 export를 추가하고 싶으면 별도 파일 사용 권장

---

## 4. 컴포넌트 작성 패턴

### Props 표준화 규칙

3개 프레임워크 간 Props를 통일한다:

| 규칙 | 예시 |
|------|------|
| Props 이름은 모든 프레임워크에서 동일 | `variant`, `disabled`, `size` |
| variant 값은 7.css 클래스명 기반 | `"default"`, `"primary"` |
| 이벤트는 각 프레임워크 네이티브 방식 | React: `onClick`, Svelte: `onclick`, Vue: `@click` |
| children/slot은 프레임워크 규칙 따름 | React: `children`, Svelte/Vue: `<slot />` |
| `class`/`className`으로 커스텀 클래스 지원 | React: `className`, Svelte/Vue: `class` |

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
      className={`${styles.button} ${variant === "primary" ? styles.primary : ""} ${className ?? ""}`}
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

<button class="button {variant === 'primary' ? 'primary' : ''} {className ?? ''}" {...rest}>
  <slot />
</button>

<style>
  /* inject-css.ts가 css/button.css 내용을 여기에 자동 주입 */
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
  <button :class="['button', variant === 'primary' && 'primary']">
    <slot />
  </button>
</template>

<style scoped>
  /* inject-css.ts가 css/button.css 내용을 여기에 자동 주입 */
</style>
```

### Compound Component 패턴

복합 컴포넌트(window, tabs 등)는 하위 컴포넌트를 포함한다:

| 복합 컴포넌트 | 하위 컴포넌트 |
|--------------|-------------|
| Window | TitleBar, WindowBody, StatusBar |
| Tabs | Tab, TabPanel |
| Menu | MenuItem, MenuSeparator |

하위 컴포넌트는 상위 컴포넌트의 `dependencies`로 자동 설치되며, 같은 디렉토리에 위치한다:

```
react/window/
├── window.tsx        # Window (메인)
├── title-bar.tsx     # TitleBar
├── window-body.tsx   # WindowBody
└── status-bar.tsx    # StatusBar
```

---

## 5. 컴포넌트 배치 (5개 배치)

### Batch 1: 기초 인프라 + 핵심 입력 (5개)

모노레포 셋업, CLI 기본 구조(init/add/list/remove), registry 스키마, base.css 추출, CSS 주입 파이프라인, 3개 프레임워크 x JS/TS 템플릿 확립.

| 컴포넌트 | 난이도 |
|----------|--------|
| button | 낮음 |
| textbox | 낮음 |
| checkbox | 낮음 |
| radiobutton | 낮음 |
| groupbox | 낮음 |

### Batch 2: 복합 입력 + 리스트 (5개)

**내부 구현 순서**: dropdown → combobox (combobox가 dropdown 내부 구현을 재사용)

| 컴포넌트 | 난이도 | 비고 |
|----------|--------|------|
| dropdown | 중간 | 메뉴 펼침 동작 |
| combobox | 중간 | dropdown 재사용, 입력 가능 |
| listbox | 중간 | 스크롤 가능한 선택 목록 |
| listview | 중간 | table 기반 (scrollbar는 자체 구현 없이 브라우저 기본) |
| searchbox | 중간 | textbox(Batch 1) + 아이콘 조합 |

### Batch 3: 내비게이션 + 구조 (5개)

**리뷰 반영**: progressbar를 Batch 4에서 이동하여 작업량 균형 조정.

| 컴포넌트 | 난이도 | 비고 |
|----------|--------|------|
| tabs | 중간 | role="tab" 기반, 접근성 |
| menu | 중간 | 중첩 메뉴 구조 |
| menubar | 중간 | menu 의존, 수평 배치 |
| collapse | 낮음 | details/summary 기반 |
| progressbar | 중간 | 애니메이션 포함 |

### Batch 4: 고급 입력 (3개)

**리뷰 반영**: scrollbar를 Batch 5로 이동, progressbar를 Batch 3으로 이동하여 과부하 해소.

| 컴포넌트 | 난이도 | 비고 |
|----------|--------|------|
| slider | 높음 | 커스텀 트랙/thumb, 7.68kB CSS |
| spinner | 높음 | 복잡한 버튼 조합, 9.15kB CSS |
| treeview | 중간 | 재귀 트리 구조, collapse 로직 공유 가능 |

### Batch 5: 윈도우 + 나머지 + 마무리 (4개)

**리뷰 반영**: scrollbar 추가, treeview를 Batch 4로 이동.

| 컴포넌트 | 난이도 | 비고 |
|----------|--------|------|
| window | 높음 | 25.9kB CSS, Compound Component (TitleBar/Body/StatusBar) |
| scrollbar | 높음 | 12.9kB CSS, 브라우저 호환성 |
| balloon | 낮음 | tooltip, 위치 변형 |
| typography | 낮음 | 기본 타이포그래피 스타일 |

**이 배치에 포함되는 마무리 작업:**
- 전체 컴포넌트 통합 테스트
- 문서 사이트 기본 구조
- npm 배포 준비 (CLI + 번들된 registry)
- README 작성

### 배치 간 의존 관계

```
Batch 1 (기초) → Batch 2~4 (병렬 가능, 아래 cross-batch 의존성 주의) → Batch 5 (통합 마무리)
```

**Cross-batch 의존성:**
- `combobox`(B2) → `dropdown`(B2) 내부 재사용 — 같은 배치 내 순서로 해결
- `treeview`(B4) → `collapse`(B3) 접기/펼치기 로직 공유 가능 — B3 완료 후 B4 시작 권장
- `listview`(B2)의 스크롤은 브라우저 기본 사용 — `scrollbar`(B5) 의존하지 않음
- `window`(B5)의 하위 컴포넌트(TitleBar, StatusBar)는 window 내부에 포함

### 작업량 균형 (조정 후)

| Batch | 컴포넌트 수 | 난이도 분포 | 추가 작업 |
|-------|------------|------------|----------|
| 1 | 5 | 낮음 x5 | 인프라 셋업 (높음) |
| 2 | 5 | 중간 x5 | - |
| 3 | 5 | 낮음 x1, 중간 x4 | - |
| 4 | 3 | 중간 x1, 높음 x2 | - |
| 5 | 4 | 낮음 x2, 높음 x2 | 통합/배포 마무리 |

---

## 6. 7.css 원본 동기화 전략

`scripts/sync-7css.ts` 스크립트로 자동화:

1. 7.css npm 패키지의 `dist/gui/` 디렉토리에서 개별 CSS 파일 추출
2. `registry/css/` 디렉토리에 복사
3. `inject-css.ts` 실행하여 Svelte/Vue 컴포넌트 `<style>` 블록 갱신
4. 변경 사항 diff 출력

실행: `pnpm sync-7css` (수동 실행, 7.css 업데이트 시)

---

## 7. 테스팅 전략

| 레이어 | 도구 | 대상 |
|--------|------|------|
| CLI 유닛 테스트 | Vitest | 명령어 파싱, 프레임워크 감지, 파일 복사, 버전 체크 |
| CLI E2E 테스트 | Vitest + 임시 디렉토리 | init → add → remove → 파일 생성/삭제 검증 |
| 레지스트리 검증 | CI 스크립트 | registry JSON과 실제 파일 경로 정합성 체크 |
| 컴포넌트 스냅샷 | 프레임워크별 Vitest | 렌더링 출력 스냅샷 |
| CSS 시각 검증 | Storybook (추후) | 7.css 원본과 동일한 렌더링 검증 |

---

## 8. 빌드 및 배포

### 빌드
- CLI: `tsup`으로 번들링 + registry 스냅샷 포함
- registry 컴포넌트: 빌드하지 않음 (소스 그대로)
- `registry.json` 자동 생성: `scripts/build-registry.ts`가 디렉토리 스캔

### npm 배포

| 패키지 | 이름 | 내용 |
|--------|------|------|
| CLI | `win7ui` | CLI + 번들된 registry 스냅샷 |

- CLI 패키지 하나만 npm에 배포
- registry 스냅샷이 CLI에 번들됨 (기본 사용)
- `--latest` 시 GitHub Releases artifact에서 최신 다운로드

### 에러 처리

| 상황 | 동작 |
|------|------|
| 네트워크 오류 (--latest) | exponential backoff 재시도 3회 → 로컬 번들 폴백 안내 |
| 존재하지 않는 컴포넌트 | 유사 이름 제안 (did you mean?) |
| 이미 설치된 컴포넌트 | diff 표시 → 덮어쓰기/스킵/백업 선택 |
| init 안 된 상태에서 add | init 먼저 실행 유도 |
| 지원하지 않는 프레임워크 | 지원 목록 안내 |
| CLI-registry 버전 불일치 | CLI 업데이트 안내 메시지 |
| 부분 실패 (여러 컴포넌트 중 일부) | 성공한 것은 유지, 실패 목록 표시, 재시도 명령어 안내 |

### 릴리즈 워크플로

```
코드 작성 → 테스트 통과 → GitHub push →
GitHub Actions CI (lint + test + registry 정합성 검증) →
GitHub Release 생성 (registry artifact 첨부) →
npm publish (CLI + 번들된 registry)
```
