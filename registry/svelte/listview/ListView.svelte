<!-- registry/svelte/listview/ListView.svelte -->
<script lang="ts">
  interface ListViewColumn {
    key: string;
    label: string;
    width?: number;
  }

  type SortDirection = "asc" | "desc";

  interface Props {
    columns: ListViewColumn[];
    data: Record<string, any>[];
    sortKey?: string;
    sortDirection?: SortDirection;
    onSort?: (key: string, direction: SortDirection) => void;
    onRowSelect?: (index: number, row: Record<string, any>) => void;
    hasShadow?: boolean;
    class?: string;
  }

  let {
    columns,
    data,
    sortKey = $bindable<string | undefined>(undefined),
    sortDirection = $bindable<SortDirection>("asc"),
    onSort,
    onRowSelect,
    hasShadow = false,
    class: className,
  }: Props = $props();

  let selectedRowIndex: number | null = $state(null);

  function handleHeaderClick(key: string) {
    let nextDirection: SortDirection = "asc";
    if (sortKey === key) {
      nextDirection = sortDirection === "asc" ? "desc" : "asc";
    }
    sortKey = key;
    sortDirection = nextDirection;
    onSort?.(key, nextDirection);
  }

  function handleRowClick(index: number) {
    selectedRowIndex = index;
    onRowSelect?.(index, data[index]);
  }
</script>

<table
  class="win7-listview {hasShadow ? 'has-shadow' : ''} {className ?? ''}"
>
  <thead>
    <tr>
      {#each columns as col (col.key)}
        {@const isActive = sortKey === col.key}
        <th
          class:highlighted={isActive}
          class:indicator={isActive}
          class:up={isActive && sortDirection === "asc"}
          style={col.width ? `width: ${col.width}px` : undefined}
          onclick={() => handleHeaderClick(col.key)}
        >
          {col.label}
        </th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each data as row, rowIndex}
      <tr
        class:highlighted={selectedRowIndex === rowIndex}
        onclick={() => handleRowClick(rowIndex)}
      >
        {#each columns as col (col.key)}
          <td>{row[col.key]}</td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>

<style>
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
