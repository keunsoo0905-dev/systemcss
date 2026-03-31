// registry/vue/treeview/__tests__/TreeView.test.ts
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/vue";
import { h } from "vue";
import TreeView from "../TreeView.vue";
import TreeItem from "../TreeItem.vue";

describe("TreeView (Vue)", () => {
  it("renders a ul.tree-view", () => {
    const { container } = render(TreeView, {
      slots: {
        default: () => [h(TreeItem, { label: "Item 1" })],
      },
    });
    const ul = container.querySelector("ul.tree-view");
    expect(ul).not.toBeNull();
  });

  it("applies has-container class for container variant", () => {
    const { container } = render(TreeView, {
      props: { variant: "container" },
      slots: {
        default: () => [h(TreeItem, { label: "Item" })],
      },
    });
    const ul = container.querySelector("ul");
    expect(ul?.classList.contains("has-container")).toBe(true);
  });

  it("applies has-collapse-button class for collapse-button variant", () => {
    const { container } = render(TreeView, {
      props: { variant: "collapse-button" },
      slots: {
        default: () => [
          h(TreeItem, { label: "Parent" }, {
            default: () => [h(TreeItem, { label: "Child" })],
          }),
        ],
      },
    });
    const ul = container.querySelector("ul");
    expect(ul?.classList.contains("has-collapse-button")).toBe(true);
  });

  it("renders details/summary in collapse-button variant", () => {
    const { container } = render(TreeView, {
      props: { variant: "collapse-button" },
      slots: {
        default: () => [
          h(TreeItem, { label: "Parent" }, {
            default: () => [h(TreeItem, { label: "Child" })],
          }),
        ],
      },
    });
    const details = container.querySelector("details");
    expect(details).not.toBeNull();
    const summary = container.querySelector("summary");
    expect(summary?.textContent).toBe("Parent");
  });

  it("applies has-connector class for connector variant", () => {
    const { container } = render(TreeView, {
      props: { variant: "connector" },
      slots: {
        default: () => [h(TreeItem, { label: "Item" })],
      },
    });
    const ul = container.querySelector("ul");
    expect(ul?.classList.contains("has-connector")).toBe(true);
  });

  it("renders nested tree items", () => {
    const { container } = render(TreeView, {
      slots: {
        default: () => [
          h(TreeItem, { label: "Parent" }, {
            default: () => [h(TreeItem, { label: "Child" })],
          }),
        ],
      },
    });
    const nestedUl = container.querySelector("ul.tree-view ul");
    expect(nestedUl).not.toBeNull();
  });
});
