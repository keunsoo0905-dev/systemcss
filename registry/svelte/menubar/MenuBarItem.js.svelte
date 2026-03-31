<script>
  /** @type {{ label: string, class?: string, children?: import('svelte').Snippet }} */
  let { label, class: className, children } = $props();
</script>

<li
  role="menuitem"
  tabindex={0}
  class={["menubarItem", className].filter(Boolean).join(" ")}
>
  {label}
  {#if children}
    {@render children()}
  {/if}
</li>
