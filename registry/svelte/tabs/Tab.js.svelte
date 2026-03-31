<script>
  import { getContext } from "svelte";

  /** @type {{ value: string, disabled?: boolean, class?: string, children?: import('svelte').Snippet }} */
  let { value, disabled = false, class: className, children } = $props();

  const ctx = getContext("tabs");

  let isSelected = $derived(ctx.activeValue === value);

  function handleClick() {
    if (!disabled) {
      ctx.onSelect(value);
    }
  }
</script>

<button
  role="tab"
  aria-selected={isSelected}
  aria-controls={`tabpanel-${value}`}
  id={`tab-${value}`}
  {disabled}
  class={["tab", className].filter(Boolean).join(" ")}
  onclick={handleClick}
>
  {#if children}
    {@render children()}
  {/if}
</button>
