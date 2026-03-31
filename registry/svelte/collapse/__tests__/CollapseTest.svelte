<script lang="ts">
  import Collapse from "../Collapse.svelte";

  let { summary = "Toggle", defaultOpen = false }: { summary?: string; defaultOpen?: boolean } = $props();
</script>

<Collapse {summary} {defaultOpen}>
  <p>Collapsible content</p>
</Collapse>
