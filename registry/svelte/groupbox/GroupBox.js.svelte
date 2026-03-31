<script>
  let { legend, children, class: className, ...rest } = $props();
</script>

<fieldset class="groupbox {className ?? ''}" {...rest}>
  {#if legend}
    <legend class="legend">{legend}</legend>
  {/if}
  {#if children}
    {@render children()}
  {/if}
</fieldset>

<style>
fieldset{border:1px solid #cdd7db;border-radius:3px;box-shadow:inset 0 0 0 1px #fff;margin:0;padding:8px 10px 10px}fieldset legend{font:9pt Segoe UI,SegoeUI,Noto Sans,sans-serif}.group,fieldset{display:flex;flex-direction:column;gap:6px}.group+.group{margin-top:6px}
</style>
