// registry/vue/spinner/__tests__/Spinner.test.ts
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/vue";
import Spinner from "../Spinner.vue";

describe("Spinner (Vue)", () => {
  it("renders a spinner element", () => {
    render(Spinner, {
      props: { "aria-label": "loading" },
    });
    const spinner = screen.getByRole("status");
    expect(spinner).toBeDefined();
  });

  it("applies animate class when animate is true", () => {
    render(Spinner, {
      props: { animate: true, "aria-label": "loading" },
    });
    const spinner = screen.getByRole("status");
    expect(spinner.classList.contains("animate")).toBe(true);
  });

  it("applies size class", () => {
    render(Spinner, {
      props: { size: "large", "aria-label": "loading" },
    });
    const spinner = screen.getByRole("status");
    expect(spinner.classList.contains("large")).toBe(true);
  });

  it("merges custom class", () => {
    render(Spinner, {
      props: { class: "my-custom", "aria-label": "loading" },
    });
    const spinner = screen.getByRole("status");
    expect(spinner.classList.contains("my-custom")).toBe(true);
  });
});
