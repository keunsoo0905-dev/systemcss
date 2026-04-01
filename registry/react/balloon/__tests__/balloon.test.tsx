import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Balloon } from "../balloon";

describe("Balloon", () => {
  it("renders with role=tooltip", () => {
    render(<Balloon>Tooltip text</Balloon>);
    expect(screen.getByRole("tooltip")).toBeTruthy();
  });

  it("renders children content", () => {
    render(<Balloon>Hello Balloon</Balloon>);
    expect(screen.getByText("Hello Balloon")).toBeTruthy();
  });

  it("defaults to bottom position (no extra class)", () => {
    const { container } = render(<Balloon>text</Balloon>);
    const el = container.querySelector('[role="tooltip"]');
    expect(el?.classList.contains("is-top")).toBe(false);
    expect(el?.classList.contains("is-right")).toBe(false);
  });

  it("applies is-top class for top position", () => {
    const { container } = render(<Balloon position="top">text</Balloon>);
    const el = container.querySelector('[role="tooltip"]');
    expect(el?.classList.contains("is-top")).toBe(true);
  });

  it("applies is-right class for right-aligned arrow", () => {
    const { container } = render(<Balloon arrowAlign="right">text</Balloon>);
    const el = container.querySelector('[role="tooltip"]');
    expect(el?.classList.contains("is-right")).toBe(true);
  });

  it("combines position and arrowAlign classes", () => {
    const { container } = render(
      <Balloon position="top" arrowAlign="right">text</Balloon>
    );
    const el = container.querySelector('[role="tooltip"]');
    expect(el?.classList.contains("is-top")).toBe(true);
    expect(el?.classList.contains("is-right")).toBe(true);
  });

  it("merges custom className", () => {
    const { container } = render(
      <Balloon className="custom-tip">text</Balloon>
    );
    const el = container.querySelector('[role="tooltip"]');
    expect(el?.classList.contains("custom-tip")).toBe(true);
  });
});
