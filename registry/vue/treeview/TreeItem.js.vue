<!-- registry/vue/treeview/TreeItem.js.vue -->
<script setup>
import { inject, useSlots } from "vue";

const props = defineProps({
  label: { type: String, required: true },
  open: { type: Boolean, default: false },
  collapsible: { type: Boolean, default: undefined },
});

const variants = inject("treeViewVariants");
const slots = useSlots();
const hasChildren = !!slots.default;
const isCollapseButton = variants?.value?.includes("collapse-button") ?? false;
const shouldCollapse = (props.collapsible ?? isCollapseButton) && hasChildren;
</script>

<template>
  <li v-if="shouldCollapse">
    <details :open="props.open">
      <summary>{{ props.label }}</summary>
      <ul>
        <slot />
      </ul>
    </details>
  </li>

  <li v-else-if="hasChildren">
    {{ props.label }}
    <ul>
      <slot />
    </ul>
  </li>

  <li v-else>{{ props.label }}</li>
</template>
