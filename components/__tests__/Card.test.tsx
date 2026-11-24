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
