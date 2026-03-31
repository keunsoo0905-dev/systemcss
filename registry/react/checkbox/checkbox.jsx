import React, { useId } from "react";
import styles from "../css/checkbox.module.css";

export function Checkbox({ label, className, id, ...props }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <span className={className}>
      <input
        type="checkbox"
        id={inputId}
        className={styles.checkbox}
        {...props}
      />
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
    </span>
  );
}
