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
