import { createContext, useContext } from "react";

interface TabsContextValue {
  activeValue: string;
  onSelect: (value: string) => void;
}

export const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tab/TabPanel must be used within a Tabs component");
  }
  return context;
}
