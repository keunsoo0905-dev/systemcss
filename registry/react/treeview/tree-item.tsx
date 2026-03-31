// registry/react/treeview/tree-item.tsx
import React from "react";
import { useTreeViewContext } from "./treeview";

interface TreeItemProps {
  label: string;
  open?: boolean;
  children?: React.ReactNode;
}

export function TreeItem({ label, open = false, children }: TreeItemProps) {
  const { variant } = useTreeViewContext();
  const hasChildren = React.Children.count(children) > 0;

  // collapse-button 변형이고 자식이 있으면 details/summary 사용
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

  // 자식이 있으면 중첩 ul 렌더링
  if (hasChildren) {
    return (
      <li>
        {label}
        <ul>{children}</ul>
      </li>
    );
  }

  // 리프 노드
  return <li>{label}</li>;
}
