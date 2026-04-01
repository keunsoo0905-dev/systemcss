import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Window, TitleBar, WindowBody, StatusBar, GlassFrame, DialogBox } from "../index";

describe("Window snapshots", () => {
  it("default window", () => {
    const { container } = render(
      <Window>
        <TitleBar title="Snapshot Test" />
        <WindowBody>Body content</WindowBody>
        <StatusBar fields={["OK"]} />
      </Window>
    );
    expect(container.innerHTML).toMatchSnapshot();
  });

  it("glass frame", () => {
    const { container } = render(
      <GlassFrame title="Glass Snapshot">Content</GlassFrame>
    );
    expect(container.innerHTML).toMatchSnapshot();
  });

  it("dialog box", () => {
    const { container } = render(
      <DialogBox title="Dialog Snapshot">Content</DialogBox>
    );
    expect(container.innerHTML).toMatchSnapshot();
  });
});
