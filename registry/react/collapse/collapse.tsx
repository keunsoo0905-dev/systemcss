import React from "react";
import styles from "../css/collapse.module.css";

interface CollapseProps extends Omit<React.DetailsHTMLAttributes<HTMLDetailsElement>, "onToggle"> {
  summary: string;
  defaultOpen?: boolean;
  open?: boolean;
  onToggle?: (open: boolean) => void;
  className?: string;
  children: React.ReactNode;
}

export function Collapse({
  summary,
  defaultOpen,
  open: controlledOpen,
  onToggle,
  className,
  children,
  ...props
}: CollapseProps) {
  const isControlled = controlledOpen !== undefined;

  const handleToggle = (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    const details = e.currentTarget;
    onToggle?.(details.open);

    if (isControlled && details.open !== controlledOpen) {
      // 제어 모드에서는 DOM 상태를 props로 강제 복원
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
