<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    disabled?: boolean;
    onSelect?: () => void;
    hasSubmenu?: boolean;
    class?: string;
    children?: Snippet;
    submenu?: Snippet;
  }

  let {
    disabled = false,
    onSelect,
    hasSubmenu = false,
    class: className,
    children,
    submenu,
  }: Props = $props();

  function handleClick() {
    if (!disabled && onSelect) {
      onSelect();
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  }
</script>

<li
  role="menuitem"
  aria-disabled={disabled || undefined}
  tabindex={disabled ? -1 : 0}
  class={["menuItem", hasSubmenu || submenu ? "has-submenu" : "", className].filter(Boolean).join(" ")}
  onclick={handleClick}
  onkeydown={handleKeyDown}
>
  {#if children}
    {@render children()}
  {/if}
  {#if submenu}
    {@render submenu()}
  {/if}
</li>

<style>
/* registry/css/menu.css — 7.css menu 원본 */
ul[role] {
  cursor: default;
  list-style: none;
  margin: 0;
  padding: 0;
}

ul[role=menu] {
  background: #f0f0f0;
  border: 1px solid #0006;
  box-shadow: 4px 4px 3px -2px #00000080;
  color: initial;
  min-width: 150px;
  padding: 2px;
  position: relative;
}

ul[role=menu] li[role=menuitem] {
  padding: 4px 24px 4px 28px;
  position: relative;
  white-space: nowrap;
}

ul[role=menu] li[role=menuitem]:hover,
ul[role=menu] li[role=menuitem]:focus {
  background: #3399ff;
  color: #fff;
  outline: none;
}

ul[role=menu] li[role=menuitem]:focus-visible {
  outline: 1px dotted #fff;
  outline-offset: -2px;
}

ul[role=menu] li[role=menuitem][aria-disabled=true] {
  color: #a0a0a0;
  pointer-events: none;
}

ul[role=menu] li[role=menuitem][aria-disabled=true]:hover {
  background: transparent;
  color: #a0a0a0;
}

ul[role=menu] hr {
  border: 0;
  border-top: 1px solid #d6d6d6;
  margin: 2px 1px;
}

ul[role=menu] li[role=menuitem] ul[role=menu] {
  display: none;
  left: 100%;
  position: absolute;
  top: -3px;
}

ul[role=menu] li[role=menuitem]:hover > ul[role=menu],
ul[role=menu] li[role=menuitem]:focus-within > ul[role=menu] {
  display: block;
}

ul[role=menu] li[role=menuitem].has-submenu::after {
  border: 4px solid transparent;
  border-left-color: currentColor;
  content: "";
  position: absolute;
  right: 8px;
  top: calc(50% - 4px);
}
</style>
