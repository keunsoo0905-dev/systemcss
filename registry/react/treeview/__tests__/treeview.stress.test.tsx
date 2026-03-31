// registry/react/treeview/__tests__/treeview.stress.test.tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TreeView } from "../treeview";
import { TreeItem } from "../tree-item";

describe("TreeView Stress", () => {
  it("renders 5-level deep nested tree", () => {
    const { container } = render(
      <TreeView>
        <TreeItem label="L1">
          <TreeItem label="L2">
            <TreeItem label="L3">
              <TreeItem label="L4">
                <TreeItem label="L5" />
              </TreeItem>
            </TreeItem>
          </TreeItem>
        </TreeItem>
      </TreeView>
    );
    // 최상위 ul + 4개 중첩 ul = 5개
    const uls = container.querySelectorAll("ul");
    expect(uls.length).toBe(5);
  });

  it("renders many siblings efficiently", () => {
    const items = Array.from({ length: 100 }, (_, i) => (
      <TreeItem key={i} label={`Item ${i}`} />
    ));
    const { container } = render(<TreeView>{items}</TreeView>);
    const lis = container.querySelectorAll("li");
    expect(lis.length).toBe(100);
  });
});
