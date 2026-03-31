// registry/react/treeview/treeview.jsx
import React, { createContext, useContext } from "react";
import styles from "../css/treeview.module.css";

/** @type {React.Context<{ variant: string }>} */
export const TreeViewContext = createContext({ variant: "default" });

export function useTreeViewContext() {
  return useContext(TreeViewContext);
}

/**
 * @param {Object} props
 * @param {"default" | "container" | "collapse-button" | "connector"} [props.variant="default"]
 * @param {string} [props.className]
 * @param {React.ReactNode} [props.children]
 */
export function TreeView({
  variant = "default",
  className,
  children,
  ...props
}) {
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
