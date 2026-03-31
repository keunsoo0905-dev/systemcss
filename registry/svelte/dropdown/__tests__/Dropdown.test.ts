// registry/svelte/dropdown/__tests__/Dropdown.test.ts
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import Dropdown from "../Dropdown.svelte";

describe("Dropdown (Svelte)", () => {
  const options = [
    { value: "opt1", label: "Option 1" },
    { value: "opt2", label: "Option 2" },
    { value: "opt3", label: "Option 3" },
  ];

  it("renders a native select element", () => {
    render(Dropdown, { props: { options } });
    const select = screen.getByRole("combobox");
    expect(select).toBeDefined();
    expect(select.tagName).toBe("SELECT");
  });

  it("renders all provided options", () => {
    render(Dropdown, { props: { options } });
    const optionElements = screen.getAllByRole("option");
    expect(optionElements).toHaveLength(3);
  });

  it("renders a placeholder option when placeholder is provided", () => {
    render(Dropdown, { props: { options, placeholder: "Select..." } });
    const optionElements = screen.getAllByRole("option");
    expect(optionElements).toHaveLength(4);
    expect(optionElements[0].textContent).toBe("Select...");
  });

  it("applies win7-dropdown CSS class", () => {
    render(Dropdown, { props: { options } });
    const select = screen.getByRole("combobox");
    expect(select.className).toContain("win7-dropdown");
  });

  it("supports controlled value", () => {
    render(Dropdown, { props: { options, value: "opt2" } });
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("opt2");
  });

  it("renders as disabled when disabled prop is set", () => {
    render(Dropdown, { props: { options, disabled: true } });
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.disabled).toBe(true);
  });

  it("merges custom class", () => {
    render(Dropdown, { props: { options, class: "custom-class" } });
    const select = screen.getByRole("combobox");
    expect(select.className).toContain("custom-class");
    expect(select.className).toContain("win7-dropdown");
  });
});
