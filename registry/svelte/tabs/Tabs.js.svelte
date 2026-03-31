<script>
  import { setContext } from "svelte";

  /** @type {{ defaultValue?: string, value?: string, onValueChange?: (value: string) => void, justified?: boolean, class?: string, children?: import('svelte').Snippet }} */
  let {
    defaultValue = "",
    value: controlledValue,
    onValueChange,
    justified = false,
    class: className,
    children,
  } = $props();

  let uncontrolledValue = $state(defaultValue);

  let activeValue = $derived(controlledValue !== undefined ? controlledValue : uncontrolledValue);

  function onSelect(val) {
    if (controlledValue === undefined) {
      uncontrolledValue = val;
    }
    onValueChange?.(val);
  }

  setContext("tabs", {
    get activeValue() { return activeValue; },
    onSelect,
  });
</script>

<menu role="tablist" class={["tablist", justified && "justified", className].filter(Boolean).join(" ")}>
  {@render children?.()}
</menu>

<style>
  /* inject-css.ts 가 registry/css/tabs.css 내용을 여기에 자동 주입 */
</style>
