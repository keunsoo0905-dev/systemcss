import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import ProgressBar from "../ProgressBar.svelte";

describe("ProgressBar (Svelte)", () => {
  it("renders with value", () => {
    render(ProgressBar, { props: { value: 50 } });

    const bar = screen.getByRole("progressbar");
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute("aria-valuenow", "50");
  });

  it("applies paused state", () => {
    render(ProgressBar, { props: { value: 50, state: "paused" } });

    const bar = screen.getByRole("progressbar");
    expect(bar.className).toContain("paused");
  });

  it("applies error state", () => {
    render(ProgressBar, { props: { value: 50, state: "error" } });

    const bar = screen.getByRole("progressbar");
    expect(bar.className).toContain("error");
  });

  it("renders marquee mode without aria-valuenow", () => {
    render(ProgressBar, { props: { marquee: true } });

    const bar = screen.getByRole("progressbar");
    expect(bar.className).toContain("marquee");
    expect(bar.hasAttribute("aria-valuenow")).toBe(false);
  });
});
