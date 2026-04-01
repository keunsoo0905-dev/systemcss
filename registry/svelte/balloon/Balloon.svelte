<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    position?: "top" | "bottom";
    arrowAlign?: "left" | "right";
  }

  let {
    position = "bottom",
    arrowAlign = "left",
    class: className,
    children,
    ...rest
  }: Props = $props();

  const positionClass = $derived(position === "top" ? "is-top" : "");
  const alignClass = $derived(arrowAlign === "right" ? "is-right" : "");
</script>

<div role="tooltip" class="{positionClass} {alignClass} {className ?? ''}" {...rest}>
  {@render children?.()}
</div>

<style>
[role=tooltip]{background:#ffffe1;border:1px solid #000;border-radius:2px;box-shadow:2px 2px 5px #0003;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;max-width:250px;padding:8px 10px;position:absolute}[role=tooltip]:after,[role=tooltip]:before{border:8px solid transparent;content:"";left:20px;position:absolute}[role=tooltip]:before{border-bottom-color:#000;top:-17px}[role=tooltip]:after{border-bottom-color:#ffffe1;top:-16px}[role=tooltip].is-top:before{border-bottom-color:transparent;border-top-color:#000;bottom:-17px;top:auto}[role=tooltip].is-top:after{border-bottom-color:transparent;border-top-color:#ffffe1;bottom:-16px;top:auto}[role=tooltip].is-right:after,[role=tooltip].is-right:before{left:auto;right:20px}
</style>
