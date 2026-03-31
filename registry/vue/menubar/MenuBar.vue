<script setup lang="ts">
interface Props {
  class?: string;
}

defineProps<Props>();
</script>

<template>
  <ul role="menubar" :class="['menubar', $props.class]">
    <slot />
  </ul>
</template>

<style scoped>
  /* inject-css.ts 가 registry/css/menubar.css 내용을 여기에 자동 주입 */
</style>
