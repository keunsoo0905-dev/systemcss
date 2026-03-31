import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Collapse } from "../collapse";

describe("Collapse (React)", () => {
  it("renders with summary text", () => {
    render(
      <Collapse summary="Click to expand">
        <p>Hidden content</p>
      </Collapse>
    );

    expect(screen.getByText("Click to expand")).toBeInTheDocument();
  });

  it("is collapsed by default", () => {
    render(
      <Collapse summary="Title">
        <p>Content</p>
      </Collapse>
    );

    const details = screen.getByText("Title").closest("details");
    expect(details).not.toHaveAttribute("open");
  });

  it("supports defaultOpen prop", () => {
    render(
      <Collapse summary="Title" defaultOpen>
        <p>Content</p>
      </Collapse>
    );

    const details = screen.getByText("Title").closest("details");
    expect(details).toHaveAttribute("open");
  });

  it("toggles on click", async () => {
    render(
      <Collapse summary="Title">
        <p>Content</p>
      </Collapse>
    );

    const summary = screen.getByText("Title");
    await fireEvent.click(summary);

    const details = summary.closest("details");
    expect(details).toHaveAttribute("open");
  });

  it("calls onToggle when toggled", async () => {
    const onToggle = vi.fn();
    render(
      <Collapse summary="Title" onToggle={onToggle}>
        <p>Content</p>
      </Collapse>
    );

    const details = screen.getByText("Title").closest("details")!;
    // jsdom does not auto-fire toggle on summary click, dispatch manually
    details.open = true;
    await fireEvent(details, new Event("toggle", { bubbles: false }));
    expect(onToggle).toHaveBeenCalled();
  });

  it("supports controlled open prop", () => {
    const { rerender } = render(
      <Collapse summary="Title" open={false}>
        <p>Content</p>
      </Collapse>
    );

    const details = screen.getByText("Title").closest("details");
    expect(details).not.toHaveAttribute("open");

    rerender(
      <Collapse summary="Title" open={true}>
        <p>Content</p>
      </Collapse>
    );

    expect(details).toHaveAttribute("open");
  });
});
