import React from "react";
import styles from "../css/menu.module.css";

export function MenuItem({
  disabled = false,
  onSelect,
  submenu,
  className,
  children,
}) {
  const handleClick = () => {
    if (!disabled && onSelect) {
      onSelect();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <li
      role="menuitem"
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      className={`${styles.menuItem} ${submenu ? styles.hasSubmenu : ""} ${className ?? ""}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {children}
      {submenu}
    </li>
  );
}
