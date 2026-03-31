<!-- registry/vue/slider/Slider.vue -->
<script setup lang="ts">
interface Props {
  orientation?: "horizontal" | "vertical";
  variant?: "default" | "box-indicator";
  modelValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  orientation: "horizontal",
  variant: "default",
});

const emit = defineEmits<{
  "update:modelValue": [value: number];
}>();

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", Number(target.value));
}
</script>

<template>
  <input
    type="range"
    :class="[
      'slider',
      orientation === 'vertical' && 'vertical',
      variant === 'box-indicator' && 'has-box-indicator',
    ]"
    :min="props.min"
    :max="props.max"
    :step="props.step"
    :disabled="props.disabled"
    :value="props.modelValue"
    @input="onInput"
  />
</template>

<style scoped>
/* registry/css/slider.css — 7.css slider 원본 */

/* 공통 input[type=range] 스타일 */
input[type="range"] {
  -webkit-appearance: none;
  width: 100%;
  background: transparent;
  height: 21px;
}

/* Webkit Track */
input[type="range"]::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: linear-gradient(
    to bottom,
    #dedfe0 0%,
    #fbfbfb 100%
  );
  border: 1px solid #8e8f8f;
  border-radius: 0;
}

/* Webkit Thumb */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 11px;
  width: 11px;
  margin-top: -4px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11'%3E%3Cpath d='M0 0h11v11H0z' fill='%23f0f0f0'/%3E%3Cpath d='M1 0h9v1H1zM0 1h1v9H0zm10 1h1v9h-1zM1 10h9v1H1z' fill='%23888'/%3E%3Cpath d='M2 1h7v1H2zM1 2h1v7H1zm8 0h1v7h-1zM2 9h7v1H2z' fill='%23dfdfdf'/%3E%3Cpath d='M2 2h7v7H2z' fill='%23eee'/%3E%3C/svg%3E") no-repeat center;
  cursor: pointer;
}

/* Firefox Track */
input[type="range"]::-moz-range-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: linear-gradient(
    to bottom,
    #dedfe0 0%,
    #fbfbfb 100%
  );
  border: 1px solid #8e8f8f;
}

/* Firefox Thumb */
input[type="range"]::-moz-range-thumb {
  height: 11px;
  width: 11px;
  border: none;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11'%3E%3Cpath d='M0 0h11v11H0z' fill='%23f0f0f0'/%3E%3Cpath d='M1 0h9v1H1zM0 1h1v9H0zm10 1h1v9h-1zM1 10h9v1H1z' fill='%23888'/%3E%3Cpath d='M2 1h7v1H2zM1 2h1v7H1zm8 0h1v7h-1zM2 9h7v1H2z' fill='%23dfdfdf'/%3E%3Cpath d='M2 2h7v7H2z' fill='%23eee'/%3E%3C/svg%3E") no-repeat center;
  cursor: pointer;
}

/* 수직 모드 */
input[type="range"].vertical {
  writing-mode: vertical-lr;
  direction: rtl;
  width: 21px;
  height: 160px;
}

/* has-box-indicator 변형 */
input[type="range"].has-box-indicator::-webkit-slider-thumb {
  height: 21px;
  width: 11px;
  border-radius: 0;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='21'%3E%3Cpath d='M0 0h11v21H0z' fill='%23f0f0f0'/%3E%3Cpath d='M1 0h9v1H1zM0 1h1v19H0zm10 1h1v19h-1zM1 20h9v1H1z' fill='%23888'/%3E%3Cpath d='M2 1h7v1H2zM1 2h1v17H1zm8 0h1v17h-1zM2 19h7v1H2z' fill='%23dfdfdf'/%3E%3Cpath d='M2 2h7v17H2z' fill='%23eee'/%3E%3C/svg%3E") no-repeat center;
}

input[type="range"].has-box-indicator::-moz-range-thumb {
  height: 21px;
  width: 11px;
  border-radius: 0;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='21'%3E%3Cpath d='M0 0h11v21H0z' fill='%23f0f0f0'/%3E%3Cpath d='M1 0h9v1H1zM0 1h1v19H0zm10 1h1v19h-1zM1 20h9v1H1z' fill='%23888'/%3E%3Cpath d='M2 1h7v1H2zM1 2h1v17H1zm8 0h1v17h-1zM2 19h7v1H2z' fill='%23dfdfdf'/%3E%3Cpath d='M2 2h7v17H2z' fill='%23eee'/%3E%3C/svg%3E") no-repeat center;
}

/* 비활성화 상태 */
input[type="range"]:disabled::-webkit-slider-thumb {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11'%3E%3Cpath d='M0 0h11v11H0z' fill='%23d4d0c8'/%3E%3Cpath d='M1 0h9v1H1zM0 1h1v9H0zm10 1h1v9h-1zM1 10h9v1H1z' fill='%23aaa'/%3E%3C/svg%3E") no-repeat center;
}

input[type="range"]:disabled::-moz-range-thumb {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11'%3E%3Cpath d='M0 0h11v11H0z' fill='%23d4d0c8'/%3E%3Cpath d='M1 0h9v1H1zM0 1h1v9H0zm10 1h1v9h-1zM1 10h9v1H1z' fill='%23aaa'/%3E%3C/svg%3E") no-repeat center;
}

input[type="range"]:disabled::-webkit-slider-runnable-track {
  opacity: 0.6;
}

input[type="range"]:disabled::-moz-range-track {
  opacity: 0.6;
}
</style>
