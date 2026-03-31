// registry/svelte/treeview/__tests__/TreeView.test.ts
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte";
import TreeViewTest from "./TreeViewTest.svelte";

// Svelte에서 compound component 테스트는 래퍼 컴포넌트가 필요
// TreeViewTest.svelte를 별도 작성하여 TreeView + TreeItem 조합 테스트

describe("TreeView (Svelte)", () => {
  it("renders a ul.tree-view", () => {
    const { container } = render(TreeViewTest, {
      props: { variant: "default" },
    });
    const ul = container.querySelector("ul.tree-view");
    expect(ul).not.toBeNull();
  });

  it("applies has-container class for container variant", () => {
    const { container } = render(TreeViewTest, {
      props: { variant: "container" },
    });
    const ul = container.querySelector("ul");
    expect(ul?.classList.contains("has-container")).toBe(true);
  });

  it("applies has-collapse-button class and renders details/summary", () => {
    const { container } = render(TreeViewTest, {
      props: { variant: "collapse-button" },
    });
    const ul = container.querySelector("ul");
    expect(ul?.classList.contains("has-collapse-button")).toBe(true);
    const details = container.querySelector("details");
    expect(details).not.toBeNull();
  });

  it("applies has-connector class for connector variant", () => {
    const { container } = render(TreeViewTest, {
      props: { variant: "connector" },
    });
    const ul = container.querySelector("ul");
    expect(ul?.classList.contains("has-connector")).toBe(true);
  });

  it("renders nested tree items", () => {
    const { container } = render(TreeViewTest, {
      props: { variant: "default" },
    });
    const nestedUl = container.querySelector("ul.tree-view ul");
    expect(nestedUl).not.toBeNull();
  });
});
