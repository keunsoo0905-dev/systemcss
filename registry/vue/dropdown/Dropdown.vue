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
    <option v-if="props.placeholder" value="" disabled>
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
</style>
