<script setup>
defineProps({
  label: { type: String, required: true },
});
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
