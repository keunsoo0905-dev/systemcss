// registry/react/dropdown/__tests__/dropdown.snapshot.test.tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Dropdown } from "../dropdown";

describe("Dropdown snapshot (React)", () => {
  const options = [
    { value: "a", label: "Alpha" },
    { value: "b", label: "Beta" },
  ];

  it("matches default snapshot", () => {
    const { container } = render(<Dropdown options={options} />);
    expect(container.innerHTML).toMatchSnapshot();
  });

  it("matches snapshot with placeholder", () => {
    const { container } = render(
      <Dropdown options={options} placeholder="Choose..." />
    );
    expect(container.innerHTML).toMatchSnapshot();
  });

  it("matches disabled snapshot", () => {
    const { container } = render(<Dropdown options={options} disabled />);
    expect(container.innerHTML).toMatchSnapshot();
  });
});
