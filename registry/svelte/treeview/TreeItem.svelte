<!-- registry/svelte/treeview/TreeItem.svelte -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { getTreeViewContext } from "./TreeView.svelte";

  interface Props {
    label: string;
    open?: boolean;
    collapsible?: boolean;
    children?: Snippet;
  }

  let { label, open = false, collapsible, children }: Props = $props();

  const { variants } = getTreeViewContext();
  const hasChildren = !!children;
  const isCollapseButton = variants.includes("collapse-button");
  const shouldCollapse = (collapsible ?? isCollapseButton) && hasChildren;
</script>

{#if shouldCollapse}
  <li>
    <details {open}>
      <summary>{label}</summary>
      <ul>
        {@render children!()}
      </ul>
    </details>
  </li>
{:else if hasChildren}
  <li>
    {label}
    <ul>
      {@render children!()}
    </ul>
  </li>
{:else}
  <li>{label}</li>
{/if}
