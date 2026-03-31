// registry/svelte/combobox/__tests__/ComboBox.test.ts
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import ComboBox from "../ComboBox.svelte";

describe("ComboBox (Svelte)", () => {
  const options = [
    { value: "opt1", label: "Option 1" },
    { value: "opt2", label: "Option 2" },
    { value: "opt3", label: "Another Option" },
  ];

  it("renders a text input and toggle button", () => {
    render(ComboBox, { props: { options } });
    expect(screen.getByRole("combobox")).toBeDefined();
    expect(screen.getByRole("button", { name: /toggle/i })).toBeDefined();
  });

  it("opens the listbox when toggle button is clicked", async () => {
    const user = userEvent.setup();
    render(ComboBox, { props: { options } });
    expect(screen.queryByRole("listbox")).toBeNull();
    await user.click(screen.getByRole("button", { name: /toggle/i }));
    expect(screen.getByRole("listbox")).toBeDefined();
  });

  it("filters options based on input text", async () => {
    const user = userEvent.setup();
    render(ComboBox, { props: { options } });
    const input = screen.getByRole("combobox");
    await user.type(input, "Another");
    const listItems = screen.getAllByRole("option");
    expect(listItems).toHaveLength(1);
    expect(listItems[0].textContent?.trim()).toBe("Another Option");
  });

  it("renders as disabled when disabled prop is set", () => {
    render(ComboBox, { props: { options, disabled: true } });
    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("applies win7-combobox CSS class to wrapper", () => {
    render(ComboBox, { props: { options } });
    const wrapper = screen.getByRole("combobox").parentElement;
    expect(wrapper?.className).toContain("win7-combobox");
  });
});
