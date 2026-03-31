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
</style>
