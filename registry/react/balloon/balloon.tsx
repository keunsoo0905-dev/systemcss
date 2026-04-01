import React from "react";

interface BalloonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 말풍선 화살표 방향: bottom(화살표 위 = 기본), top(화살표 아래) */
  position?: "top" | "bottom";
  /** 화살표 수평 정렬 */
  arrowAlign?: "left" | "right";
}

export function Balloon({
  position = "bottom",
  arrowAlign = "left",
  className,
  children,
  ...props
}: BalloonProps) {
  const classNames = [
    position === "top" ? "is-top" : "",
    arrowAlign === "right" ? "is-right" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div role="tooltip" className={classNames || undefined} {...props}>
      {children}
    </div>
  );
}
