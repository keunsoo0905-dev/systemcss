import React from "react";
import styles from "../css/window.module.css";

export function StatusBar({ fields, className, ...props }) {
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
