<script setup lang="ts">
import { ref, computed, provide } from "vue";

interface Props {
  defaultValue?: string;
  value?: string;
  justified?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  defaultValue: "",
  justified: false,
});

const emit = defineEmits<{
  "update:value": [value: string];
}>();

const uncontrolledValue = ref(props.defaultValue);

const isControlled = computed(() => props.value !== undefined);
const activeValue = computed(() =>
  isControlled.value ? props.value! : uncontrolledValue.value
);

function onSelect(val: string) {
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
