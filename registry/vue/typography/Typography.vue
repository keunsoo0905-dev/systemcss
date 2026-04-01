<script setup lang="ts">
import { computed } from "vue";

type Variant = "instruction" | "instruction-primary" | "header-document" | "header-group";

interface Props {
  variant: Variant;
  as?: string;
}

const props = withDefaults(defineProps<Props>(), {
  as: undefined,
});

const variantClasses: Record<Variant, string> = {
  "instruction": "instruction",
  "instruction-primary": "instruction instruction-primary",
  "header-document": "header header-document",
  "header-group": "header header-group",
};

const defaultTags: Record<Variant, string> = {
  "instruction": "p",
  "instruction-primary": "p",
  "header-document": "h1",
  "header-group": "h2",
};

const resolvedTag = computed(() => props.as || defaultTags[props.variant]);
const resolvedClass = computed(() => variantClasses[props.variant]);
</script>

<template>
  <component :is="resolvedTag" :class="resolvedClass">
    <slot />
  </component>
</template>

<style scoped>
a{color:#06c;text-decoration:none}a:focus-visible{outline:1px dotted #06c}a:focus,a:hover{color:#39f;text-decoration:underline}.instruction{color:#000;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;font-weight:400;margin:0 0 20px}.instruction-primary{color:#039;font-size:12pt}.header{font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;font-weight:400}.header-document{color:#000;font-family:Calibri,Noto Sans,sans-serif;font-size:17pt}.header-group{color:#039;font-size:11pt}
</style>
