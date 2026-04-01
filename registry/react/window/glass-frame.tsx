import React from "react";
import { Window } from "./window";
import { TitleBar } from "./title-bar";
import { WindowBody } from "./window-body";

type ControlButton = "minimize" | "maximize" | "close";

interface GlassFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  controls?: ControlButton[];
  hasSpace?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

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
}: GlassFrameProps) {
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
