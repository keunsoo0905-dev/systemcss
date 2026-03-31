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
</style>
