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

<style scoped>
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
</style>
