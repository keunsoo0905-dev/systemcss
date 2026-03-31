import React from "react";
import { useTabsContext } from "./tabs-context";
import styles from "../css/tabs.module.css";

interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabPanel({ value, className, children, ...props }: TabPanelProps) {
  const { activeValue } = useTabsContext();
  const isActive = activeValue === value;

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      hidden={!isActive}
      className={`${styles.tabpanel} ${className ?? ""}`}
      {...props}
    >
      {children}
    </div>
  );
}

TabPanel.displayName = "TabPanel";
