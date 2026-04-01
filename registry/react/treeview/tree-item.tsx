// registry/react/treeview/tree-item.tsx
import React from "react";
import { useTreeViewContext } from "./treeview";

interface TreeItemProps {
  label: string;
  open?: boolean;
  collapsible?: boolean;
  children?: React.ReactNode;
}

export function TreeItem({
  label,
  open = false,
  collapsible,
  children,
}: TreeItemProps) {
  const { variants } = useTreeViewContext();
  const hasChildren = React.Children.count(children) > 0;
  const isCollapseButton = variants.includes("collapse-button");
  const shouldCollapse = (collapsible ?? isCollapseButton) && hasChildren;

  if (shouldCollapse) {
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
