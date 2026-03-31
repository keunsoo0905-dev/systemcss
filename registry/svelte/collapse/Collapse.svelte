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
/* registry/css/collapse.css — 7.css collapse 원본 */
details {
  margin-top: 0;
}

details > summary {
  cursor: pointer;
  display: inline;
  margin-bottom: 0;
  position: relative;
}

details > summary:before {
  border: 5px solid transparent;
  border-left-color: #000;
  border-radius: 3px;
  content: "";
  position: absolute;
  right: 100%;
  top: calc(50% - 5px);
}

details > summary::-webkit-details-marker,
details > summary::marker {
  display: none;
}

details[open] > summary:before {
  top: calc(50% - 2.5px);
  transform: rotate(45deg);
}
</style>
