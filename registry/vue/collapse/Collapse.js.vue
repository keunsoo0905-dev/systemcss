<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  summary: { type: String, required: true },
  defaultOpen: { type: Boolean, default: false },
  open: { type: Boolean, default: undefined },
});

const emit = defineEmits(["toggle"]);

const isControlled = computed(() => props.open !== undefined);
const internalOpen = ref(props.defaultOpen);
const isOpen = computed(() => (isControlled.value ? props.open : internalOpen.value));

function handleToggle(e) {
  const details = e.currentTarget;
  if (!isControlled.value) {
    internalOpen.value = details.open;
  }
  emit("toggle", details.open);
}
</script>

<template>
  <details
    :open="isOpen"
    @toggle="handleToggle"
    class="collapse"
  >
    <summary>{{ summary }}</summary>
    <slot />
  </details>
</template>

<style scoped>
  /* inject-css.ts 가 registry/css/collapse.css 내용을 여기에 자동 주입 */
</style>
