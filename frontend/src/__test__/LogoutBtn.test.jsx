import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import LogoutBtn from "../components/LogoutBtn";
import { logout as logoutAction } from "../store/slices/authSlice";
import { clearNotifications } from "../store/slices/notificationSlice";

const mockDispatch = vi.fn();
const mockState = {
  auth: {
    isAuthenticated: false,
  },
};

const mockUseAppSelector = vi.fn((selector) => selector(mockState));

vi.mock("../store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector) => mockUseAppSelector(selector),
}));

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const logoutAPIMock = vi.fn();
vi.mock("../services/authService", () => ({
  logoutAPI: () => logoutAPIMock(),
}));

describe("LogoutBtn", () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockNavigate.mockClear();
    logoutAPIMock.mockClear();
    mockState.auth.isAuthenticated = false;
  });

  it("navigates to login when user is not authenticated", () => {
    render(<LogoutBtn />);

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/login");
    expect(logoutAPIMock).not.toHaveBeenCalled();
  });

  it("logs out authenticated users and clears notifications", async () => {
    mockState.auth.isAuthenticated = true;
    logoutAPIMock.mockResolvedValueOnce({});

    render(<LogoutBtn />);

    fireEvent.click(screen.getByRole("button", { name: /logout/i }));

    await waitFor(() => {
      expect(logoutAPIMock).toHaveBeenCalled();
    });

    expect(mockDispatch).toHaveBeenCalledWith(logoutAction());
    expect(mockDispatch).toHaveBeenCalledWith(clearNotifications());
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("handles logout failures gracefully", async () => {
    mockState.auth.isAuthenticated = true;
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    logoutAPIMock.mockRejectedValueOnce(new Error("network"));

    render(<LogoutBtn />);

    fireEvent.click(screen.getByRole("button", { name: /logout/i }));

    await waitFor(() => {
      expect(logoutAPIMock).toHaveBeenCalled();
    });

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});

