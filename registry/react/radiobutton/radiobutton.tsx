import React, { useId } from "react";
import styles from "../css/radiobutton.module.css";

interface RadioButtonProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

export function RadioButton({ label, className, id, ...props }: RadioButtonProps) {
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
