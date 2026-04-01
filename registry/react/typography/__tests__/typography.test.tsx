import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Instruction, InstructionPrimary, HeaderDocument, HeaderGroup } from "../typography";

describe("Instruction", () => {
  it("renders with instruction class", () => {
    const { container } = render(<Instruction>Follow these steps</Instruction>);
    const el = container.querySelector(".instruction");
    expect(el).toBeTruthy();
    expect(el?.textContent).toBe("Follow these steps");
  });
});

describe("InstructionPrimary", () => {
  it("renders with instruction and instruction-primary classes", () => {
    const { container } = render(
      <InstructionPrimary>Main instruction</InstructionPrimary>
    );
    const el = container.querySelector(".instruction.instruction-primary");
    expect(el).toBeTruthy();
  });
});

describe("HeaderDocument", () => {
  it("renders with header and header-document classes", () => {
    const { container } = render(
      <HeaderDocument>Document Title</HeaderDocument>
    );
    const el = container.querySelector(".header.header-document");
    expect(el).toBeTruthy();
    expect(el?.textContent).toBe("Document Title");
  });
});

describe("HeaderGroup", () => {
  it("renders with header and header-group classes", () => {
    const { container } = render(
      <HeaderGroup>Group Title</HeaderGroup>
    );
    const el = container.querySelector(".header.header-group");
    expect(el).toBeTruthy();
  });
});
