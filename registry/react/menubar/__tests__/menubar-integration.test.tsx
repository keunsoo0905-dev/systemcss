import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MenuBar } from "../menubar";
import { MenuBarItem } from "../menubar-item";
import { Menu } from "../../menu/menu";
import { MenuItem } from "../../menu/menu-item";
import { MenuSeparator } from "../../menu/menu-separator";

describe("MenuBar + Menu Integration", () => {
  it("renders full menubar with nested menus", () => {
    render(
      <MenuBar>
        <MenuBarItem label="File">
          <Menu>
            <MenuItem>New</MenuItem>
            <MenuItem>Open</MenuItem>
            <MenuSeparator />
            <MenuItem>Exit</MenuItem>
          </Menu>
        </MenuBarItem>
        <MenuBarItem label="Edit">
          <Menu>
            <MenuItem>Undo</MenuItem>
            <MenuItem>Redo</MenuItem>
          </Menu>
        </MenuBarItem>
        <MenuBarItem label="Help">
          <Menu>
            <MenuItem>About</MenuItem>
          </Menu>
        </MenuBarItem>
      </MenuBar>
    );

    expect(screen.getByRole("menubar")).toBeInTheDocument();
    expect(screen.getByText("File")).toBeInTheDocument();
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.getByText("Exit")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });
});
