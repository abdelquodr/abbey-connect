import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "../Input";

describe("Input Component", () => {
  it("renders input with label", () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("renders input with placeholder", () => {
    render(<Input placeholder="Enter email" />);
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
  });

  it("displays error message when error prop is provided", () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  });

  it("sets aria-invalid when error exists", () => {
    render(<Input error="Invalid email" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("renders password inputs with the correct type", () => {
    render(<Input type="password" placeholder="Enter password" />);
    const input = screen.getByPlaceholderText(/enter password/i);
    expect(input).toHaveAttribute("type", "password");
  });

  it("handles user input", async () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText(
      /enter text/i,
    ) as HTMLInputElement;

    await userEvent.type(input, "test value");
    expect(input.value).toBe("test value");
  });

  it("accepts different input types", () => {
    render(<Input type="email" placeholder="Enter email" />);
    const input = screen.getByPlaceholderText(/enter email/i);
    expect(input).toHaveAttribute("type", "email");
  });

  it("renders icon when provided", () => {
    render(
      <Input
        placeholder="Enter text"
        icon={<span data-testid="icon">★</span>}
      />,
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("sets aria-describedby when error exists", () => {
    render(<Input id="test-input" error="Error message" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-describedby", "test-input-error");
  });
});
