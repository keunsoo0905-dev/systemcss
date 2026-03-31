<!-- registry/vue/treeview/TreeView.vue -->
<script setup lang="ts">
import { provide } from "vue";

type TreeViewVariant = "default" | "container" | "collapse-button" | "connector";

interface Props {
  variant?: TreeViewVariant;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
});

// TreeItem 컴포넌트에 variant 전달
provide("treeViewVariant", props.variant);

const variantClasses: Record<TreeViewVariant, string> = {
  default: "",
  container: "has-container",
  "collapse-button": "has-collapse-button",
  connector: "has-connector",
};
</script>

<template>
  <ul :class="['tree-view', variantClasses[props.variant]]">
    <slot />
  </ul>
</template>

<style scoped>
/* registry/css/treeview.css — 7.css treeview 원본 */

ul.tree-view {
  display: block;
  font: 9pt Segoe UI, SegoeUI, Noto Sans, sans-serif;
  margin: 0;
  padding: 6px 6px 6px 20px;
}

ul.tree-view li {
  list-style-type: none;
  margin-top: 4px;
  position: relative;
}

ul.tree-view a {
  color: #000;
  text-decoration: none;
}

ul.tree-view ul {
  margin-top: 4px;
  padding-left: 20px;
}

/* Container 변형 */
ul.tree-view.has-container {
  background: #fff;
  border: 1px solid #8e8f8f;
}

/* Collapse Button 변형 (details/summary 기반) */
ul.tree-view.has-collapse-button details > summary::-webkit-details-marker,
ul.tree-view.has-collapse-button details > summary::marker {
  display: none;
}

ul.tree-view.has-collapse-button details > summary:before {
  background: linear-gradient(180deg, #f2f2f2 45%, #ebebeb);
  border: 1px solid #919191;
  border-radius: 1px;
  color: #4b63a7;
  content: "\002b";
  font-size: 8pt;
  font-weight: 700;
  height: 8px;
  left: -16px;
  line-height: calc(12px - 50%);
  margin: 0;
  right: unset;
  text-align: center;
  top: calc(50% - 4px);
  width: 8px;
}

ul.tree-view.has-collapse-button details[open] > summary:before {
  content: "\2013";
  transform: none;
}

/* Connector 변형 (점선 연결선) */
ul.tree-view.has-connector ul {
  position: relative;
}

ul.tree-view.has-connector ul:before {
  border-left: 1px dotted #000;
  content: "";
  height: calc(100% - 8px);
  left: 8px;
  position: absolute;
  top: 0;
}

ul.tree-view.has-connector ul li:before {
  border-bottom: 1px dotted #000;
  content: "";
  position: absolute;
  right: calc(100% + 2px);
  top: 8px;
  width: 10px;
}
</style>
