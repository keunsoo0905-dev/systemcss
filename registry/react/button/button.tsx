import React from "react";
import styles from "../css/button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary";
}

export function Button({
  variant = "default",
  className,
  children,
  ...props
}: ButtonProps) {
  const classNames = [
    styles.button,
    variant === "primary" ? styles.primary : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classNames} {...props}>
      {children}
    </button>
  );
}
