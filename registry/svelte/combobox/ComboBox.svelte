<!-- registry/svelte/combobox/ComboBox.svelte -->
<script lang="ts">
  import type { Snippet } from "svelte";

  interface ComboBoxOption {
    value: string;
    label: string;
    disabled?: boolean;
  }

  interface Props {
    options: ComboBoxOption[];
    value?: string;
    onValueChange?: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    class?: string;
  }

  let {
    options,
    value = $bindable(),
    onValueChange,
    placeholder,
    disabled = false,
    class: className,
  }: Props = $props();

  let isOpen = $state(false);
  let inputValue = $state("");
  let highlightedIndex = $state(-1);
  let wrapperEl: HTMLDivElement | undefined = $state();

  // controlled value 동기화
  $effect(() => {
    if (value != null) {
      const match = options.find((o) => o.value === value);
      inputValue = match ? match.label : "";
    }
  });

  const filteredOptions = $derived(() => {
    if (!inputValue) return options;
    const lower = inputValue.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(lower));
  });

  function handleClickOutside(e: MouseEvent) {
    if (wrapperEl && !wrapperEl.contains(e.target as Node)) {
      isOpen = false;
    }
  }

  $effect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  });

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    inputValue = target.value;
    isOpen = true;
    highlightedIndex = -1;
  }

  function handleSelect(opt: ComboBoxOption) {
    inputValue = opt.label;
    value = opt.value;
    isOpen = false;
    onValueChange?.(opt.value);
  }

  function handleToggle() {
    if (!disabled) {
      isOpen = !isOpen;
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    const filtered = filteredOptions();
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        isOpen = true;
        return;
      }
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        highlightedIndex = highlightedIndex < filtered.length - 1
          ? highlightedIndex + 1
          : highlightedIndex;
        break;
      case "ArrowUp":
        e.preventDefault();
        highlightedIndex = highlightedIndex > 0
          ? highlightedIndex - 1
          : highlightedIndex;
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
          handleSelect(filtered[highlightedIndex]);
        }
        break;
      case "Escape":
        isOpen = false;
        break;
    }
  }
</script>

<div
  bind:this={wrapperEl}
  class="win7-combobox {className ?? ''}"
>
  <input
    type="text"
    role="combobox"
    aria-expanded={isOpen}
    aria-autocomplete="list"
    aria-haspopup="listbox"
    value={inputValue}
    oninput={handleInput}
    onkeydown={handleKeyDown}
    {placeholder}
    {disabled}
  />
  <button
    type="button"
    aria-label="toggle"
    tabindex={-1}
    class="win7-combobox-toggle"
    onclick={handleToggle}
    {disabled}
  ></button>
  {#if isOpen && filteredOptions().length > 0}
    <ul role="listbox" class="win7-combobox-listbox">
      {#each filteredOptions() as opt, index (opt.value)}
        <li
          role="option"
          aria-selected={highlightedIndex === index}
          class:highlighted={highlightedIndex === index}
          onmousedown={(e) => { e.preventDefault(); handleSelect(opt); }}
          onmouseenter={() => { highlightedIndex = index; }}
        >
          {opt.label}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
/* registry/css/combobox.css */
/* 7.css 원본 기반 — .combobox 컴포지트 스타일 */

.win7-combobox {
  display: inline-block;
  position: relative;
}

.win7-combobox input[type="text"] {
  padding-right: 20px;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #8e8f8f;
  border-radius: 3px;
  font: 9pt "Segoe UI", SegoeUI, "Noto Sans", sans-serif;
  color: #222;
  padding: 2px 30px 2px 3px;
}

.win7-combobox input[type="text"]:focus {
  box-shadow: inset 0 0 0 2px #98d1ef;
  outline: 1px dotted #000;
  outline-offset: -4px;
}

.win7-combobox-toggle {
  background: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTExIDZINHYxaDF2MWgxdjFoMXYxaDFWOWgxVjhoMVY3aDFWNloiIGZpbGw9IiMwMDAiLz48L3N2Zz4=")
    50% no-repeat,
    linear-gradient(#f2f2f2 45%, #ebebeb 0, #cfcfcf);
  min-width: 16px;
  padding: 0;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  border: 1px solid #8e8f8f;
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
  border-bottom-right-radius: 3px;
  border-top-right-radius: 3px;
  cursor: pointer;
}

.win7-combobox-toggle:hover {
  background: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTExIDZINHYxaDF2MWgxdjFoMXYxaDFWOWgxVjhoMVY3aDFWNloiIGZpbGw9IiMwMDAiLz48L3N2Zz4=")
    50% no-repeat,
    linear-gradient(#eaf6fd 45%, #bee6fd 0, #a7d9f5);
  border-color: #3c7fb1;
}

.win7-combobox-toggle:active {
  background: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTExIDZINHYxaDF2MWgxdjFoMXYxaDFWOWgxVjhoMVY3aDFWNloiIGZpbGw9IiMwMDAiLz48L3N2Zz4=")
    50% no-repeat,
    linear-gradient(#e5f4fc, #c4e5f6 30% 50%, #98d1ef 50%, #68b3db);
  border-color: #6d91ab;
}

.win7-combobox-toggle:focus {
  box-shadow: none;
  outline: none;
}

.win7-combobox-listbox {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #fff;
  border: 1px solid #c0c1cd;
  max-height: 200px;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 0;
  font: 9pt "Segoe UI", SegoeUI, "Noto Sans", sans-serif;
}

.win7-combobox-listbox li {
  padding: 2px 4px;
  cursor: default;
}

.win7-combobox-listbox li:hover,
.win7-combobox-listbox li[aria-selected="true"] {
  background-color: #2a90ff;
  color: #fff;
}

.win7-combobox-listbox li.highlighted {
  background-color: #2a90ff;
  color: #fff;
}

.win7-combobox:has(input:disabled) .win7-combobox-toggle {
  background: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTExIDZINHYxaDF2MWgxdjFoMXYxaDFWOWgxVjhoMVY3aDFWNloiIGZpbGw9IiM4MzgzODMiLz48L3N2Zz4=")
    #f4f4f4;
  border-color: #adb2b5;
  pointer-events: none;
}
</style>
