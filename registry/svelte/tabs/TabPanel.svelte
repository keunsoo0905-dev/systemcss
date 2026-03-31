<script lang="ts">
  import type { Snippet } from "svelte";
  import { getContext } from "svelte";

  interface Props {
    value: string;
    class?: string;
    children?: Snippet;
  }

  let { value, class: className, children }: Props = $props();

  const ctx = getContext<{ activeValue: string }>("tabs");

  let isActive = $derived(ctx.activeValue === value);
</script>

<div
  role="tabpanel"
  id={`tabpanel-${value}`}
  aria-labelledby={`tab-${value}`}
  hidden={!isActive}
  class={["tabpanel", className].filter(Boolean).join(" ")}
>
  {#if children}
    {@render children()}
  {/if}
</div>
