<script setup lang="ts">
interface Props {
  label: string;
}

defineProps<Props>();
</script>

<template>
  <li
    role="menuitem"
    tabindex="0"
    class="menubarItem"
  >
    {{ label }}
    <slot />
  </li>
</template>
