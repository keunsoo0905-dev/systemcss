import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import Window from "../Window.svelte";
import TitleBar from "../TitleBar.svelte";
import WindowBody from "../WindowBody.svelte";
import StatusBar from "../StatusBar.svelte";

describe("Window (Svelte)", () => {
  it("renders a window with default class", () => {
    const { container } = render(Window);
    expect(container.querySelector(".window")).toBeTruthy();
  });

  it("applies glass variant", () => {
    const { container } = render(Window, { props: { variant: "glass" } });
    const el = container.querySelector(".window");
    expect(el?.classList.contains("glass")).toBe(true);
  });
});

describe("TitleBar (Svelte)", () => {
  it("renders title text", () => {
    render(TitleBar, { props: { title: "My Window" } });
    expect(screen.getByText("My Window")).toBeTruthy();
  });

  it("renders default controls", () => {
    render(TitleBar, { props: { title: "Test" } });
    expect(screen.getByLabelText("Minimize")).toBeTruthy();
    expect(screen.getByLabelText("Maximize")).toBeTruthy();
    expect(screen.getByLabelText("Close")).toBeTruthy();
  });

  it("renders only specified controls", () => {
    render(TitleBar, { props: { title: "Dialog", controls: ["close"] } });
    expect(screen.getByLabelText("Close")).toBeTruthy();
    expect(screen.queryByLabelText("Minimize")).toBeNull();
  });
});

describe("WindowBody (Svelte)", () => {
  it("applies has-space class when prop is true", () => {
    const { container } = render(WindowBody, { props: { hasSpace: true } });
    const el = container.querySelector(".window-body");
    expect(el?.classList.contains("has-space")).toBe(true);
  });
});

describe("StatusBar (Svelte)", () => {
  it("renders status bar fields", () => {
    render(StatusBar, {
      props: { fields: ["Ready", "Ln 1", "UTF-8"] },
    });
    expect(screen.getByText("Ready")).toBeTruthy();
    expect(screen.getByText("UTF-8")).toBeTruthy();
  });
});
