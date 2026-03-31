import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Tabs } from "../tabs";
import { Tab } from "../tab";
import { TabPanel } from "../tab-panel";

describe("Tabs (React)", () => {
  it("renders tabs and panels", () => {
    render(
      <Tabs defaultValue="tab1">
        <Tab value="tab1">Tab 1</Tab>
        <Tab value="tab2">Tab 2</Tab>
        <TabPanel value="tab1">Content 1</TabPanel>
        <TabPanel value="tab2">Content 2</TabPanel>
      </Tabs>
    );

    expect(screen.getByText("Tab 1")).toBeInTheDocument();
    expect(screen.getByText("Tab 2")).toBeInTheDocument();
    expect(screen.getByText("Content 1")).toBeVisible();
    expect(screen.queryByText("Content 2")).not.toBeVisible();
  });

  it("switches tab on click", async () => {
    render(
      <Tabs defaultValue="tab1">
        <Tab value="tab1">Tab 1</Tab>
        <Tab value="tab2">Tab 2</Tab>
        <TabPanel value="tab1">Content 1</TabPanel>
        <TabPanel value="tab2">Content 2</TabPanel>
      </Tabs>
    );

    await fireEvent.click(screen.getByText("Tab 2"));
    expect(screen.getByText("Content 2")).toBeVisible();
    expect(screen.queryByText("Content 1")).not.toBeVisible();
  });

  it("sets aria-selected on active tab", () => {
    render(
      <Tabs defaultValue="tab1">
        <Tab value="tab1">Tab 1</Tab>
        <Tab value="tab2">Tab 2</Tab>
        <TabPanel value="tab1">Content 1</TabPanel>
        <TabPanel value="tab2">Content 2</TabPanel>
      </Tabs>
    );

    expect(screen.getByText("Tab 1")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Tab 2")).toHaveAttribute("aria-selected", "false");
  });

  it("supports justified variant", () => {
    render(
      <Tabs defaultValue="tab1" justified>
        <Tab value="tab1">Tab 1</Tab>
        <TabPanel value="tab1">Content 1</TabPanel>
      </Tabs>
    );

    const tablist = screen.getByRole("tablist");
    expect(tablist.className).toContain("justified");
  });

  it("supports disabled tabs", () => {
    render(
      <Tabs defaultValue="tab1">
        <Tab value="tab1">Tab 1</Tab>
        <Tab value="tab2" disabled>Tab 2</Tab>
        <TabPanel value="tab1">Content 1</TabPanel>
        <TabPanel value="tab2">Content 2</TabPanel>
      </Tabs>
    );

    const disabledTab = screen.getByText("Tab 2");
    expect(disabledTab).toBeDisabled();
    fireEvent.click(disabledTab);
    expect(screen.getByText("Content 1")).toBeVisible();
  });

  it("supports controlled mode via value + onValueChange", () => {
    const onValueChange = vi.fn();
    render(
      <Tabs value="tab1" onValueChange={onValueChange}>
        <Tab value="tab1">Tab 1</Tab>
        <Tab value="tab2">Tab 2</Tab>
        <TabPanel value="tab1">Content 1</TabPanel>
        <TabPanel value="tab2">Content 2</TabPanel>
      </Tabs>
    );

    fireEvent.click(screen.getByText("Tab 2"));
    expect(onValueChange).toHaveBeenCalledWith("tab2");
  });
});
