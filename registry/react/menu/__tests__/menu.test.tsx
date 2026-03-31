import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Menu } from "../menu";
import { MenuItem } from "../menu-item";
import { MenuSeparator } from "../menu-separator";

describe("Menu (React)", () => {
  it("renders menu with items", () => {
    render(
      <Menu>
        <MenuItem>File</MenuItem>
        <MenuItem>Edit</MenuItem>
      </Menu>
    );

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getAllByRole("menuitem")).toHaveLength(2);
    expect(screen.getByText("File")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("renders separator", () => {
    const { container } = render(
      <Menu>
        <MenuItem>Cut</MenuItem>
        <MenuSeparator />
        <MenuItem>Paste</MenuItem>
      </Menu>
    );

    expect(container.querySelector("hr")).toBeInTheDocument();
  });

  it("fires onSelect when item clicked", () => {
    const onSelect = vi.fn();
    render(
      <Menu>
        <MenuItem onSelect={() => onSelect("file")}>File</MenuItem>
      </Menu>
    );

    fireEvent.click(screen.getByText("File"));
    expect(onSelect).toHaveBeenCalledWith("file");
  });

  it("renders disabled items", () => {
    render(
      <Menu>
        <MenuItem disabled>Disabled</MenuItem>
      </Menu>
    );

    expect(screen.getByText("Disabled")).toHaveAttribute("aria-disabled", "true");
  });

  it("renders submenu (nested menu)", () => {
    render(
      <Menu>
        <MenuItem
          submenu={
            <Menu>
              <MenuItem>Sub Item</MenuItem>
            </Menu>
          }
        >
          Parent
        </MenuItem>
      </Menu>
    );

    expect(screen.getByText("Parent")).toBeInTheDocument();
    expect(screen.getByText("Sub Item")).toBeInTheDocument();
  });
});
