<script lang="ts">
  import Menu from "../Menu.svelte";
  import MenuItem from "../MenuItem.svelte";
  import MenuSeparator from "../MenuSeparator.svelte";

  let { showSeparator = false }: { showSeparator?: boolean } = $props();
</script>

<Menu>
  <MenuItem>File</MenuItem>
  {#if showSeparator}
    <MenuSeparator />
  {/if}
  <MenuItem>Edit</MenuItem>
</Menu>
