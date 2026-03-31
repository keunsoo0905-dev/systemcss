// registry/react/treeview/treeview.tsx
import React, { createContext, useContext } from "react";
import styles from "../css/treeview.module.css";

type TreeViewVariant = "default" | "container" | "collapse-button" | "connector";

interface TreeViewContextValue {
  variant: TreeViewVariant;
}

export const TreeViewContext = createContext<TreeViewContextValue>({
  variant: "default",
});

export function useTreeViewContext() {
  return useContext(TreeViewContext);
}

interface TreeViewProps extends React.HTMLAttributes<HTMLUListElement> {
  variant?: TreeViewVariant;
}

export function TreeView({
  variant = "default",
  className,
  children,
  ...props
}: TreeViewProps) {
  const variantClass = {
    default: "",
    container: styles.hasContainer,
    "collapse-button": styles.hasCollapseButton,
    connector: styles.hasConnector,
  }[variant];

  const classNames = [styles.treeView, variantClass, className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <TreeViewContext.Provider value={{ variant }}>
      <ul className={classNames} {...props}>
        {children}
      </ul>
    </TreeViewContext.Provider>
  );
}
