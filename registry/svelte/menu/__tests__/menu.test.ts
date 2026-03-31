import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import MenuTest from "./MenuTest.svelte";

describe("Menu (Svelte)", () => {
  it("renders menu with items", () => {
    render(MenuTest);

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getAllByRole("menuitem")).toHaveLength(2);
  });

  it("renders separator", () => {
    render(MenuTest, { props: { showSeparator: true } });
    const menu = screen.getByRole("menu");
    expect(menu.querySelector("hr")).toBeInTheDocument();
  });
});
