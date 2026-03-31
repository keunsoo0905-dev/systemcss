// registry/svelte/searchbox/__tests__/SearchBox.test.ts
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import SearchBox from "../SearchBox.svelte";

describe("SearchBox (Svelte)", () => {
  it("renders a search input", () => {
    render(SearchBox);
    expect(screen.getByRole("searchbox")).toBeDefined();
  });

  it("renders a search button", () => {
    render(SearchBox);
    expect(screen.getByRole("button", { name: /search/i })).toBeDefined();
  });

  it("displays placeholder text", () => {
    render(SearchBox, { props: { placeholder: "Search..." } });
    expect(screen.getByPlaceholderText("Search...")).toBeDefined();
  });

  it("fires onSearch when search button is clicked", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(SearchBox, { props: { onSearch } });
    const input = screen.getByRole("searchbox");
    await user.type(input, "query");
    await user.click(screen.getByRole("button", { name: /search/i }));
    expect(onSearch).toHaveBeenCalledWith("query");
  });

  it("fires onSearch on Enter key", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(SearchBox, { props: { onSearch } });
    const input = screen.getByRole("searchbox");
    await user.type(input, "query{Enter}");
    expect(onSearch).toHaveBeenCalledWith("query");
  });

  it("renders as disabled when disabled prop is set", () => {
    render(SearchBox, { props: { disabled: true } });
    const input = screen.getByRole("searchbox") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("applies win7-searchbox CSS class to wrapper", () => {
    render(SearchBox);
    const wrapper = screen.getByRole("searchbox").parentElement;
    expect(wrapper?.className).toContain("win7-searchbox");
  });
});
