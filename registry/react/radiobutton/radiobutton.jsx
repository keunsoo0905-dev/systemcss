import React, { useId } from "react";
import styles from "../css/radiobutton.module.css";

export function RadioButton({ label, className, id, ...props }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <span className={className}>
      <input
        type="radio"
        id={inputId}
        className={styles.radio}
        {...props}
      />
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
    </span>
  );
}
