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
