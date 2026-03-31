import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Tabs } from "../tabs";
import { Tab } from "../tab";
import { TabPanel } from "../tab-panel";

describe("Tabs a11y (React)", () => {
  it("has correct ARIA roles", () => {
    render(
      <Tabs defaultValue="tab1">
        <Tab value="tab1">Tab 1</Tab>
        <Tab value="tab2">Tab 2</Tab>
        <TabPanel value="tab1">Content 1</TabPanel>
        <TabPanel value="tab2">Content 2</TabPanel>
      </Tabs>
    );

    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(2);
  });

  it("links tab to panel via aria-controls/aria-labelledby", () => {
    render(
      <Tabs defaultValue="tab1">
        <Tab value="tab1">Tab 1</Tab>
        <TabPanel value="tab1">Content 1</TabPanel>
      </Tabs>
    );

    const tab = screen.getByRole("tab");
    const panel = screen.getByRole("tabpanel");

    expect(tab).toHaveAttribute("aria-controls", "tabpanel-tab1");
    expect(panel).toHaveAttribute("aria-labelledby", "tab-tab1");
  });
});
