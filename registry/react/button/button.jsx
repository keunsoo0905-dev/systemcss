import React from "react";
import styles from "../css/button.module.css";

export function Button({
  variant = "default",
  className,
  children,
  ...props
}) {
  const classNames = [
    styles.button,
    variant === "primary" ? styles.primary : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classNames} {...props}>
      {children}
    </button>
  );
}
