<script setup>
defineProps({
  class: { type: String, default: undefined },
});
</script>

<template>
  <ul role="menu" :class="['menu', $props.class]">
    <slot />
  </ul>
</template>

<style scoped>
  /* inject-css.ts 가 registry/css/menu.css 내용을 여기에 자동 주입 */
</style>
