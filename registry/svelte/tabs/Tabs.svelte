<script lang="ts">
  import type { Snippet } from "svelte";
  import { setContext } from "svelte";

  interface Props {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    justified?: boolean;
    class?: string;
    children?: Snippet;
  }

  let {
    defaultValue = "",
    value: controlledValue,
    onValueChange,
    justified = false,
    class: className,
    children,
  }: Props = $props();

  let uncontrolledValue = $state(defaultValue);

  let activeValue = $derived(controlledValue !== undefined ? controlledValue : uncontrolledValue);

  function onSelect(val: string) {
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
