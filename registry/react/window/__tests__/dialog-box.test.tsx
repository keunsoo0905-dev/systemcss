import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DialogBox } from "../dialog-box";

describe("DialogBox", () => {
  it("renders with role=dialog", () => {
    render(<DialogBox title="Confirm">Are you sure?</DialogBox>);
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("renders only close control by default", () => {
    render(<DialogBox title="Alert">message</DialogBox>);
    expect(screen.getByLabelText("Close")).toBeTruthy();
    expect(screen.queryByLabelText("Minimize")).toBeNull();
    expect(screen.queryByLabelText("Maximize")).toBeNull();
  });

  it("renders window-body with has-space by default", () => {
    const { container } = render(
      <DialogBox title="Test">content</DialogBox>
    );
    const body = container.querySelector(".window-body");
    expect(body?.classList.contains("has-space")).toBe(true);
  });
});
