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
