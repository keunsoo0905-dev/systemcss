import React from "react";
import styles from "../css/window.module.css";

interface WindowProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass";
}

export function Window({
  variant = "default",
  className,
  children,
  ...props
}: WindowProps) {
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
