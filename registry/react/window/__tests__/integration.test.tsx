import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Window, TitleBar, WindowBody, StatusBar, GlassFrame, DialogBox } from "../index";

describe("Window integration", () => {
  it("renders complete window with all sub-components", () => {
    const { container } = render(
      <Window>
        <TitleBar title="My App" />
        <WindowBody hasSpace>
          <p>Hello World</p>
        </WindowBody>
        <StatusBar fields={["Ready", "100%"]} />
      </Window>
    );

    expect(container.querySelector(".window")).toBeTruthy();
    expect(screen.getByText("My App")).toBeTruthy();
    expect(screen.getByText("Hello World")).toBeTruthy();
    expect(screen.getByText("Ready")).toBeTruthy();
    expect(screen.getByText("100%")).toBeTruthy();
  });

  it("fires control button events", async () => {
    const onClose = vi.fn();
    const onMinimize = vi.fn();

    render(<TitleBar title="Test" onClose={onClose} onMinimize={onMinimize} />);

    await fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalledOnce();

    await fireEvent.click(screen.getByLabelText("Minimize"));
    expect(onMinimize).toHaveBeenCalledOnce();
  });
});

describe("GlassFrame integration", () => {
  it("renders glass window with title and body", () => {
    const { container } = render(
      <GlassFrame title="Aero Window">Glass content</GlassFrame>
    );

    expect(container.querySelector(".window.glass")).toBeTruthy();
    expect(screen.getByText("Aero Window")).toBeTruthy();
    expect(screen.getByText("Glass content")).toBeTruthy();
  });
});

describe("DialogBox integration", () => {
  it("renders dialog with role and close button only", () => {
    const onClose = vi.fn();
    render(
      <DialogBox title="Confirm Delete" onClose={onClose}>
        <p>Are you sure?</p>
      </DialogBox>
    );

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("Confirm Delete")).toBeTruthy();
    expect(screen.getByLabelText("Close")).toBeTruthy();
    expect(screen.queryByLabelText("Minimize")).toBeNull();
  });
});
