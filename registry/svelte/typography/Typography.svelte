<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type Variant = "instruction" | "instruction-primary" | "header-document" | "header-group";

  interface Props extends HTMLAttributes<HTMLElement> {
    variant: Variant;
    as?: string;
  }

  let { variant, as: tag, class: className, children, ...rest }: Props = $props();

  const variantClasses: Record<Variant, string> = {
    "instruction": "instruction",
    "instruction-primary": "instruction instruction-primary",
    "header-document": "header header-document",
    "header-group": "header header-group",
  };

  const defaultTags: Record<Variant, string> = {
    "instruction": "p",
    "instruction-primary": "p",
    "header-document": "h1",
    "header-group": "h2",
  };

  const resolvedTag = $derived(tag || defaultTags[variant]);
  const resolvedClass = $derived(`${variantClasses[variant]} ${className ?? ""}`.trim());
</script>

<svelte:element this={resolvedTag} class={resolvedClass} {...rest}>
  {@render children?.()}
</svelte:element>

<style>
a{color:#06c;text-decoration:none}a:focus-visible{outline:1px dotted #06c}a:focus,a:hover{color:#39f;text-decoration:underline}.instruction{color:#000;font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;font-weight:400;margin:0 0 20px}.instruction-primary{color:#039;font-size:12pt}.header{font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif;font-weight:400}.header-document{color:#000;font-family:Calibri,Noto Sans,sans-serif;font-size:17pt}.header-group{color:#039;font-size:11pt}
</style>
