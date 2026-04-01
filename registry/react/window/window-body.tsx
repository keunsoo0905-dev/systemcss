import React from "react";
import styles from "../css/window.module.css";

interface WindowBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  hasSpace?: boolean;
}

export function WindowBody({
  hasSpace = false,
  className,
  children,
  ...props
}: WindowBodyProps) {
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
