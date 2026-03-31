<script setup lang="ts">
import { ref, computed } from "vue";

interface Props {
  summary: string;
  defaultOpen?: boolean;
  open?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  defaultOpen: false,
  open: undefined,
});

const emit = defineEmits<{
  toggle: [open: boolean];
}>();

const isControlled = computed(() => props.open !== undefined);
const internalOpen = ref(props.defaultOpen);
const isOpen = computed(() => (isControlled.value ? props.open : internalOpen.value));

function handleToggle(e: Event) {
  const details = e.currentTarget as HTMLDetailsElement;
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
