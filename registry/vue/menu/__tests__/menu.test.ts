import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/vue";
import Menu from "../Menu.vue";
import MenuItem from "../MenuItem.vue";
import MenuSeparator from "../MenuSeparator.vue";

describe("Menu (Vue)", () => {
  it("renders menu with items", () => {
    render(Menu, {
      slots: {
        default: [
          '<MenuItem>File</MenuItem>',
          '<MenuItem>Edit</MenuItem>',
        ].join(""),
      },
      global: { components: { MenuItem } },
    });

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getAllByRole("menuitem")).toHaveLength(2);
  });

  it("renders separator", () => {
    render(Menu, {
      slots: {
        default: [
          '<MenuItem>Cut</MenuItem>',
          '<MenuSeparator />',
          '<MenuItem>Paste</MenuItem>',
        ].join(""),
      },
      global: { components: { MenuItem, MenuSeparator } },
    });

    const hr = document.querySelector("hr");
    expect(hr).toBeInTheDocument();
  });
});
