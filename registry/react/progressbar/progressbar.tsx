import React from "react";
import styles from "../css/progressbar.module.css";

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  min?: number;
  max?: number;
  state?: "normal" | "paused" | "error";
  animate?: boolean;
  marquee?: boolean;
  className?: string;
}

export function ProgressBar({
  value = 0,
  min = 0,
  max = 100,
  state = "normal",
  animate = false,
  marquee = false,
  className,
  ...props
}: ProgressBarProps) {
  const clampedValue = Math.min(Math.max(value, min), max);
  const percentage = ((clampedValue - min) / (max - min)) * 100;

  const barClass = [
    styles.progressbar,
    state === "paused" ? styles.paused : "",
    state === "error" ? styles.error : "",
    animate ? styles.animate : "",
    marquee ? styles.marquee : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      role="progressbar"
      aria-valuenow={marquee ? undefined : clampedValue}
      aria-valuemin={min}
      aria-valuemax={max}
      className={barClass}
      {...props}
    >
      {!marquee && <div style={{ width: `${percentage}%` }} />}
    </div>
  );
}
