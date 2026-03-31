import React from "react";
import styles from "../css/menubar.module.css";

interface MenuBarProps extends React.HTMLAttributes<HTMLUListElement> {
  className?: string;
}

export function MenuBar({ className, children, ...props }: MenuBarProps) {
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
