// registry/vue/listview/__tests__/ListView.test.ts
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import ListView from "../ListView.vue";

describe("ListView (Vue)", () => {
  const columns = [
    { key: "name", label: "Name", width: 200 },
    { key: "size", label: "Size", width: 100 },
  ];

  const data = [
    { name: "File1.txt", size: "10 KB" },
    { name: "File2.jpg", size: "2 MB" },
  ];

  it("renders a table element", () => {
    render(ListView, { props: { columns, data } });
    expect(screen.getByRole("table")).toBeDefined();
  });

  it("renders column headers", () => {
    render(ListView, { props: { columns, data } });
    expect(screen.getByText("Name")).toBeDefined();
    expect(screen.getByText("Size")).toBeDefined();
  });

  it("renders all data rows", () => {
    render(ListView, { props: { columns, data } });
    expect(screen.getByText("File1.txt")).toBeDefined();
    expect(screen.getByText("File2.jpg")).toBeDefined();
  });

  it("emits sort when header is clicked", async () => {
    const user = userEvent.setup();
    const { emitted } = render(ListView, { props: { columns, data } });
    await user.click(screen.getByText("Name"));
    expect(emitted().sort).toBeTruthy();
    expect(emitted().sort[0]).toEqual(["name", "asc"]);
  });

  it("emits rowSelect when row is clicked", async () => {
    const user = userEvent.setup();
    const { emitted } = render(ListView, { props: { columns, data } });
    const row = screen.getByText("File2.jpg").closest("tr");
    await user.click(row!);
    expect(emitted().rowSelect).toBeTruthy();
    expect(emitted().rowSelect[0]).toEqual([1, data[1]]);
  });

  it("applies win7-listview CSS class", () => {
    render(ListView, { props: { columns, data } });
    const table = screen.getByRole("table");
    expect(table.className).toContain("win7-listview");
  });
});
