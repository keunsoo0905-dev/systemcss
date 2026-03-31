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
/* registry/css/tabs.css — 7.css tabs 원본 */
menu[role=tablist] {
  display: flex;
  list-style-type: none;
  margin: 0 0 -2px;
  padding-left: 3px;
  position: relative;
  text-indent: 0;
}

menu[role=tablist] button {
  border-radius: 0;
  color: #222;
  display: block;
  min-width: unset;
  padding: 2px 6px;
  text-decoration: none;
  z-index: 1;
}

menu[role=tablist] button[aria-selected=true] {
  background: #fff;
  border-bottom: 0;
  box-shadow: none;
  margin: -2px 0 1px -3px;
  padding-bottom: 4px;
  position: relative;
  z-index: 8;
}

menu[role=tablist] button[aria-selected=true]:after,
menu[role=tablist] button[aria-selected=true]:before {
  content: none;
}

menu[role=tablist] button[aria-selected=true]:hover {
  border-color: #8e8f8f;
}

menu[role=tablist] button[aria-selected=true].active,
menu[role=tablist] button[aria-selected=true]:active,
menu[role=tablist] button[aria-selected=true]:focus {
  -webkit-animation: none;
  animation: none;
  border-color: #8e8f8f;
}

menu[role=tablist] button[aria-selected=true]:focus-visible {
  outline: 1px dotted #222;
  outline-offset: -4px;
}

menu[role=tablist] button:before {
  border-radius: 0;
}

menu[role=tablist] button:after {
  content: none;
}

menu[role=tablist] button:disabled {
  opacity: 0.6;
}

menu[role=tablist].justified button {
  flex-grow: 1;
  text-align: center;
}

[role=tabpanel] {
  background: #fff;
  border: 1px solid #8e8f8f;
  clear: both;
  margin-bottom: 9px;
  padding: 14px;
  position: relative;
  z-index: 2;
}
</style>
