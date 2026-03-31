<script>
  /** @type {{ class?: string, children?: import('svelte').Snippet }} */
  let { class: className, children } = $props();
</script>

<ul role="menu" class={["menu", className].filter(Boolean).join(" ")}>
  {#if children}
    {@render children()}
  {/if}
</ul>

<style>
  /* inject-css.ts 가 registry/css/menu.css 내용을 여기에 자동 주입 */
</style>
