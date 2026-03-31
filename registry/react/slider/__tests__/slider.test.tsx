// registry/react/slider/__tests__/slider.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Slider } from "../slider";

describe("Slider", () => {
  it("renders input[type=range] element", () => {
    render(<Slider aria-label="volume" />);
    const slider = screen.getByRole("slider");
    expect(slider).toBeDefined();
    expect(slider.getAttribute("type")).toBe("range");
  });

  it("applies default horizontal orientation", () => {
    render(<Slider aria-label="volume" />);
    const slider = screen.getByRole("slider");
    expect(slider.className).not.toContain("vertical");
  });

  it("applies vertical orientation class", () => {
    render(<Slider aria-label="volume" orientation="vertical" />);
    const slider = screen.getByRole("slider");
    expect(slider.className).toContain("vertical");
  });

  it("applies box-indicator variant class", () => {
    render(<Slider aria-label="volume" variant="box-indicator" />);
    const slider = screen.getByRole("slider");
    expect(slider.className).toContain("hasBoxIndicator");
  });

  it("forwards min, max, step, value props", () => {
    render(
      <Slider aria-label="volume" min={0} max={100} step={5} defaultValue={50} />
    );
    const slider = screen.getByRole("slider") as HTMLInputElement;
    expect(slider.min).toBe("0");
    expect(slider.max).toBe("100");
    expect(slider.step).toBe("5");
    expect(slider.value).toBe("50");
  });

  it("handles disabled state", () => {
    render(<Slider aria-label="volume" disabled />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveProperty("disabled", true);
  });

  it("calls onChange handler", () => {
    const handleChange = vi.fn();
    render(<Slider aria-label="volume" onChange={handleChange} />);
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "75" } });
    expect(handleChange).toHaveBeenCalled();
  });

  it("merges custom className", () => {
    render(<Slider aria-label="volume" className="my-custom" />);
    const slider = screen.getByRole("slider");
    expect(slider.className).toContain("my-custom");
  });
});
