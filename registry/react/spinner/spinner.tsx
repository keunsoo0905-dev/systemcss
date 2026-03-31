// registry/react/spinner/spinner.tsx
import React from "react";
import styles from "../css/spinner.module.css";

type SpinnerSize = "small" | "default" | "large";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  animate?: boolean;
  size?: SpinnerSize;
}

export function Spinner({
  animate = false,
  size = "default",
  className,
  ...props
}: SpinnerProps) {
  const classNames = [
    styles.spinner,
    animate ? styles.animate : "",
    size !== "default" ? styles[size] : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return <div role="status" className={classNames} {...props} />;
}
