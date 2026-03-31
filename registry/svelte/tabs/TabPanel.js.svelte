<script>
  import { getContext } from "svelte";

  /** @type {{ value: string, class?: string, children?: import('svelte').Snippet }} */
  let { value, class: className, children } = $props();

  const ctx = getContext("tabs");

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
