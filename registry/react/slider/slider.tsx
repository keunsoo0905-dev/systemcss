// registry/react/slider/slider.tsx
import React from "react";
import styles from "../css/slider.module.css";

type SliderOrientation = "horizontal" | "vertical";
type SliderVariant = "default" | "box-indicator";

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  orientation?: SliderOrientation;
  variant?: SliderVariant;
}

export function Slider({
  orientation = "horizontal",
  variant = "default",
  className,
  ...props
}: SliderProps) {
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
