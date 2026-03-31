// registry/react/listview/__tests__/listview.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ListView } from "../listview";

describe("ListView (React)", () => {
  const columns = [
    { key: "name", label: "Name", width: 200 },
    { key: "size", label: "Size", width: 100 },
    { key: "type", label: "Type", width: 150 },
  ];

  const data = [
    { name: "Document.txt", size: "12 KB", type: "Text" },
    { name: "Photo.jpg", size: "2.4 MB", type: "Image" },
    { name: "Music.mp3", size: "5.1 MB", type: "Audio" },
  ];

  it("renders a table element", () => {
    render(<ListView columns={columns} data={data} />);
    expect(screen.getByRole("table")).toBeDefined();
  });

  it("renders column headers", () => {
    render(<ListView columns={columns} data={data} />);
    expect(screen.getByText("Name")).toBeDefined();
    expect(screen.getByText("Size")).toBeDefined();
    expect(screen.getByText("Type")).toBeDefined();
  });

  it("renders all data rows", () => {
    render(<ListView columns={columns} data={data} />);
    expect(screen.getByText("Document.txt")).toBeDefined();
    expect(screen.getByText("Photo.jpg")).toBeDefined();
    expect(screen.getByText("Music.mp3")).toBeDefined();
  });

  it("calls onSort when a column header is clicked", async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(<ListView columns={columns} data={data} onSort={onSort} />);
    await user.click(screen.getByText("Name"));
    expect(onSort).toHaveBeenCalledWith("name", "asc");
  });

  it("toggles sort direction on subsequent clicks", async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(<ListView columns={columns} data={data} onSort={onSort} />);
    await user.click(screen.getByText("Name"));
    expect(onSort).toHaveBeenCalledWith("name", "asc");
    await user.click(screen.getByText("Name"));
    expect(onSort).toHaveBeenCalledWith("name", "desc");
  });

  it("highlights the sorted column header", () => {
    render(<ListView columns={columns} data={data} sortKey="name" sortDirection="asc" />);
    const nameHeader = screen.getByText("Name").closest("th");
    expect(nameHeader?.className).toContain("highlighted");
    expect(nameHeader?.className).toContain("indicator");
  });

  it("shows up indicator for ascending sort", () => {
    render(<ListView columns={columns} data={data} sortKey="name" sortDirection="asc" />);
    const nameHeader = screen.getByText("Name").closest("th");
    expect(nameHeader?.className).toContain("up");
  });

  it("highlights a row when clicked", async () => {
    const user = userEvent.setup();
    const onRowSelect = vi.fn();
    render(<ListView columns={columns} data={data} onRowSelect={onRowSelect} />);
    const row = screen.getByText("Photo.jpg").closest("tr");
    await user.click(row!);
    expect(row?.className).toContain("highlighted");
    expect(onRowSelect).toHaveBeenCalledWith(1, data[1]);
  });

  it("applies has-shadow class when hasShadow prop is true", () => {
    render(<ListView columns={columns} data={data} hasShadow />);
    const table = screen.getByRole("table");
    expect(table.className).toContain("has-shadow");
  });

  it("applies win7-listview CSS class", () => {
    render(<ListView columns={columns} data={data} />);
    const table = screen.getByRole("table");
    expect(table.className).toContain("listview");
  });

  it("merges custom className", () => {
    render(<ListView columns={columns} data={data} className="custom" />);
    const table = screen.getByRole("table");
    expect(table.className).toContain("custom");
  });
});
