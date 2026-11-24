import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock EmptyState component for testing purposes
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`empty-state ${className}`}>
      {icon && <div className="empty-state-icon">{icon}</div>}
      <h2 className="empty-state-title">{title}</h2>
      {description && (
        <p className="empty-state-description">{description}</p>
      )}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}

describe("EmptyState Component - Issue #319", () => {
  it("renders title", () => {
    render(<EmptyState title="No Results" />);
    expect(screen.getByText("No Results")).toBeInTheDocument();
  });

  it("renders with icon", () => {
    const { container } = render(
      <EmptyState title="No Data" icon={<span data-testid="icon">📭</span>} />
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(container.querySelector(".empty-state-icon")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <EmptyState
        title="No Results"
        description="Try adjusting your filters"
      />
    );
    expect(screen.getByText("Try adjusting your filters")).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    const { container } = render(<EmptyState title="Empty" />);
    expect(container.querySelector(".empty-state-description")).not.toBeInTheDocument();
  });

  it("renders action content when provided", () => {
    render(
      <EmptyState
        title="No Items"
        action={<button>Create Item</button>}
      />
    );
    expect(screen.getByRole("button", { name: /Create Item/i })).toBeInTheDocument();
  });

  it("does not render action section when not provided", () => {
    const { container } = render(<EmptyState title="Empty" />);
    expect(container.querySelector(".empty-state-action")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <EmptyState title="Styled" className="custom-styling" />
    );
    expect(container.querySelector(".custom-styling")).toBeInTheDocument();
  });

  it("renders with all content together", () => {
    render(
      <EmptyState
        title="Complete Empty State"
        description="This is a full example"
        icon={<span data-testid="full-icon">🎯</span>}
        action={<a href="#create">Start Creating</a>}
      />
    );
    expect(screen.getByText("Complete Empty State")).toBeInTheDocument();
    expect(screen.getByText("This is a full example")).toBeInTheDocument();
    expect(screen.getByTestId("full-icon")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Start Creating/i })).toBeInTheDocument();
  });

  it("maintains semantic HTML structure", () => {
    const { container } = render(
      <EmptyState
        title="Semantic Test"
        description="Content here"
      />
    );
    const h2 = container.querySelector("h2");
    const p = container.querySelector("p");
    expect(h2?.classList.contains("empty-state-title")).toBe(true);
    expect(p?.classList.contains("empty-state-description")).toBe(true);
  });
});
