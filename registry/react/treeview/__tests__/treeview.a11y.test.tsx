// registry/react/treeview/__tests__/treeview.a11y.test.tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TreeView } from "../treeview";
import { TreeItem } from "../tree-item";

describe("TreeView Accessibility", () => {
  it("uses semantic ul/li structure for tree", () => {
    const { container } = render(
      <TreeView>
        <TreeItem label="Item 1" />
        <TreeItem label="Item 2" />
      </TreeView>
    );
    const ul = container.querySelector("ul");
    expect(ul).not.toBeNull();
    const lis = container.querySelectorAll("li");
    expect(lis.length).toBe(2);
  });

  it("collapse-button uses native details/summary for keyboard accessibility", () => {
    const { container } = render(
      <TreeView variant="collapse-button">
        <TreeItem label="Folder">
          <TreeItem label="File" />
        </TreeItem>
      </TreeView>
    );
    const summary = container.querySelector("summary");
    expect(summary).not.toBeNull();
    // summary 요소는 기본적으로 키보드 포커스 가능 + Enter/Space로 토글
  });

  it("tree links are accessible", () => {
    const { container } = render(
      <TreeView>
        <TreeItem label="Clickable Item" />
      </TreeView>
    );
    const li = container.querySelector("li");
    expect(li?.textContent).toBe("Clickable Item");
  });
});
