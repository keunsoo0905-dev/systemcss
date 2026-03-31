import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/vue";
import Collapse from "../Collapse.vue";

describe("Collapse (Vue)", () => {
  it("renders with summary text", () => {
    render(Collapse, {
      props: { summary: "Click me" },
      slots: { default: "<p>Content</p>" },
    });

    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("is collapsed by default", () => {
    render(Collapse, {
      props: { summary: "Title" },
      slots: { default: "<p>Content</p>" },
    });

    const details = screen.getByText("Title").closest("details");
    expect(details).not.toHaveAttribute("open");
  });

  it("supports defaultOpen", () => {
    render(Collapse, {
      props: { summary: "Title", defaultOpen: true },
      slots: { default: "<p>Content</p>" },
    });

    const details = screen.getByText("Title").closest("details");
    expect(details).toHaveAttribute("open");
  });
});
