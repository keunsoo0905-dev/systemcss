<script setup>
import { computed, inject } from "vue";

const props = defineProps({
  value: { type: String, required: true },
});

const ctx = inject("tabs");

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
