import React from "react";
import styles from "../css/menu.module.css";

export function Menu({ className, children, ...props }) {
  return (
    <ul
      role="menu"
      className={`${styles.menu} ${className ?? ""}`}
      {...props}
    >
      {children}
    </ul>
  );
}
