import React from "react";
import styles from "../css/scrollbar.module.css";

function getOverflowStyle(direction) {
  switch (direction) {
    case "horizontal":
      return { overflowX: "auto", overflowY: "hidden" };
    case "both":
      return { overflow: "auto" };
    case "vertical":
    default:
      return { overflowY: "auto" };
  }
}

export function Scrollbar({
  direction = "vertical",
  className,
  style,
  children,
  ...props
}) {
  const overflowStyle = getOverflowStyle(direction);

  return (
    <div
      className={`${styles["has-scrollbar"]} ${className ?? ""}`.trim()}
      style={{ ...overflowStyle, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
