import React from "react";
import styles from "../css/collapse.module.css";

export function Collapse({
  summary,
  defaultOpen,
  open: controlledOpen,
  onToggle,
  className,
  children,
  ...props
}) {
  const isControlled = controlledOpen !== undefined;

  const handleToggle = (e) => {
    const details = e.currentTarget;
    onToggle?.(details.open);

    if (isControlled && details.open !== controlledOpen) {
      details.open = controlledOpen;
    }
  };

  return (
    <details
      open={isControlled ? controlledOpen : defaultOpen}
      onToggle={handleToggle}
      className={`${styles.details} ${className ?? ""}`}
      {...props}
    >
      <summary className={styles.summary}>{summary}</summary>
      {children}
    </details>
  );
}
