<script lang="ts">
  import MenuBar from "../MenuBar.svelte";
  import MenuBarItem from "../MenuBarItem.svelte";
  import Menu from "../../menu/Menu.svelte";
  import MenuItem from "../../menu/MenuItem.svelte";
</script>

<MenuBar>
  <MenuBarItem label="File">
    <Menu>
      <MenuItem>New</MenuItem>
    </Menu>
  </MenuBarItem>
  <MenuBarItem label="Edit">
    <Menu>
      <MenuItem>Undo</MenuItem>
    </Menu>
  </MenuBarItem>
</MenuBar>
