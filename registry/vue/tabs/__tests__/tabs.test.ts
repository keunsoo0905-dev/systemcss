import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/vue";
import Tabs from "../Tabs.vue";
import Tab from "../Tab.vue";
import TabPanel from "../TabPanel.vue";

describe("Tabs (Vue)", () => {
  it("renders tabs and displays active panel", () => {
    render(Tabs, {
      props: { defaultValue: "tab1" },
      slots: {
        default: [
          `<Tab value="tab1">Tab 1</Tab>`,
          `<Tab value="tab2">Tab 2</Tab>`,
          `<TabPanel value="tab1">Content 1</TabPanel>`,
          `<TabPanel value="tab2">Content 2</TabPanel>`,
        ].join(""),
      },
      global: {
        components: { Tab, TabPanel },
      },
    });

    expect(screen.getByText("Tab 1")).toBeInTheDocument();
    expect(screen.getByText("Tab 2")).toBeInTheDocument();
    expect(screen.getByText("Content 1")).toBeVisible();
  });

  it("switches tab on click", async () => {
    render(Tabs, {
      props: { defaultValue: "tab1" },
      slots: {
        default: [
          `<Tab value="tab1">Tab 1</Tab>`,
          `<Tab value="tab2">Tab 2</Tab>`,
          `<TabPanel value="tab1">Content 1</TabPanel>`,
          `<TabPanel value="tab2">Content 2</TabPanel>`,
        ].join(""),
      },
      global: {
        components: { Tab, TabPanel },
      },
    });

    const tab2 = screen.getByText("Tab 2");
    await tab2.click();
    expect(screen.getByText("Content 2")).toBeVisible();
  });

  it("sets aria-selected on active tab", () => {
    render(Tabs, {
      props: { defaultValue: "tab1" },
      slots: {
        default: [
          `<Tab value="tab1">Tab 1</Tab>`,
          `<Tab value="tab2">Tab 2</Tab>`,
          `<TabPanel value="tab1">Content 1</TabPanel>`,
          `<TabPanel value="tab2">Content 2</TabPanel>`,
        ].join(""),
      },
      global: {
        components: { Tab, TabPanel },
      },
    });

    expect(screen.getByText("Tab 1")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Tab 2")).toHaveAttribute("aria-selected", "false");
  });
});
