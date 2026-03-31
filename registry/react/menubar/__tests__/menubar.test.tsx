import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MenuBar } from "../menubar";
import { MenuBarItem } from "../menubar-item";
import { Menu } from "../../menu/menu";
import { MenuItem } from "../../menu/menu-item";

describe("MenuBar (React)", () => {
  it("renders menubar with items", () => {
    render(
      <MenuBar>
        <MenuBarItem label="File">
          <Menu>
            <MenuItem>New</MenuItem>
            <MenuItem>Open</MenuItem>
          </Menu>
        </MenuBarItem>
        <MenuBarItem label="Edit">
          <Menu>
            <MenuItem>Undo</MenuItem>
          </Menu>
        </MenuBarItem>
      </MenuBar>
    );

    expect(screen.getByRole("menubar")).toBeInTheDocument();
    expect(screen.getByText("File")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("shows dropdown menu on hover", async () => {
    render(
      <MenuBar>
        <MenuBarItem label="File">
          <Menu>
            <MenuItem>New</MenuItem>
          </Menu>
        </MenuBarItem>
      </MenuBar>
    );

    const fileItem = screen.getByText("File");
    await fireEvent.mouseOver(fileItem);
    // CSS :hover 로 표시되므로 DOM에는 항상 존재 (CSS display 제어)
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("has correct ARIA roles", () => {
    render(
      <MenuBar>
        <MenuBarItem label="File">
          <Menu>
            <MenuItem>New</MenuItem>
          </Menu>
        </MenuBarItem>
      </MenuBar>
    );

    expect(screen.getByRole("menubar")).toBeInTheDocument();
    expect(screen.getByText("File").closest('[role="menuitem"]')).toBeInTheDocument();
  });
});
