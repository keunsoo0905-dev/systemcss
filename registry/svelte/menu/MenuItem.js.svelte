<script>
  /** @type {{ disabled?: boolean, onSelect?: () => void, hasSubmenu?: boolean, class?: string, children?: import('svelte').Snippet, submenu?: import('svelte').Snippet }} */
  let {
    disabled = false,
    onSelect,
    hasSubmenu = false,
    class: className,
    children,
    submenu,
  } = $props();

  function handleClick() {
    if (!disabled && onSelect) {
      onSelect();
    }
  }

  function handleKeyDown(e) {
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
