// registry/react/treeview/treeview.jsx
import React, { createContext, useContext } from "react";
import styles from "../css/treeview.module.css";

/** @type {React.Context<{ variants: string[] }>} */
export const TreeViewContext = createContext({ variants: ["default"] });

export function useTreeViewContext() {
  return useContext(TreeViewContext);
}

/**
 * @param {Object} props
 * @param {("default" | "container" | "collapse-button" | "connector") | ("default" | "container" | "collapse-button" | "connector")[]} [props.variant="default"]
 * @param {string} [props.className]
 * @param {React.ReactNode} [props.children]
 */
export function TreeView({
  variant = "default",
  className,
  children,
  ...props
}) {
  const variants = Array.isArray(variant) ? variant : [variant];

  const variantClassMap = {
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
