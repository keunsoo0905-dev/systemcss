<script setup>
const props = defineProps({
  disabled: { type: Boolean, default: false },
  hasSubmenu: { type: Boolean, default: false },
});

const emit = defineEmits(["select"]);

function handleClick() {
  if (!props.disabled) {
    emit("select");
  }
}

function handleKeyDown(e) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    handleClick();
  }
}
</script>

<template>
  <li
    role="menuitem"
    :aria-disabled="disabled || undefined"
    :tabindex="disabled ? -1 : 0"
    :class="['menuItem', hasSubmenu && 'has-submenu']"
    @click="handleClick"
    @keydown="handleKeyDown"
  >
    <slot />
    <slot name="submenu" />
  </li>
</template>
