import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Window } from "../window";
import { TitleBar } from "../title-bar";
import { WindowBody } from "../window-body";
import { StatusBar } from "../status-bar";

describe("Window", () => {
  it("renders a window with default class", () => {
    const { container } = render(<Window>content</Window>);
    expect(container.querySelector(".window")).toBeTruthy();
  });

  it("applies glass variant class", () => {
    const { container } = render(<Window variant="glass">content</Window>);
    const el = container.querySelector(".window");
    expect(el?.classList.contains("glass")).toBe(true);
  });

  it("forwards role attribute", () => {
    render(<Window role="dialog">content</Window>);
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("merges custom className", () => {
    const { container } = render(<Window className="custom">content</Window>);
    const el = container.querySelector(".window");
    expect(el?.classList.contains("custom")).toBe(true);
  });
});

describe("TitleBar", () => {
  it("renders title text", () => {
    render(<TitleBar title="My Window" />);
    expect(screen.getByText("My Window")).toBeTruthy();
  });

  it("renders default controls (minimize, maximize, close)", () => {
    render(<TitleBar title="Test" />);
    expect(screen.getByLabelText("Minimize")).toBeTruthy();
    expect(screen.getByLabelText("Maximize")).toBeTruthy();
    expect(screen.getByLabelText("Close")).toBeTruthy();
  });

  it("renders only specified controls", () => {
    render(<TitleBar title="Dialog" controls={["close"]} />);
    expect(screen.getByLabelText("Close")).toBeTruthy();
    expect(screen.queryByLabelText("Minimize")).toBeNull();
    expect(screen.queryByLabelText("Maximize")).toBeNull();
  });

  it("renders icon when provided", () => {
    const { container } = render(<TitleBar title="With Icon" icon="/icon.png" />);
    const img = container.querySelector("img");
    expect(img).toBeTruthy();
    expect(img?.getAttribute("src")).toBe("/icon.png");
  });
});

describe("WindowBody", () => {
  it("renders children", () => {
    render(<WindowBody>Hello</WindowBody>);
    expect(screen.getByText("Hello")).toBeTruthy();
  });

  it("applies has-space class when hasSpace is true", () => {
    const { container } = render(<WindowBody hasSpace>content</WindowBody>);
    const el = container.querySelector(".window-body");
    expect(el?.classList.contains("has-space")).toBe(true);
  });

  it("does not apply has-space by default", () => {
    const { container } = render(<WindowBody>content</WindowBody>);
    const el = container.querySelector(".window-body");
    expect(el?.classList.contains("has-space")).toBe(false);
  });
});

describe("StatusBar", () => {
  it("renders status bar fields", () => {
    render(<StatusBar fields={["Ready", "Ln 1, Col 1", "UTF-8"]} />);
    expect(screen.getByText("Ready")).toBeTruthy();
    expect(screen.getByText("Ln 1, Col 1")).toBeTruthy();
    expect(screen.getByText("UTF-8")).toBeTruthy();
  });

  it("applies status-bar-field class to each field", () => {
    const { container } = render(<StatusBar fields={["A", "B"]} />);
    const fields = container.querySelectorAll(".status-bar-field");
    expect(fields.length).toBe(2);
  });
});
