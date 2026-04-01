<!-- registry/svelte/treeview/TreeItem.js.svelte -->
<script>
  import { getTreeViewContext } from "./TreeView.js.svelte";

  /**
   * @type {{ label: string, open?: boolean, collapsible?: boolean, children?: import("svelte").Snippet }}
   */
  let { label, open = false, collapsible, children } = $props();

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
        {@render children()}
      </ul>
    </details>
  </li>
{:else if hasChildren}
  <li>
    {label}
    <ul>
      {@render children()}
    </ul>
  </li>
{:else}
  <li>{label}</li>
{/if}
