import React from "react";
import styles from "../css/menubar.module.css";

interface MenuBarItemProps {
  label: string;
  className?: string;
  children?: React.ReactNode;
}

export function MenuBarItem({ label, className, children }: MenuBarItemProps) {
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
