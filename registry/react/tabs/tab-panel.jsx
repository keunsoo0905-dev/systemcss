import React from "react";
import { useTabsContext } from "./tabs";
import styles from "../css/tabs.module.css";

export function TabPanel({ value, className, children, ...props }) {
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
