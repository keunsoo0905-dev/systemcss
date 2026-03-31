// registry/react/spinner/__tests__/spinner.a11y.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "../spinner";

describe("Spinner Accessibility", () => {
  it("has role=status for screen readers", () => {
    render(<Spinner aria-label="Loading" />);
    expect(screen.getByRole("status")).toBeDefined();
  });

  it("supports aria-label for descriptive loading message", () => {
    render(<Spinner aria-label="Loading search results" />);
    expect(screen.getByLabelText("Loading search results")).toBeDefined();
  });

  it("supports aria-live region implicitly via role=status", () => {
    // role="status" 는 aria-live="polite"와 동등
    render(<Spinner aria-label="Loading" />);
    const spinner = screen.getByRole("status");
    // role=status는 암묵적으로 aria-live="polite" aria-atomic="true"를 가짐
    expect(spinner.getAttribute("role")).toBe("status");
  });
});
