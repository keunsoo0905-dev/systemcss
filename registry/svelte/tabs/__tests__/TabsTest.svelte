<script lang="ts">
  import Tabs from "../Tabs.svelte";
  import Tab from "../Tab.svelte";
  import TabPanel from "../TabPanel.svelte";

  let { defaultValue }: { defaultValue: string } = $props();
</script>

<Tabs {defaultValue}>
  <Tab value="tab1">Tab 1</Tab>
  <Tab value="tab2">Tab 2</Tab>
  <TabPanel value="tab1">Content 1</TabPanel>
  <TabPanel value="tab2">Content 2</TabPanel>
</Tabs>
