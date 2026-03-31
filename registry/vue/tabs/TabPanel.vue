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
