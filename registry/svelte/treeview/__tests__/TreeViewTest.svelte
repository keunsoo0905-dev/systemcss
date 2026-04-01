<!-- registry/svelte/treeview/__tests__/TreeViewTest.svelte -->
<script lang="ts">
  import TreeView, { type TreeViewVariant } from "../TreeView.svelte";
  import TreeItem from "../TreeItem.svelte";

  interface Props {
    variant?: TreeViewVariant | TreeViewVariant[];
  }

  let { variant = "default" }: Props = $props();
</script>

<TreeView {variant}>
  <TreeItem label="Parent">
    <TreeItem label="Child 1" />
    <TreeItem label="Child 2" />
  </TreeItem>
  <TreeItem label="Leaf" />
</TreeView>
