<script lang="ts">
  import type { Snippet } from "svelte";
  import { getContext } from "svelte";

  interface Props {
    value: string;
    disabled?: boolean;
    class?: string;
    children?: Snippet;
  }

  let { value, disabled = false, class: className, children }: Props = $props();

  const ctx = getContext<{ activeValue: string; onSelect: (v: string) => void }>("tabs");

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
