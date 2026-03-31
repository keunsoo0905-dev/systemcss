import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "../progressbar";

describe("ProgressBar (React)", () => {
  it("renders with value", () => {
    render(<ProgressBar value={50} />);

    const bar = screen.getByRole("progressbar");
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute("aria-valuenow", "50");
  });

  it("sets min and max attributes", () => {
    render(<ProgressBar value={30} min={0} max={100} />);

    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("renders inner div with correct width percentage", () => {
    const { container } = render(<ProgressBar value={75} />);

    const inner = container.querySelector('[role="progressbar"] > div');
    expect(inner).toHaveStyle({ width: "75%" });
  });

  it("applies paused state", () => {
    render(<ProgressBar value={50} state="paused" />);

    const bar = screen.getByRole("progressbar");
    expect(bar.className).toContain("paused");
  });

  it("applies error state", () => {
    render(<ProgressBar value={50} state="error" />);

    const bar = screen.getByRole("progressbar");
    expect(bar.className).toContain("error");
  });

  it("renders animate variant", () => {
    render(<ProgressBar value={50} animate />);

    const bar = screen.getByRole("progressbar");
    expect(bar.className).toContain("animate");
  });

  it("renders marquee (indeterminate) mode", () => {
    render(<ProgressBar marquee />);

    const bar = screen.getByRole("progressbar");
    expect(bar.className).toContain("marquee");
    expect(bar).not.toHaveAttribute("aria-valuenow");
  });

  it("clamps value between min and max", () => {
    const { container } = render(<ProgressBar value={150} min={0} max={100} />);

    const inner = container.querySelector('[role="progressbar"] > div');
    expect(inner).toHaveStyle({ width: "100%" });
  });
});
