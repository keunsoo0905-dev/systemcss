<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    class?: string;
    children?: Snippet;
  }

  let { class: className, children }: Props = $props();
</script>

<ul role="menubar" class={["menubar", className].filter(Boolean).join(" ")}>
  {#if children}
    {@render children()}
  {/if}
</ul>

<style>
  /* inject-css.ts 가 registry/css/menubar.css 내용을 여기에 자동 주입 */
</style>
