import React from "react";

export function Balloon({
  position = "bottom",
  arrowAlign = "left",
  className,
  children,
  ...props
}) {
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
