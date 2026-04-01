import React from "react";
import { Window } from "./window";
import { TitleBar } from "./title-bar";
import { WindowBody } from "./window-body";

export function GlassFrame({
  title,
  controls = ["minimize", "maximize", "close"],
  hasSpace = true,
  onMinimize,
  onMaximize,
  onClose,
  className,
  children,
  ...props
}) {
  return (
    <Window variant="glass" className={className} {...props}>
      <TitleBar
        title={title}
        controls={controls}
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        onClose={onClose}
      />
      <WindowBody hasSpace={hasSpace}>{children}</WindowBody>
    </Window>
  );
}
