import React from "react";
import styles from "../css/scrollbar.module.css";

type ScrollDirection = "vertical" | "horizontal" | "both";

interface ScrollbarProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: ScrollDirection;
}

function getOverflowStyle(direction: ScrollDirection): React.CSSProperties {
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
}: ScrollbarProps) {
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
