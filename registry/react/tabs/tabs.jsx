import React, { useState, useCallback, createContext, useContext } from "react";
import styles from "../css/tabs.module.css";

const TabsContext = createContext(null);

export function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tab/TabPanel must be used within a Tabs component");
  }
  return context;
}

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  justified = false,
  className,
  children,
}) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? "");

  const isControlled = controlledValue !== undefined;
  const activeValue = isControlled ? controlledValue : uncontrolledValue;

  const onSelect = useCallback(
    (val) => {
      if (!isControlled) {
        setUncontrolledValue(val);
      }
      onValueChange?.(val);
    },
    [isControlled, onValueChange]
  );

  const tabs = [];
  const panels = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type.displayName === "Tab") {
      tabs.push(child);
    } else {
      panels.push(child);
    }
  });

  const tablistClass = [styles.tablist, justified ? styles.justified : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <TabsContext.Provider value={{ activeValue, onSelect }}>
      <menu role="tablist" className={tablistClass}>
        {tabs}
      </menu>
      {panels}
    </TabsContext.Provider>
  );
}
