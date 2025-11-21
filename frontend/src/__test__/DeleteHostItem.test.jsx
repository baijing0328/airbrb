import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DeleteHostItem from "../components/HostListing/DeleteHostItem";

const modalConfirmSpy = vi.hoisted(() => vi.fn());
const messageSpies = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));
const deleteListingMock = vi.hoisted(() => vi.fn());

vi.mock("../services/listingManageService", () => ({
  deleteListing: deleteListingMock,
}));

vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");

  return {
    ...actual,
    Modal: {
      ...actual.Modal,
      confirm: (config) => {
        modalConfirmSpy(config);
        return config?.onOk?.();
      },
    },
    message: {
      ...actual.message,
      success: messageSpies.success,
      error: messageSpies.error,
    },
  };
});

describe("DeleteHostItem", () => {
  beforeEach(() => {
    deleteListingMock.mockResolvedValue({});
    modalConfirmSpy.mockClear();
    messageSpies.success.mockClear();
    messageSpies.error.mockClear();
    deleteListingMock.mockClear();
  });

  it("confirms before deleting a listing", async () => {
    const handleSuccess = vi.fn();
    render(<DeleteHostItem listingId={7} onSuccess={handleSuccess} />);

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    expect(modalConfirmSpy).toHaveBeenCalled();
    const confirmConfig = modalConfirmSpy.mock.calls[0][0];
    expect(confirmConfig.title).toMatch(/delete this listing/i);

    await waitFor(() => {
      expect(deleteListingMock).toHaveBeenCalledWith(7);
    });

    expect(messageSpies.success).toHaveBeenCalledWith(
      "Listing deleted successfully"
    );
    expect(handleSuccess).toHaveBeenCalledTimes(1);
  });

  it("shows error when deletion fails", async () => {
    deleteListingMock.mockRejectedValueOnce(new Error("network error"));
    render(<DeleteHostItem listingId={9} />);

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    await waitFor(() => {
      expect(deleteListingMock).toHaveBeenCalledWith(9);
    });

    expect(messageSpies.error).toHaveBeenCalledWith("Failed to delete listing");
  });
});

