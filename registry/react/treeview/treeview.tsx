// registry/react/treeview/treeview.tsx
import React, { createContext, useContext } from "react";
import styles from "../css/treeview.module.css";

type TreeViewVariant = "default" | "container" | "collapse-button" | "connector";

interface TreeViewContextValue {
  variants: TreeViewVariant[];
}

export const TreeViewContext = createContext<TreeViewContextValue>({
  variants: ["default"],
});

export function useTreeViewContext() {
  return useContext(TreeViewContext);
}

interface TreeViewProps extends React.HTMLAttributes<HTMLUListElement> {
  variant?: TreeViewVariant | TreeViewVariant[];
}

export function TreeView({
  variant = "default",
  className,
  children,
  ...props
}: TreeViewProps) {
  const variants = Array.isArray(variant) ? variant : [variant];

  const variantClassMap: Record<TreeViewVariant, string> = {
    default: "",
    container: styles.hasContainer,
    "collapse-button": styles.hasCollapseButton,
    connector: styles.hasConnector,
  };

  const classNames = [
    styles.treeView,
    ...variants.map((v) => variantClassMap[v]).filter(Boolean),
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <TreeViewContext.Provider value={{ variants }}>
      <ul className={classNames} {...props}>
        {children}
      </ul>
    </TreeViewContext.Provider>
  );
}
