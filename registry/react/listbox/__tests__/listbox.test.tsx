// registry/react/listbox/__tests__/listbox.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ListBox } from "../listbox";

describe("ListBox (React)", () => {
  const items = [
    { value: "a", label: "Alpha" },
    { value: "b", label: "Beta" },
    { value: "c", label: "Charlie" },
  ];

  it("renders a listbox role element", () => {
    render(<ListBox items={items} />);
    expect(screen.getByRole("listbox")).toBeDefined();
  });

  it("renders all items as option roles", () => {
    render(<ListBox items={items} />);
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);
    expect(options[0].textContent).toBe("Alpha");
    expect(options[1].textContent).toBe("Beta");
    expect(options[2].textContent).toBe("Charlie");
  });

  it("supports single selection mode (default)", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<ListBox items={items} onSelectionChange={onSelectionChange} />);
    await user.click(screen.getByText("Beta"));
    expect(onSelectionChange).toHaveBeenCalledWith(["b"]);
  });

  it("supports multi selection mode", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <ListBox items={items} selectionMode="multiple" onSelectionChange={onSelectionChange} />
    );
    await user.click(screen.getByText("Alpha"));
    await user.click(screen.getByText("Charlie"));
    expect(onSelectionChange).toHaveBeenLastCalledWith(["a", "c"]);
  });

  it("highlights the selected item with aria-selected", async () => {
    const user = userEvent.setup();
    render(<ListBox items={items} />);
    await user.click(screen.getByText("Beta"));
    const betaOption = screen.getByText("Beta");
    expect(betaOption.getAttribute("aria-selected")).toBe("true");
  });

  it("applies has-shadow class when hasShadow prop is true", () => {
    render(<ListBox items={items} hasShadow />);
    const listbox = screen.getByRole("listbox");
    expect(listbox.className).toContain("has-shadow");
  });

  it("applies has-hover class when hasHover prop is true", () => {
    render(<ListBox items={items} hasHover />);
    const listbox = screen.getByRole("listbox");
    expect(listbox.className).toContain("has-hover");
  });

  it("renders as controlled with selectedValues", () => {
    render(<ListBox items={items} selectedValues={["b"]} onSelectionChange={() => {}} />);
    const betaOption = screen.getByText("Beta");
    expect(betaOption.getAttribute("aria-selected")).toBe("true");
  });

  it("supports keyboard navigation with ArrowDown/ArrowUp", async () => {
    const user = userEvent.setup();
    render(<ListBox items={items} />);
    const listbox = screen.getByRole("listbox");
    listbox.focus();
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");
    const betaOption = screen.getByText("Beta");
    expect(betaOption.getAttribute("aria-selected")).toBe("true");
  });

  it("merges custom className", () => {
    render(<ListBox items={items} className="custom" />);
    const listbox = screen.getByRole("listbox");
    expect(listbox.className).toContain("custom");
    expect(listbox.className).toContain("listbox");
  });
});
