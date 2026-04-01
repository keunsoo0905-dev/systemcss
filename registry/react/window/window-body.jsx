import React from "react";
import styles from "../css/window.module.css";

export function WindowBody({
  hasSpace = false,
  className,
  children,
  ...props
}) {
  const classNames = [
    styles["window-body"],
    hasSpace ? styles["has-space"] : "",
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
