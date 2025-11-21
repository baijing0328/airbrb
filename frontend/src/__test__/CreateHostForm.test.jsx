import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CreateHostForm from "../components/HostListing/CreateHostForm";

vi.mock("../components/HostListing/HostListingForm", () => ({
  __esModule: true,
  default: ({ onSuccess }) => (
    <div data-testid="mock-host-form">
      <button onClick={() => onSuccess?.()} data-testid="mock-submit">
        Submit Listing
      </button>
    </div>
  ),
}));

vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");
  const MockModal = ({ open, title, children, onCancel, footer }) => {
    if (!open) {
      return null;
    }
    return (
      <div data-testid="mock-modal">
        <div>{title}</div>
        <button onClick={onCancel}>Close</button>
        <div>{children}</div>
        {footer}
      </div>
    );
  };

  // Preserve confirm for other components if needed
  MockModal.confirm = actual.Modal.confirm;

  return {
    ...actual,
    Modal: MockModal,
  };
});

describe("CreateHostForm", () => {
  it("opens the create modal when the button is clicked", () => {
    render(<CreateHostForm />);

    expect(screen.queryByTestId("mock-modal")).not.toBeInTheDocument();

    const triggerButton = screen.getByRole("button", {
      name: /create new listing/i,
    });
    fireEvent.click(triggerButton);

    expect(screen.getByTestId("mock-modal")).toBeInTheDocument();
    expect(screen.getByTestId("mock-host-form")).toBeInTheDocument();
  });

  it("invokes onSuccess after the form completes", async () => {
    const handleSuccess = vi.fn();
    render(<CreateHostForm onSuccess={handleSuccess} />);

    fireEvent.click(
      screen.getByRole("button", { name: /create new listing/i })
    );

    fireEvent.click(screen.getByTestId("mock-submit"));

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.queryByTestId("mock-modal")).not.toBeInTheDocument();
    });
  });
});

