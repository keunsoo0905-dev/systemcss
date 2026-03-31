// registry/svelte/listbox/__tests__/ListBox.test.ts
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import ListBox from "../ListBox.svelte";

describe("ListBox (Svelte)", () => {
  const items = [
    { value: "a", label: "Alpha" },
    { value: "b", label: "Beta" },
    { value: "c", label: "Charlie" },
  ];

  it("renders a listbox role element", () => {
    render(ListBox, { props: { items } });
    expect(screen.getByRole("listbox")).toBeDefined();
  });

  it("renders all items as option roles", () => {
    render(ListBox, { props: { items } });
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);
  });

  it("highlights selected item with aria-selected", async () => {
    const user = userEvent.setup();
    render(ListBox, { props: { items } });
    await user.click(screen.getByText("Beta"));
    expect(screen.getByText("Beta").getAttribute("aria-selected")).toBe("true");
  });

  it("applies has-shadow class when hasShadow is true", () => {
    render(ListBox, { props: { items, hasShadow: true } });
    const listbox = screen.getByRole("listbox");
    expect(listbox.className).toContain("has-shadow");
  });

  it("applies has-hover class when hasHover is true", () => {
    render(ListBox, { props: { items, hasHover: true } });
    const listbox = screen.getByRole("listbox");
    expect(listbox.className).toContain("has-hover");
  });

  it("applies win7-listbox CSS class", () => {
    render(ListBox, { props: { items } });
    const listbox = screen.getByRole("listbox");
    expect(listbox.className).toContain("win7-listbox");
  });
});
