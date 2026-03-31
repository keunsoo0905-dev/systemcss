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
/* registry/css/collapse.css — 7.css collapse 원본 */
details {
  margin-top: 0;
}

details > summary {
  cursor: pointer;
  display: inline;
  margin-bottom: 0;
  position: relative;
}

details > summary:before {
  border: 5px solid transparent;
  border-left-color: #000;
  border-radius: 3px;
  content: "";
  position: absolute;
  right: 100%;
  top: calc(50% - 5px);
}

details > summary::-webkit-details-marker,
details > summary::marker {
  display: none;
}

details[open] > summary:before {
  top: calc(50% - 2.5px);
  transform: rotate(45deg);
}
</style>
