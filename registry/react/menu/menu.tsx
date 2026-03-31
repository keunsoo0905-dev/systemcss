import React from "react";
import styles from "../css/menu.module.css";

interface MenuProps extends React.HTMLAttributes<HTMLUListElement> {
  className?: string;
}

export function Menu({ className, children, ...props }: MenuProps) {
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
