import React from "react";
import { useTabsContext } from "./tabs-context";
import styles from "../css/tabs.module.css";

interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function Tab({ value, disabled, className, children, ...props }: TabProps) {
  const { activeValue, onSelect } = useTabsContext();
  const isSelected = activeValue === value;

  const handleClick = () => {
    if (!disabled) {
      onSelect(value);
    }
  };

  return (
    <button
      role="tab"
      aria-selected={isSelected}
      aria-controls={`tabpanel-${value}`}
      id={`tab-${value}`}
      disabled={disabled}
      className={`${styles.tab} ${className ?? ""}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

Tab.displayName = "Tab";
