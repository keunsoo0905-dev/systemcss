import React from "react";
import styles from "../css/groupbox.module.css";

interface GroupBoxProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  legend?: string;
}

export function GroupBox({ legend, className, children, ...props }: GroupBoxProps) {
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
