// registry/react/slider/slider.jsx
import React from "react";
import styles from "../css/slider.module.css";

/**
 * @param {Object} props
 * @param {"horizontal" | "vertical"} [props.orientation="horizontal"]
 * @param {"default" | "box-indicator"} [props.variant="default"]
 * @param {string} [props.className]
 */
export function Slider({
  orientation = "horizontal",
  variant = "default",
  className,
  ...props
}) {
  const classNames = [
    styles.slider,
    orientation === "vertical" ? styles.vertical : "",
    variant === "box-indicator" ? styles.hasBoxIndicator : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return <input type="range" className={classNames} {...props} />;
}
