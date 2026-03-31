import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/vue";
import ProgressBar from "../ProgressBar.vue";

describe("ProgressBar (Vue)", () => {
  it("renders with value", () => {
    render(ProgressBar, {
      props: { value: 50 },
    });

    const bar = screen.getByRole("progressbar");
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute("aria-valuenow", "50");
  });

  it("renders inner div with correct width", () => {
    render(ProgressBar, {
      props: { value: 75 },
    });

    const bar = screen.getByRole("progressbar");
    const inner = bar.querySelector("div");
    expect(inner?.style.width).toBe("75%");
  });

  it("applies paused state", () => {
    render(ProgressBar, {
      props: { value: 50, state: "paused" },
    });

    const bar = screen.getByRole("progressbar");
    expect(bar.classList.contains("paused")).toBe(true);
  });

  it("applies error state", () => {
    render(ProgressBar, {
      props: { value: 50, state: "error" },
    });

    const bar = screen.getByRole("progressbar");
    expect(bar.classList.contains("error")).toBe(true);
  });

  it("renders marquee mode", () => {
    render(ProgressBar, {
      props: { marquee: true },
    });

    const bar = screen.getByRole("progressbar");
    expect(bar.classList.contains("marquee")).toBe(true);
    expect(bar.hasAttribute("aria-valuenow")).toBe(false);
  });
});
