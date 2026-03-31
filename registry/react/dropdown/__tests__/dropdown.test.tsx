// registry/react/dropdown/__tests__/dropdown.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dropdown } from "../dropdown";

describe("Dropdown (React)", () => {
  const options = [
    { value: "opt1", label: "Option 1" },
    { value: "opt2", label: "Option 2" },
    { value: "opt3", label: "Option 3" },
  ];

  it("renders a native select element", () => {
    render(<Dropdown options={options} />);
    const select = screen.getByRole("combobox");
    expect(select).toBeDefined();
    expect(select.tagName).toBe("SELECT");
  });

  it("renders all provided options", () => {
    render(<Dropdown options={options} />);
    const optionElements = screen.getAllByRole("option");
    expect(optionElements).toHaveLength(3);
    expect(optionElements[0].textContent).toBe("Option 1");
    expect(optionElements[1].textContent).toBe("Option 2");
    expect(optionElements[2].textContent).toBe("Option 3");
  });

  it("renders a placeholder option when placeholder is provided", () => {
    render(<Dropdown options={options} placeholder="Select..." />);
    const optionElements = screen.getAllByRole("option");
    expect(optionElements).toHaveLength(4);
    expect(optionElements[0].textContent).toBe("Select...");
    expect((optionElements[0] as HTMLOptionElement).disabled).toBe(true);
  });

  it("applies win7-dropdown CSS class", () => {
    render(<Dropdown options={options} data-testid="dd" />);
    const select = screen.getByTestId("dd");
    expect(select.className).toContain("dropdown");
  });

  it("supports controlled value", () => {
    render(<Dropdown options={options} value="opt2" onChange={() => {}} />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("opt2");
  });

  it("fires onChange when selection changes", async () => {
    const user = userEvent.setup();
    let changedValue = "";
    render(
      <Dropdown
        options={options}
        onChange={(e) => {
          changedValue = e.target.value;
        }}
      />
    );
    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "opt2");
    expect(changedValue).toBe("opt2");
  });

  it("renders as disabled when disabled prop is set", () => {
    render(<Dropdown options={options} disabled />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.disabled).toBe(true);
  });

  it("merges custom className", () => {
    render(<Dropdown options={options} className="custom-class" data-testid="dd" />);
    const select = screen.getByTestId("dd");
    expect(select.className).toContain("custom-class");
    expect(select.className).toContain("dropdown");
  });

  it("passes through additional HTML attributes", () => {
    render(<Dropdown options={options} aria-label="test-dropdown" data-testid="dd" />);
    const select = screen.getByTestId("dd");
    expect(select.getAttribute("aria-label")).toBe("test-dropdown");
  });
});
