// registry/react/treeview/tree-item.jsx
import React from "react";
import { useTreeViewContext } from "./treeview";

/**
 * @param {Object} props
 * @param {string} props.label
 * @param {boolean} [props.open=false]
 * @param {React.ReactNode} [props.children]
 */
export function TreeItem({ label, open = false, children }) {
  const { variant } = useTreeViewContext();
  const hasChildren = React.Children.count(children) > 0;

  if (variant === "collapse-button" && hasChildren) {
    return (
      <li>
        <details open={open}>
          <summary>{label}</summary>
          <ul>{children}</ul>
        </details>
      </li>
    );
  }

  if (hasChildren) {
    return (
      <li>
        {label}
        <ul>{children}</ul>
      </li>
    );
  }

  return <li>{label}</li>;
}
