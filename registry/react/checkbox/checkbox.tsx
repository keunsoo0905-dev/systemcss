import React, { useId } from "react";
import styles from "../css/checkbox.module.css";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

export function Checkbox({ label, className, id, ...props }: CheckboxProps) {
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
