import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GlassFrame } from "../glass-frame";

describe("GlassFrame", () => {
  it("renders with glass class", () => {
    const { container } = render(
      <GlassFrame title="Glass Window">content</GlassFrame>
    );
    const el = container.querySelector(".window");
    expect(el?.classList.contains("glass")).toBe(true);
  });

  it("renders title bar with specified title", () => {
    render(<GlassFrame title="My Glass">content</GlassFrame>);
    expect(screen.getByText("My Glass")).toBeTruthy();
  });

  it("renders window-body with has-space by default", () => {
    const { container } = render(
      <GlassFrame title="Test">content</GlassFrame>
    );
    const body = container.querySelector(".window-body");
    expect(body?.classList.contains("has-space")).toBe(true);
  });
});
