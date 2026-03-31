<script setup>
import { computed } from "vue";

const props = defineProps({
  value: { type: Number, default: 0 },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  state: { type: String, default: "normal" },
  animate: { type: Boolean, default: false },
  marquee: { type: Boolean, default: false },
});

const clampedValue = computed(() => Math.min(Math.max(props.value, props.min), props.max));
const percentage = computed(
  () => ((clampedValue.value - props.min) / (props.max - props.min)) * 100
);
</script>

<template>
  <div
    role="progressbar"
    :aria-valuenow="marquee ? undefined : clampedValue"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :class="[
      'progressbar',
      state === 'paused' && 'paused',
      state === 'error' && 'error',
      animate && 'animate',
      marquee && 'marquee',
    ]"
  >
    <div v-if="!marquee" :style="{ width: `${percentage}%` }" />
  </div>
</template>

<style scoped>
  /* inject-css.ts 가 registry/css/progressbar.css 내용을 여기에 자동 주입 */
</style>
