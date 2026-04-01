import React from "react";
import styles from "../css/window.module.css";

export function Window({
  variant = "default",
  className,
  children,
  ...props
}) {
  const classNames = [
    styles.window,
    variant === "glass" ? styles.glass : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  );
}
