// registry/react/spinner/spinner.jsx
import React from "react";
import styles from "../css/spinner.module.css";

/**
 * @param {Object} props
 * @param {boolean} [props.animate=false]
 * @param {"small" | "default" | "large"} [props.size="default"]
 * @param {string} [props.className]
 */
export function Spinner({
  animate = false,
  size = "default",
  className,
  ...props
}) {
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
