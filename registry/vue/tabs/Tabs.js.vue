<script setup>
import { ref, computed, provide } from "vue";

const props = defineProps({
  defaultValue: { type: String, default: "" },
  value: { type: String, default: undefined },
  justified: { type: Boolean, default: false },
});

const emit = defineEmits(["update:value"]);

const uncontrolledValue = ref(props.defaultValue);

const isControlled = computed(() => props.value !== undefined);
const activeValue = computed(() =>
  isControlled.value ? props.value : uncontrolledValue.value
);

function onSelect(val) {
  if (!isControlled.value) {
    uncontrolledValue.value = val;
  }
  emit("update:value", val);
}

provide("tabs", {
  activeValue,
  onSelect,
});
</script>

<template>
  <menu
    role="tablist"
    :class="['tablist', justified && 'justified']"
  >
    <slot />
  </menu>
</template>

<style scoped>
  /* inject-css.ts 가 registry/css/tabs.css 내용을 여기에 자동 주입 */
</style>
