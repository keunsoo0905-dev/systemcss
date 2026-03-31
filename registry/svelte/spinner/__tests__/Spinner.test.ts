// registry/svelte/spinner/__tests__/Spinner.test.ts
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte";
import Spinner from "../Spinner.svelte";

describe("Spinner (Svelte)", () => {
  it("renders a spinner element", () => {
    const { container } = render(Spinner, {
      props: { "aria-label": "loading" },
    });
    const spinner = container.querySelector('[role="status"]');
    expect(spinner).not.toBeNull();
  });

  it("applies animate class when animate is true", () => {
    const { container } = render(Spinner, {
      props: { animate: true, "aria-label": "loading" },
    });
    const spinner = container.querySelector('[role="status"]');
    expect(spinner?.classList.contains("animate")).toBe(true);
  });

  it("applies size class", () => {
    const { container } = render(Spinner, {
      props: { size: "large", "aria-label": "loading" },
    });
    const spinner = container.querySelector('[role="status"]');
    expect(spinner?.classList.contains("large")).toBe(true);
  });

  it("merges custom class", () => {
    const { container } = render(Spinner, {
      props: { class: "my-custom", "aria-label": "loading" },
    });
    const spinner = container.querySelector('[role="status"]');
    expect(spinner?.classList.contains("my-custom")).toBe(true);
  });
});
