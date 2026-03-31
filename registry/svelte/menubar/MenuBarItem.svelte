<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    label: string;
    class?: string;
    children?: Snippet;
  }

  let { label, class: className, children }: Props = $props();
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
