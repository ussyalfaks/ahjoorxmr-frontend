import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

function SimpleCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg p-4 shadow">
      <h3 className="font-bold">{title}</h3>
      <div>{children}</div>
    </div>
  );
}

describe("SimpleCard Component", () => {
  it("renders title and child contents", () => {
    render(<SimpleCard title="Test Card"><p>Card Content</p></SimpleCard>);
    expect(screen.getByText("Test Card")).toBeInTheDocument();
    expect(screen.getByText("Card Content")).toBeInTheDocument();
  });
});


describe("SimpleCard Component - Issue #330", () => {
  it("applies correct styling classes", () => {
    const { container } = render(
      <SimpleCard title="Styled Card"><p>Content</p></SimpleCard>
    );
    const cardElement = container.querySelector("div");
    expect(cardElement).toHaveClass("rounded-lg", "p-4", "shadow");
  });

  it("renders with proper semantic structure", () => {
    render(
      <SimpleCard title="Semantic Card">
        <span>Nested Content</span>
      </SimpleCard>
    );
    const title = screen.getByText("Semantic Card");
    expect(title.tagName).toBe("H3");
    expect(title).toHaveClass("font-bold");
  });
});


describe("SimpleCard Component - Issue #335", () => {
  it("supports custom children types", () => {
    const { container } = render(
      <SimpleCard title="Multi-child Card">
        <span>Child 1</span>
        <span>Child 2</span>
        <span>Child 3</span>
      </SimpleCard>
    );
    expect(screen.getByText("Child 1")).toBeInTheDocument();
    expect(screen.getByText("Child 2")).toBeInTheDocument();
    expect(screen.getByText("Child 3")).toBeInTheDocument();
    expect(container.querySelectorAll("span").length).toBe(3);
  });

  it("renders with complex nested content", () => {
    render(
      <SimpleCard title="Complex Card">
        <div>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </div>
      </SimpleCard>
    );
    expect(screen.getByText("Complex Card")).toBeInTheDocument();
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("maintains title prominence with semantic HTML", () => {
    const { container } = render(
      <SimpleCard title="Semantic Test">
        <p>Body content</p>
      </SimpleCard>
    );
    const h3 = container.querySelector("h3");
    expect(h3).toBeInTheDocument();
    expect(h3?.textContent).toBe("Semantic Test");
  });
});
