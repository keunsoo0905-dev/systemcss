<!-- registry/vue/treeview/TreeItem.vue -->
<script setup lang="ts">
import { inject, useSlots, type Ref } from "vue";

type TreeViewVariant = "default" | "container" | "collapse-button" | "connector";

interface Props {
  label: string;
  open?: boolean;
  collapsible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  collapsible: undefined,
});

const variants = inject<Ref<TreeViewVariant[]>>("treeViewVariants");
const slots = useSlots();
const hasChildren = !!slots.default;
const isCollapseButton = variants?.value?.includes("collapse-button") ?? false;
const shouldCollapse = (props.collapsible ?? isCollapseButton) && hasChildren;
</script>

<template>
  <!-- collapsible + 자식 있음 -->
  <li v-if="shouldCollapse">
    <details :open="props.open">
      <summary>{{ props.label }}</summary>
      <ul>
        <slot />
      </ul>
    </details>
  </li>

  <!-- 일반 + 자식 있음 -->
  <li v-else-if="hasChildren">
    {{ props.label }}
    <ul>
      <slot />
    </ul>
  </li>

  <!-- 리프 노드 -->
  <li v-else>{{ props.label }}</li>
</template>
