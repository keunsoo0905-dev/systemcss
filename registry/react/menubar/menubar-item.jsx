import React from "react";
import styles from "../css/menubar.module.css";

export function MenuBarItem({ label, className, children }) {
  return (
    <li
      role="menuitem"
      tabIndex={0}
      className={`${styles.menubarItem} ${className ?? ""}`}
    >
      {label}
      {children}
    </li>
  );
}
