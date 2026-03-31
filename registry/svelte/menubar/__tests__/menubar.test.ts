import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import MenuBarTest from "./MenuBarTest.svelte";

describe("MenuBar (Svelte)", () => {
  it("renders menubar with items", () => {
    render(MenuBarTest);

    expect(screen.getByRole("menubar")).toBeInTheDocument();
    expect(screen.getByText("File")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });
});
