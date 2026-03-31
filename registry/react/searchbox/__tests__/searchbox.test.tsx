// registry/react/searchbox/__tests__/searchbox.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBox } from "../searchbox";

describe("SearchBox (React)", () => {
  it("renders a search input", () => {
    render(<SearchBox />);
    expect(screen.getByRole("searchbox")).toBeDefined();
  });

  it("renders a search button", () => {
    render(<SearchBox />);
    expect(screen.getByRole("button", { name: /search/i })).toBeDefined();
  });

  it("displays placeholder text", () => {
    render(<SearchBox placeholder="Search..." />);
    const input = screen.getByPlaceholderText("Search...");
    expect(input).toBeDefined();
  });

  it("supports controlled value", () => {
    render(<SearchBox value="test query" onChange={() => {}} />);
    const input = screen.getByRole("searchbox") as HTMLInputElement;
    expect(input.value).toBe("test query");
  });

  it("fires onChange when text is entered", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchBox onChange={onChange} />);
    const input = screen.getByRole("searchbox");
    await user.type(input, "hello");
    expect(onChange).toHaveBeenCalled();
  });

  it("fires onSearch when search button is clicked", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBox onSearch={onSearch} />);
    const input = screen.getByRole("searchbox");
    await user.type(input, "query");
    await user.click(screen.getByRole("button", { name: /search/i }));
    expect(onSearch).toHaveBeenCalledWith("query");
  });

  it("fires onSearch when Enter is pressed", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBox onSearch={onSearch} />);
    const input = screen.getByRole("searchbox");
    await user.type(input, "query{Enter}");
    expect(onSearch).toHaveBeenCalledWith("query");
  });

  it("renders as disabled when disabled prop is set", () => {
    render(<SearchBox disabled />);
    const input = screen.getByRole("searchbox") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("applies win7-searchbox CSS class to wrapper", () => {
    render(<SearchBox />);
    const wrapper = screen.getByRole("searchbox").parentElement;
    expect(wrapper?.className).toContain("searchbox");
  });

  it("merges custom className", () => {
    render(<SearchBox className="custom" />);
    const wrapper = screen.getByRole("searchbox").parentElement;
    expect(wrapper?.className).toContain("custom");
  });
});
