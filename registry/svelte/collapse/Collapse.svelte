<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    summary: string;
    defaultOpen?: boolean;
    open?: boolean;
    onToggle?: (open: boolean) => void;
    class?: string;
    children?: Snippet;
  }

  let {
    summary,
    defaultOpen = false,
    open: controlledOpen,
    onToggle,
    class: className,
    children,
  }: Props = $props();

  let isControlled = $derived(controlledOpen !== undefined);
  let internalOpen = $state(defaultOpen);

  let isOpen = $derived(isControlled ? controlledOpen : internalOpen);

  function handleToggle(e: Event) {
    const details = e.currentTarget as HTMLDetailsElement;
    if (!isControlled) {
      internalOpen = details.open;
    }
    onToggle?.(details.open);
  }
</script>

<details
  open={isOpen}
  ontoggle={handleToggle}
  class={["collapse", className].filter(Boolean).join(" ")}
>
  <summary>{summary}</summary>
  {#if children}
    {@render children()}
  {/if}
</details>

<style>
  /* inject-css.ts 가 registry/css/collapse.css 내용을 여기에 자동 주입 */
</style>
