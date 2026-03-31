import React from "react";
import styles from "../css/textbox.module.css";

export function TextBox({ multiline = false, className, type = "text", ...rest }) {
  if (multiline) {
    return (
      <textarea
        className={`${styles.textbox} ${className ?? ""}`}
        {...rest}
      />
    );
  }

  return (
    <input
      type={type}
      className={`${styles.textbox} ${className ?? ""}`}
      {...rest}
    />
  );
}
