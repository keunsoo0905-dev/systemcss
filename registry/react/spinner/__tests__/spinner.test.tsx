// registry/react/spinner/__tests__/spinner.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "../spinner";

describe("Spinner", () => {
  it("renders a spinner element", () => {
    render(<Spinner aria-label="loading" />);
    const spinner = screen.getByRole("status");
    expect(spinner).toBeDefined();
  });

  it("has spinner base class", () => {
    render(<Spinner aria-label="loading" />);
    const spinner = screen.getByRole("status");
    expect(spinner.className).toContain("spinner");
  });

  it("applies animate class when animate prop is true", () => {
    render(<Spinner animate aria-label="loading" />);
    const spinner = screen.getByRole("status");
    expect(spinner.className).toContain("animate");
  });

  it("does not apply animate class by default", () => {
    render(<Spinner aria-label="loading" />);
    const spinner = screen.getByRole("status");
    expect(spinner.className).not.toContain("animate");
  });

  it("applies size class", () => {
    render(<Spinner size="small" aria-label="loading" />);
    const spinner = screen.getByRole("status");
    expect(spinner.className).toContain("small");
  });

  it("renders accessible label via aria-label", () => {
    render(<Spinner aria-label="Loading content" />);
    const spinner = screen.getByLabelText("Loading content");
    expect(spinner).toBeDefined();
  });

  it("merges custom className", () => {
    render(<Spinner className="my-custom" aria-label="loading" />);
    const spinner = screen.getByRole("status");
    expect(spinner.className).toContain("my-custom");
  });
});
