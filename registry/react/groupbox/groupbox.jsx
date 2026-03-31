import React from "react";
import styles from "../css/groupbox.module.css";

export function GroupBox({ legend, className, children, ...props }) {
  return (
    <fieldset
      className={`${styles.groupbox} ${className ?? ""}`}
      {...props}
    >
      {legend && <legend className={styles.legend}>{legend}</legend>}
      {children}
    </fieldset>
  );
}
