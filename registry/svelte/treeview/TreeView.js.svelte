<!-- registry/svelte/treeview/TreeView.js.svelte -->
<script module>
  import { setContext, getContext } from "svelte";

  const TREE_VIEW_KEY = Symbol("tree-view");

  export function setTreeViewContext(variants) {
    setContext(TREE_VIEW_KEY, { variants });
  }

  export function getTreeViewContext() {
    return getContext(TREE_VIEW_KEY) ?? { variants: ["default"] };
  }
</script>

<script>
  /**
   * @type {{ variant?: ("default" | "container" | "collapse-button" | "connector") | ("default" | "container" | "collapse-button" | "connector")[], class?: string, children?: import("svelte").Snippet }}
   */
  let {
    variant = "default",
    class: className,
    children,
  } = $props();

  const variants = Array.isArray(variant) ? variant : [variant];
  setTreeViewContext(variants);

  const variantClasses = {
    default: "",
    container: "has-container",
    "collapse-button": "has-collapse-button",
    connector: "has-connector",
  };

  const variantClassStr = variants.map((v) => variantClasses[v]).filter(Boolean).join(" ");
</script>

<ul class="tree-view {variantClassStr} {className ?? ''}">
  {#if children}
    {@render children()}
  {/if}
</ul>

<style>
/* registry/css/treeview.css — 7.css treeview 원본 */

ul.tree-view {
  display: block;
  font: 9pt Segoe UI, SegoeUI, Noto Sans, sans-serif;
  margin: 0;
  padding: 6px 6px 6px 20px;
}

ul.tree-view li {
  list-style-type: none;
  margin-top: 4px;
  position: relative;
}

ul.tree-view a {
  color: #000;
  text-decoration: none;
}

ul.tree-view ul {
  margin-top: 4px;
  padding-left: 20px;
}

/* Container 변형 */
ul.tree-view.has-container {
  background: #fff;
  border: 1px solid #8e8f8f;
}

/* Collapsible 기본 스타일 (details/summary 삼각형 화살표) */
ul.tree-view details > summary {
  cursor: pointer;
  display: inline;
  list-style: none;
  margin-bottom: 0;
  position: relative;
}

ul.tree-view details > summary::-webkit-details-marker,
ul.tree-view details > summary::marker {
  display: none;
}

ul.tree-view details > summary:before {
  border: 4px solid transparent;
  border-left-color: #000;
  border-radius: 3px;
  content: "";
  position: absolute;
  right: 100%;
  top: calc(50% - 4px);
}

ul.tree-view details[open] > summary:before {
  top: calc(50% - 2px);
  transform: rotate(45deg);
}

/* Collapse Button 변형 (+/− 버튼으로 삼각형 오버라이드) */
ul.tree-view.has-collapse-button details > summary:before {
  background: linear-gradient(180deg, #f2f2f2 45%, #ebebeb);
  border: 1px solid #919191;
  border-radius: 1px;
  color: #4b63a7;
  content: "\002b";
  font-size: 8pt;
  font-weight: 700;
  height: 8px;
  left: -16px;
  line-height: calc(12px - 50%);
  margin: 0;
  right: unset;
  text-align: center;
  top: calc(50% - 4px);
  width: 8px;
}

ul.tree-view.has-collapse-button details[open] > summary:before {
  content: "\2013";
  transform: none;
}

/* Connector 변형 (점선 연결선) */
ul.tree-view.has-connector ul {
  position: relative;
}

ul.tree-view.has-connector ul:before {
  border-left: 1px dotted #000;
  content: "";
  height: calc(100% - 8px);
  left: 8px;
  position: absolute;
  top: 0;
}

ul.tree-view.has-connector ul li:before {
  border-bottom: 1px dotted #000;
  content: "";
  position: absolute;
  right: calc(100% + 2px);
  top: 8px;
  width: 10px;
}
</style>
