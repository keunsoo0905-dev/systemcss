<!-- registry/svelte/listbox/ListBox.js.svelte -->
<script>
  /** @typedef {{ value: string; label: string; disabled?: boolean }} ListBoxItem */

  /** @type {{ items: ListBoxItem[]; selectionMode?: "single" | "multiple"; selectedValues?: string[]; onSelectionChange?: (values: string[]) => void; hasShadow?: boolean; hasHover?: boolean; class?: string; }} */
  let {
    items,
    selectionMode = "single",
    selectedValues = $bindable([]),
    onSelectionChange,
    hasShadow = false,
    hasHover = false,
    class: className,
  } = $props();

  let focusedIndex = $state(-1);

  /** @param {string} value */
  function toggleSelection(value) {
    let next;
    if (selectionMode === "multiple") {
      next = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];
    } else {
      next = [value];
    }
    selectedValues = next;
    onSelectionChange?.(next);
  }

  /** @param {KeyboardEvent} e */
  function handleKeyDown(e) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusedIndex = focusedIndex < items.length - 1 ? focusedIndex + 1 : focusedIndex;
        break;
      case "ArrowUp":
        e.preventDefault();
        focusedIndex = focusedIndex > 0 ? focusedIndex - 1 : focusedIndex;
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < items.length) {
          toggleSelection(items[focusedIndex].value);
        }
        break;
      case "Home":
        e.preventDefault();
        focusedIndex = 0;
        break;
      case "End":
        e.preventDefault();
        focusedIndex = items.length - 1;
        break;
    }
  }
</script>

<ul
  role="listbox"
  aria-multiselectable={selectionMode === "multiple"}
  class="win7-listbox {hasShadow ? 'has-shadow' : ''} {hasHover ? 'has-hover' : ''} {className ?? ''}"
  tabindex="0"
  onkeydown={handleKeyDown}
>
  {#each items as item, index (item.value)}
    <li
      role="option"
      aria-selected={selectedValues.includes(item.value)}
      aria-disabled={item.disabled}
      class="win7-listbox-option"
      class:selected={selectedValues.includes(item.value)}
      onclick={() => !item.disabled && toggleSelection(item.value)}
    >
      {item.label}
    </li>
  {/each}
</ul>

<style>
/* registry/css/listbox.css */
/* 7.css 원본 기반 — [role=listbox] / select[multiple] 스타일 */

.win7-listbox {
  background: #fff;
  border: 1px solid #c0c1cd;
  display: block;
  font: 9pt "Segoe UI", SegoeUI, "Noto Sans", sans-serif;
  overflow-y: scroll;
  box-sizing: border-box;
}

.win7-listbox.has-shadow {
  box-shadow: 4px 4px 3px -2px #999;
}

.win7-listbox:focus {
  outline: none;
}

.win7-listbox-option {
  padding: 2px;
  cursor: default;
}

.win7-listbox.has-hover .win7-listbox-option:hover {
  background-color: #2a90ff;
  color: #fff;
}

.win7-listbox-option:focus,
.win7-listbox-option[aria-selected="true"] {
  background-color: #2a90ff;
  color: #fff;
}

.win7-listbox-option.selected {
  background-color: #2a90ff;
  color: #fff;
}
</style>
