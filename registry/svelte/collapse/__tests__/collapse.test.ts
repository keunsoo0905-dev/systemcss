import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import CollapseTest from "./CollapseTest.svelte";

describe("Collapse (Svelte)", () => {
  it("renders with summary text", () => {
    render(CollapseTest, { props: { summary: "Click me" } });
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("is collapsed by default", () => {
    render(CollapseTest, { props: { summary: "Title" } });
    const details = screen.getByText("Title").closest("details");
    expect(details).not.toHaveAttribute("open");
  });

  it("supports defaultOpen", () => {
    render(CollapseTest, { props: { summary: "Title", defaultOpen: true } });
    const details = screen.getByText("Title").closest("details");
    expect(details).toHaveAttribute("open");
  });
});
