<!-- registry/vue/listview/ListView.vue -->
<script setup lang="ts">
import { ref, computed } from "vue";

export interface ListViewColumn {
  key: string;
  label: string;
  width?: number;
}

export type SortDirection = "asc" | "desc";

export interface ListViewProps {
  columns: ListViewColumn[];
  data: Record<string, any>[];
  sortKey?: string;
  sortDirection?: SortDirection;
  hasShadow?: boolean;
}

const props = withDefaults(defineProps<ListViewProps>(), {
  sortKey: undefined,
  sortDirection: "asc",
  hasShadow: false,
});

const emit = defineEmits<{
  sort: [key: string, direction: SortDirection];
  rowSelect: [index: number, row: Record<string, any>];
}>();

const internalSortKey = ref<string | undefined>(props.sortKey);
const internalSortDirection = ref<SortDirection>(props.sortDirection ?? "asc");
const selectedRowIndex = ref<number | null>(null);

const activeSortKey = computed(() => props.sortKey ?? internalSortKey.value);
const activeSortDirection = computed(
  () => props.sortDirection ?? internalSortDirection.value
);

function handleHeaderClick(key: string) {
  let nextDirection: SortDirection = "asc";
  if (activeSortKey.value === key) {
    nextDirection = activeSortDirection.value === "asc" ? "desc" : "asc";
  }
  internalSortKey.value = key;
  internalSortDirection.value = nextDirection;
  emit("sort", key, nextDirection);
}

function handleRowClick(index: number) {
  selectedRowIndex.value = index;
  emit("rowSelect", index, props.data[index]);
}

const tableClass = computed(() =>
  [
    "win7-listview",
    props.hasShadow && "has-shadow",
  ]
    .filter(Boolean)
    .join(" ")
);
</script>

<template>
  <table :class="tableClass">
    <thead>
      <tr>
        <th
          v-for="col in props.columns"
          :key="col.key"
          :class="{
            highlighted: activeSortKey === col.key,
            indicator: activeSortKey === col.key,
            up: activeSortKey === col.key && activeSortDirection === 'asc',
          }"
          :style="col.width ? { width: `${col.width}px` } : undefined"
          @click="handleHeaderClick(col.key)"
        >
          {{ col.label }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(row, rowIndex) in props.data"
        :key="rowIndex"
        :class="{ highlighted: selectedRowIndex === rowIndex }"
        @click="handleRowClick(rowIndex)"
      >
        <td v-for="col in props.columns" :key="col.key">
          {{ row[col.key] }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
/* registry/css/listview.css */
/* 7.css 원본 기반 — table (listview) 스타일 */

.win7-listview {
  background-color: #fff;
  border: 1px solid #c0c1cd;
  border-collapse: collapse;
  font: 9pt "Segoe UI", SegoeUI, "Noto Sans", sans-serif;
  position: relative;
  table-layout: fixed;
  text-align: left;
  white-space: nowrap;
  width: 100%;
}

.win7-listview td,
.win7-listview th {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.win7-listview.has-shadow {
  box-shadow: 4px 4px 3px -2px #999;
}

.win7-listview > thead > tr > * {
  background: linear-gradient(180deg, #fff 45%, #fafafa 0, #f0f0f0);
  border: 1px solid #d7d7d7;
  box-sizing: border-box;
  cursor: default;
  font-weight: 400;
  height: 22px;
  padding: 0 8px;
  position: sticky;
  top: 0;
}

.win7-listview > thead > tr > .highlighted {
  background: linear-gradient(180deg, #f3f9fc 45%, #e4f0f8 0, #d9eaf5);
  border: 1px solid #a7d8f5;
  border-radius: 3px;
}

.win7-listview > thead > tr > .highlighted:not(:last-child) {
  border-right-color: #a7d8f5;
}

.win7-listview > thead > tr > .highlighted.indicator::before {
  background: linear-gradient(to bottom right, #667f91 45%, #90c1e2 65%, #cce3f2);
  clip-path: polygon(0 0, 50% 100%, 100% 0);
  content: "";
  height: 5px;
  position: absolute;
  right: 50%;
  top: 0;
  width: 6px;
}

.win7-listview > thead > tr > .highlighted.indicator.up::before {
  clip-path: polygon(0 100%, 50% 0, 100% 100%);
}

.win7-listview > tbody > tr {
  cursor: default;
}

.win7-listview > tbody > tr.highlighted {
  background: linear-gradient(#fff9, #e6ecf5cc 90%, #fffc);
  border: 1px solid #aaddfa;
  border-radius: 3px;
}

.win7-listview > tbody > tr.highlighted > :not(:last-child) {
  border-right: none;
}

.win7-listview > tbody > tr > * {
  height: 14px;
  padding: 2px 8px;
}

.win7-listview > tbody > tr > :not(:last-child) {
  border-right: 1px solid #eee;
}
</style>
