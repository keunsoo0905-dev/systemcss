<!-- registry/vue/spinner/Spinner.vue -->
<script setup lang="ts">
interface Props {
  animate?: boolean;
  size?: "small" | "default" | "large";
}

const props = withDefaults(defineProps<Props>(), {
  animate: false,
  size: "default",
});
</script>

<template>
  <div
    role="status"
    :class="[
      'spinner',
      props.animate && 'animate',
      props.size !== 'default' && props.size,
    ]"
  />
</template>

<style scoped>
/* registry/css/spinner.css — 7.css spinner 원본 */

/* 정적 로더 (spinner 정지 상태) */
.spinner {
  display: inline-block;
  width: 32px;
  height: 32px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='12' fill='none' stroke='%23a0c4e8' stroke-width='3'/%3E%3Cpath d='M16 4a12 12 0 0 1 12 12' fill='none' stroke='%232b71b8' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat center;
  background-size: contain;
}

/* 애니메이션 로더 */
.spinner.animate {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 크기 변형 */
.spinner.small {
  width: 16px;
  height: 16px;
}

.spinner.large {
  width: 48px;
  height: 48px;
}
</style>
