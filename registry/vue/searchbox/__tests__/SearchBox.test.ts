// registry/vue/searchbox/__tests__/SearchBox.test.ts
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import SearchBox from "../SearchBox.vue";

describe("SearchBox (Vue)", () => {
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

  it("emits search on button click", async () => {
    const user = userEvent.setup();
    const { emitted } = render(SearchBox);
    const input = screen.getByRole("searchbox");
    await user.type(input, "query");
    await user.click(screen.getByRole("button", { name: /search/i }));
    expect(emitted().search).toBeTruthy();
    expect(emitted().search[0]).toEqual(["query"]);
  });

  it("emits search on Enter key", async () => {
    const user = userEvent.setup();
    const { emitted } = render(SearchBox);
    const input = screen.getByRole("searchbox");
    await user.type(input, "query{Enter}");
    expect(emitted().search).toBeTruthy();
    expect(emitted().search[0]).toEqual(["query"]);
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
