<script setup lang="ts">
import { computed } from "vue";

interface Props {
  value?: number;
  min?: number;
  max?: number;
  state?: "normal" | "paused" | "error";
  animate?: boolean;
  marquee?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
  min: 0,
  max: 100,
  state: "normal",
  animate: false,
  marquee: false,
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
