import React from "react";
import styles from "../css/window.module.css";

interface StatusBarProps extends React.HTMLAttributes<HTMLDivElement> {
  fields: string[];
}

export function StatusBar({ fields, className, ...props }: StatusBarProps) {
  return (
    <div
      className={`${styles["status-bar"]} ${className ?? ""}`.trim()}
      {...props}
    >
      {fields.map((field, index) => (
        <p key={index} className={styles["status-bar-field"]}>
          {field}
        </p>
      ))}
    </div>
  );
}
