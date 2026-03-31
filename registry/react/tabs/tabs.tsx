import React, { useState, useCallback } from "react";
import { TabsContext } from "./tabs-context";
import styles from "../css/tabs.module.css";

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  justified?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  justified = false,
  className,
  children,
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? "");

  const isControlled = controlledValue !== undefined;
  const activeValue = isControlled ? controlledValue : uncontrolledValue;

  const onSelect = useCallback(
    (val: string) => {
      if (!isControlled) {
        setUncontrolledValue(val);
      }
      onValueChange?.(val);
    },
    [isControlled, onValueChange]
  );

  // children을 tablist(Tab)과 tabpanel(TabPanel)로 분리
  const tabs: React.ReactNode[] = [];
  const panels: React.ReactNode[] = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if ((child.type as any).displayName === "Tab") {
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
