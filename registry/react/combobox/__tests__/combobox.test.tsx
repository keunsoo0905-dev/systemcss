// registry/react/combobox/__tests__/combobox.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComboBox } from "../combobox";

describe("ComboBox (React)", () => {
  const options = [
    { value: "opt1", label: "Option 1" },
    { value: "opt2", label: "Option 2" },
    { value: "opt3", label: "Another Option" },
  ];

  it("renders a text input and toggle button", () => {
    render(<ComboBox options={options} />);
    expect(screen.getByRole("combobox")).toBeDefined();
    expect(screen.getByRole("button", { name: /toggle/i })).toBeDefined();
  });

  it("opens the listbox when toggle button is clicked", async () => {
    const user = userEvent.setup();
    render(<ComboBox options={options} />);
    expect(screen.queryByRole("listbox")).toBeNull();
    await user.click(screen.getByRole("button", { name: /toggle/i }));
    expect(screen.getByRole("listbox")).toBeDefined();
  });

  it("renders all options in the listbox when opened", async () => {
    const user = userEvent.setup();
    render(<ComboBox options={options} />);
    await user.click(screen.getByRole("button", { name: /toggle/i }));
    const listItems = screen.getAllByRole("option");
    expect(listItems).toHaveLength(3);
  });

  it("filters options based on input text", async () => {
    const user = userEvent.setup();
    render(<ComboBox options={options} />);
    const input = screen.getByRole("combobox");
    await user.type(input, "Another");
    const listItems = screen.getAllByRole("option");
    expect(listItems).toHaveLength(1);
    expect(listItems[0].textContent).toBe("Another Option");
  });

  it("selects an option and closes the listbox", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ComboBox options={options} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: /toggle/i }));
    await user.click(screen.getByText("Option 2"));
    expect(onValueChange).toHaveBeenCalledWith("opt2");
    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(input.value).toBe("Option 2");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("supports controlled value", () => {
    render(<ComboBox options={options} value="opt1" onValueChange={() => {}} />);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(input.value).toBe("Option 1");
  });

  it("renders as disabled when disabled prop is set", () => {
    render(<ComboBox options={options} disabled />);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("closes the listbox when clicking outside", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <ComboBox options={options} />
        <div data-testid="outside">Outside</div>
      </div>
    );
    await user.click(screen.getByRole("button", { name: /toggle/i }));
    expect(screen.getByRole("listbox")).toBeDefined();
    await user.click(screen.getByTestId("outside"));
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("navigates options with keyboard arrows", async () => {
    const user = userEvent.setup();
    render(<ComboBox options={options} />);
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");
    expect((input as HTMLInputElement).value).toBe("Option 2");
  });

  it("merges custom className", () => {
    render(<ComboBox options={options} className="custom" />);
    const wrapper = screen.getByRole("combobox").parentElement;
    expect(wrapper?.className).toContain("custom");
  });

  it("applies win7-combobox CSS class to wrapper", () => {
    render(<ComboBox options={options} />);
    const wrapper = screen.getByRole("combobox").parentElement;
    expect(wrapper?.className).toContain("combobox");
  });
});
