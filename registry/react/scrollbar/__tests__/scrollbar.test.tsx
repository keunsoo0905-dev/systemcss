import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Scrollbar } from "../scrollbar";

describe("Scrollbar", () => {
  it("renders a scrollable container with win7 scrollbar class", () => {
    const { container } = render(
      <Scrollbar>
        <p>Scrollable content</p>
      </Scrollbar>
    );
    const el = container.firstElementChild;
    expect(el?.classList.contains("has-scrollbar")).toBe(true);
  });

  it("applies custom height via style prop", () => {
    const { container } = render(
      <Scrollbar style={{ height: "200px" }}>content</Scrollbar>
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.height).toBe("200px");
  });

  it("supports horizontal scrolling via direction prop", () => {
    const { container } = render(
      <Scrollbar direction="horizontal">content</Scrollbar>
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.overflowX).toBe("auto");
    expect(el.style.overflowY).toBe("hidden");
  });

  it("defaults to vertical scrolling", () => {
    const { container } = render(<Scrollbar>content</Scrollbar>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.overflowY).toBe("auto");
  });

  it("supports both directions", () => {
    const { container } = render(
      <Scrollbar direction="both">content</Scrollbar>
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.overflow).toBe("auto");
  });

  it("merges custom className", () => {
    const { container } = render(
      <Scrollbar className="my-scroll">content</Scrollbar>
    );
    const el = container.firstElementChild;
    expect(el?.classList.contains("my-scroll")).toBe(true);
  });
});
