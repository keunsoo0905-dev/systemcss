import React from "react";
import styles from "../css/textbox.module.css";

interface TextBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  multiline?: false;
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  multiline: true;
}

type Props = TextBoxProps | TextAreaProps;

export function TextBox(props: Props) {
  if (props.multiline) {
    const { multiline, className, ...rest } = props;
    return (
      <textarea
        className={`${styles.textbox} ${className ?? ""}`}
        {...rest}
      />
    );
  }

  const { multiline, className, type = "text", ...rest } = props;
  return (
    <input
      type={type}
      className={`${styles.textbox} ${className ?? ""}`}
      {...rest}
    />
  );
}
