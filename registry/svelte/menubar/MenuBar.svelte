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
/* registry/css/menubar.css — 7.css menubar 원본 */
ul[role=menubar] {
  background: linear-gradient(#fff 20%, #f1f4fa 25%, #f1f4fa 43%, #d4dbee 48%, #e6eaf6);
  cursor: default;
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

ul[role=menubar] > [role=menuitem] {
  padding: 6px 10px;
  position: relative;
}

ul[role=menubar] > [role=menuitem]:focus,
ul[role=menubar] > [role=menuitem]:hover {
  background: #39f;
  color: #fff;
  outline: none;
}

ul[role=menubar] > [role=menuitem]:focus-visible {
  outline: 1px dotted #fff;
  outline-offset: -2px;
}

ul[role=menubar] > [role=menuitem] > ul[role=menu] {
  display: none;
  left: 0;
  position: absolute;
  top: 100%;
  z-index: 100;
}

ul[role=menubar] > [role=menuitem]:hover > ul[role=menu],
ul[role=menubar] > [role=menuitem]:focus-within > ul[role=menu] {
  display: block;
}
</style>
