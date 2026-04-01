// registry/react/treeview/__tests__/treeview.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TreeView } from "../treeview";
import { TreeItem } from "../tree-item";

describe("TreeView", () => {
  it("renders a ul.tree-view", () => {
    const { container } = render(
      <TreeView>
        <TreeItem label="Item 1" />
      </TreeView>
    );
    const ul = container.querySelector("ul.treeView");
    expect(ul).not.toBeNull();
  });

  it("renders tree items as li elements", () => {
    const { container } = render(
      <TreeView>
        <TreeItem label="Item 1" />
        <TreeItem label="Item 2" />
      </TreeView>
    );
    const items = container.querySelectorAll("li");
    expect(items.length).toBe(2);
  });

  it("renders nested tree items recursively", () => {
    const { container } = render(
      <TreeView>
        <TreeItem label="Parent">
          <TreeItem label="Child 1" />
          <TreeItem label="Child 2" />
        </TreeItem>
      </TreeView>
    );
    const nestedUl = container.querySelector("ul.treeView ul");
    expect(nestedUl).not.toBeNull();
    const nestedItems = nestedUl!.querySelectorAll(":scope > li");
    expect(nestedItems.length).toBe(2);
  });

  it("applies hasContainer class for container variant", () => {
    const { container } = render(
      <TreeView variant="container">
        <TreeItem label="Item" />
      </TreeView>
    );
    const ul = container.querySelector("ul");
    expect(ul?.classList.contains("hasContainer")).toBe(true);
  });

  it("applies hasCollapseButton class and renders details/summary", () => {
    const { container } = render(
      <TreeView variant="collapse-button">
        <TreeItem label="Parent">
          <TreeItem label="Child" />
        </TreeItem>
      </TreeView>
    );
    const ul = container.querySelector("ul");
    expect(ul?.classList.contains("hasCollapseButton")).toBe(true);
    const details = container.querySelector("details");
    expect(details).not.toBeNull();
    const summary = container.querySelector("summary");
    expect(summary?.textContent).toBe("Parent");
  });

  it("applies hasConnector class for connector variant", () => {
    const { container } = render(
      <TreeView variant="connector">
        <TreeItem label="Item" />
      </TreeView>
    );
    const ul = container.querySelector("ul");
    expect(ul?.classList.contains("hasConnector")).toBe(true);
  });

  it("respects open prop in collapse-button variant", () => {
    const { container } = render(
      <TreeView variant="collapse-button">
        <TreeItem label="Parent" open>
          <TreeItem label="Child" />
        </TreeItem>
      </TreeView>
    );
    const details = container.querySelector("details");
    expect(details?.open).toBe(true);
  });

  it("merges custom className on TreeView", () => {
    const { container } = render(
      <TreeView className="my-custom">
        <TreeItem label="Item" />
      </TreeView>
    );
    const ul = container.querySelector("ul");
    expect(ul?.classList.contains("my-custom")).toBe(true);
  });

  it("renders deeply nested tree (3+ levels)", () => {
    const { container } = render(
      <TreeView>
        <TreeItem label="L1">
          <TreeItem label="L2">
            <TreeItem label="L3" />
          </TreeItem>
        </TreeItem>
      </TreeView>
    );
    const deepItem = container.querySelectorAll("ul");
    // 최상위 ul + 2개 중첩 ul = 3개
    expect(deepItem.length).toBe(3);
  });

  // Collapsible sections 테스트
  it("renders details/summary with collapsible prop in non-collapse-button variant", () => {
    const { container } = render(
      <TreeView variant="container">
        <TreeItem label="Collapsible" collapsible open>
          <TreeItem label="Child" />
        </TreeItem>
      </TreeView>
    );
    const details = container.querySelector("details");
    expect(details).not.toBeNull();
    expect(details?.open).toBe(true);
    const summary = container.querySelector("summary");
    expect(summary?.textContent).toBe("Collapsible");
  });

  it("does not render details/summary without collapsible prop in container variant", () => {
    const { container } = render(
      <TreeView variant="container">
        <TreeItem label="Static">
          <TreeItem label="Child" />
        </TreeItem>
      </TreeView>
    );
    const details = container.querySelector("details");
    expect(details).toBeNull();
  });

  it("supports combining variants as array", () => {
    const { container } = render(
      <TreeView variant={["container", "collapse-button", "connector"]}>
        <TreeItem label="Parent" open>
          <TreeItem label="Child" />
        </TreeItem>
      </TreeView>
    );
    const ul = container.querySelector("ul");
    expect(ul?.classList.contains("hasContainer")).toBe(true);
    expect(ul?.classList.contains("hasCollapseButton")).toBe(true);
    expect(ul?.classList.contains("hasConnector")).toBe(true);
    // collapse-button variant이므로 자동 collapsible
    const details = container.querySelector("details");
    expect(details).not.toBeNull();
  });

  it("collapsible=false overrides collapse-button variant", () => {
    const { container } = render(
      <TreeView variant="collapse-button">
        <TreeItem label="Not Collapsible" collapsible={false}>
          <TreeItem label="Child" />
        </TreeItem>
      </TreeView>
    );
    const details = container.querySelector("details");
    expect(details).toBeNull();
  });
});
