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
