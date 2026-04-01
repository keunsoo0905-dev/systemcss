import React from "react";
import { Window } from "./window";
import { TitleBar } from "./title-bar";
import { WindowBody } from "./window-body";

type ControlButton = "close" | "help";

interface DialogBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  controls?: ControlButton[];
  hasSpace?: boolean;
  onClose?: () => void;
  onHelp?: () => void;
}

export function DialogBox({
  title,
  controls = ["close"],
  hasSpace = true,
  onClose,
  onHelp,
  className,
  children,
  ...props
}: DialogBoxProps) {
  return (
    <Window role="dialog" className={className} {...props}>
      <TitleBar
        title={title}
        controls={controls}
        onClose={onClose}
        onHelp={onHelp}
      />
      <WindowBody hasSpace={hasSpace}>{children}</WindowBody>
    </Window>
  );
}
