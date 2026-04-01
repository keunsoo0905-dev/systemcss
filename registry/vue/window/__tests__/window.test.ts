import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/vue";
import Window from "../Window.vue";
import TitleBar from "../TitleBar.vue";
import WindowBody from "../WindowBody.vue";
import StatusBar from "../StatusBar.vue";

describe("Window (Vue)", () => {
  it("renders a window with default class", () => {
    const { container } = render(Window, { slots: { default: "content" } });
    expect(container.querySelector(".window")).toBeTruthy();
  });

  it("applies glass variant", () => {
    const { container } = render(Window, {
      props: { variant: "glass" },
      slots: { default: "content" },
    });
    expect(container.querySelector(".window.glass")).toBeTruthy();
  });
});

describe("TitleBar (Vue)", () => {
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
    render(TitleBar, {
      props: { title: "Dialog", controls: ["close"] },
    });
    expect(screen.getByLabelText("Close")).toBeTruthy();
    expect(screen.queryByLabelText("Minimize")).toBeNull();
  });
});

describe("WindowBody (Vue)", () => {
  it("applies has-space class", () => {
    const { container } = render(WindowBody, {
      props: { hasSpace: true },
      slots: { default: "content" },
    });
    expect(container.querySelector(".window-body.has-space")).toBeTruthy();
  });
});

describe("StatusBar (Vue)", () => {
  it("renders fields", () => {
    const { container } = render(StatusBar, {
      props: { fields: ["Ready", "Ln 1", "UTF-8"] },
    });
    const fields = container.querySelectorAll(".status-bar-field");
    expect(fields.length).toBe(3);
    expect(fields[0].textContent).toBe("Ready");
  });
});
