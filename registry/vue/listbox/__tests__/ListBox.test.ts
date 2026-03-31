// registry/vue/listbox/__tests__/ListBox.test.ts
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import ListBox from "../ListBox.vue";

describe("ListBox (Vue)", () => {
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

  it("emits selectionChange on click", async () => {
    const user = userEvent.setup();
    const { emitted } = render(ListBox, { props: { items } });
    await user.click(screen.getByText("Beta"));
    expect(emitted().selectionChange).toBeTruthy();
    expect(emitted().selectionChange[0]).toEqual([["b"]]);
  });

  it("applies has-shadow class when hasShadow is true", () => {
    render(ListBox, { props: { items, hasShadow: true } });
    const listbox = screen.getByRole("listbox");
    expect(listbox.className).toContain("has-shadow");
  });

  it("applies win7-listbox CSS class", () => {
    render(ListBox, { props: { items } });
    const listbox = screen.getByRole("listbox");
    expect(listbox.className).toContain("win7-listbox");
  });
});
