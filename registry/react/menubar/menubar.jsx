import React from "react";
import styles from "../css/menubar.module.css";

export function MenuBar({ className, children, ...props }) {
  return (
    <ul
      role="menubar"
      className={`${styles.menubar} ${className ?? ""}`}
      {...props}
    >
      {children}
    </ul>
  );
}
