// registry/svelte/slider/__tests__/Slider.test.ts
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte";
import Slider from "../Slider.svelte";

describe("Slider (Svelte)", () => {
  it("renders input[type=range]", () => {
    const { container } = render(Slider, {
      props: { "aria-label": "volume" },
    });
    const input = container.querySelector('input[type="range"]');
    expect(input).not.toBeNull();
  });

  it("applies vertical class for vertical orientation", () => {
    const { container } = render(Slider, {
      props: { orientation: "vertical", "aria-label": "volume" },
    });
    const input = container.querySelector("input");
    expect(input?.classList.contains("vertical")).toBe(true);
  });

  it("applies has-box-indicator class for box-indicator variant", () => {
    const { container } = render(Slider, {
      props: { variant: "box-indicator", "aria-label": "volume" },
    });
    const input = container.querySelector("input");
    expect(input?.classList.contains("has-box-indicator")).toBe(true);
  });

  it("forwards min, max, step props", () => {
    const { container } = render(Slider, {
      props: { min: 0, max: 100, step: 5, "aria-label": "volume" },
    });
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.min).toBe("0");
    expect(input.max).toBe("100");
    expect(input.step).toBe("5");
  });

  it("handles disabled state", () => {
    const { container } = render(Slider, {
      props: { disabled: true, "aria-label": "volume" },
    });
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("merges custom class", () => {
    const { container } = render(Slider, {
      props: { class: "my-custom", "aria-label": "volume" },
    });
    const input = container.querySelector("input");
    expect(input?.classList.contains("my-custom")).toBe(true);
  });
});
