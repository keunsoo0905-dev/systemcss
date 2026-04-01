import React from "react";
import styles from "../css/window.module.css";

type ControlButton = "minimize" | "maximize" | "close" | "help";

interface TitleBarProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  controls?: ControlButton[];
  icon?: string;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  onHelp?: () => void;
}

const controlLabels: Record<ControlButton, string> = {
  minimize: "Minimize",
  maximize: "Maximize",
  close: "Close",
  help: "Help",
};

export function TitleBar({
  title,
  controls = ["minimize", "maximize", "close"],
  icon,
  onMinimize,
  onMaximize,
  onClose,
  onHelp,
  className,
  ...props
}: TitleBarProps) {
  const handlers: Record<ControlButton, (() => void) | undefined> = {
    minimize: onMinimize,
    maximize: onMaximize,
    close: onClose,
    help: onHelp,
  };

  return (
    <div
      className={`${styles["title-bar"]} ${className ?? ""}`.trim()}
      {...props}
    >
      {icon && (
        <img
          src={icon}
          alt=""
          className={styles["title-bar-icon"]}
          aria-hidden="true"
        />
      )}
      <div className={styles["title-bar-text"]}>{title}</div>
      <div className={styles["title-bar-controls"]}>
        {controls.map((control) => (
          <button
            key={control}
            aria-label={controlLabels[control]}
            onClick={handlers[control]}
          />
        ))}
      </div>
    </div>
  );
}
