import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../Button";

describe("Button Component", () => {
  it("renders button with text", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: /click me/i }),
    ).toBeInTheDocument();
  });

  it("applies primary variant by default", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toHaveClass("bg-brand-orange");
    expect(button).toHaveClass("w-auto");
  });

  it("renders full width when requested", () => {
    render(<Button fullWidth>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toHaveClass("w-full");
  });

  it("applies secondary variant when specified", () => {
    render(<Button variant="secondary">Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toHaveClass("border");
  });

  it("renders the compact size when specified", () => {
    render(<Button size="sm">Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toHaveClass("h-9");
  });

  it("handles click events", async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });

    await userEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disables button when disabled prop is true", () => {
    render(<Button disabled>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass("bg-[#e5e7eb]");
  });

  it("shows loading state", () => {
    render(<Button isLoading>Click me</Button>);
    const button = screen.getByRole("button", { name: /loading/i });
    expect(button).toBeDisabled();
  });

  it("disables button when loading", async () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} isLoading>
        Click me
      </Button>,
    );
    const button = screen.getByRole("button", { name: /loading/i });

    await userEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
