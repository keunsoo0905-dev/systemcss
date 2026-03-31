import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/vue";
import MenuBar from "../MenuBar.vue";
import MenuBarItem from "../MenuBarItem.vue";

describe("MenuBar (Vue)", () => {
  it("renders menubar with items", () => {
    render(MenuBar, {
      slots: {
        default: [
          '<MenuBarItem label="File" />',
          '<MenuBarItem label="Edit" />',
        ].join(""),
      },
      global: { components: { MenuBarItem } },
    });

    expect(screen.getByRole("menubar")).toBeInTheDocument();
    expect(screen.getByText("File")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });
});
