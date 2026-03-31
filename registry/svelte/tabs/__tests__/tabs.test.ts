import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";
import TabsTest from "./TabsTest.svelte";

describe("Tabs (Svelte)", () => {
  it("renders tabs and displays active panel", () => {
    render(TabsTest, { props: { defaultValue: "tab1" } });

    expect(screen.getByText("Tab 1")).toBeInTheDocument();
    expect(screen.getByText("Tab 2")).toBeInTheDocument();
    expect(screen.getByText("Content 1")).toBeVisible();
  });

  it("switches tab on click", async () => {
    render(TabsTest, { props: { defaultValue: "tab1" } });

    await fireEvent.click(screen.getByText("Tab 2"));
    expect(screen.getByText("Content 2")).toBeVisible();
  });

  it("sets aria-selected on active tab", () => {
    render(TabsTest, { props: { defaultValue: "tab1" } });

    expect(screen.getByText("Tab 1")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Tab 2")).toHaveAttribute("aria-selected", "false");
  });
});
