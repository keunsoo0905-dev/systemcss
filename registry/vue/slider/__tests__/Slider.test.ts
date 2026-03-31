// registry/vue/slider/__tests__/Slider.test.ts
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/vue";
import Slider from "../Slider.vue";

describe("Slider (Vue)", () => {
  it("renders input[type=range]", () => {
    render(Slider, {
      props: { "aria-label": "volume" },
    });
    const input = screen.getByRole("slider");
    expect(input).toBeDefined();
  });

  it("applies vertical class for vertical orientation", () => {
    render(Slider, {
      props: { orientation: "vertical", "aria-label": "volume" },
    });
    const input = screen.getByRole("slider");
    expect(input.classList.contains("vertical")).toBe(true);
  });

  it("applies has-box-indicator class for box-indicator variant", () => {
    render(Slider, {
      props: { variant: "box-indicator", "aria-label": "volume" },
    });
    const input = screen.getByRole("slider");
    expect(input.classList.contains("has-box-indicator")).toBe(true);
  });

  it("forwards min, max, step props", () => {
    render(Slider, {
      props: { min: 0, max: 100, step: 5, "aria-label": "volume" },
    });
    const input = screen.getByRole("slider") as HTMLInputElement;
    expect(input.getAttribute("min")).toBe("0");
    expect(input.getAttribute("max")).toBe("100");
    expect(input.getAttribute("step")).toBe("5");
  });

  it("handles disabled state", () => {
    render(Slider, {
      props: { disabled: true, "aria-label": "volume" },
    });
    const input = screen.getByRole("slider") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("emits update:modelValue on input", async () => {
    const { emitted } = render(Slider, {
      props: { modelValue: 50, "aria-label": "volume" },
    });
    const input = screen.getByRole("slider");
    await fireEvent.input(input, { target: { value: "75" } });
    expect(emitted()["update:modelValue"]).toBeTruthy();
  });

  it("merges custom class", () => {
    render(Slider, {
      props: { class: "my-custom", "aria-label": "volume" },
    });
    const input = screen.getByRole("slider");
    expect(input.classList.contains("my-custom")).toBe(true);
  });
});
