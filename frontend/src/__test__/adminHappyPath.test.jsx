import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { Provider } from "react-redux";
import {
  describe,
  expect,
  it,
  beforeEach,
  beforeAll,
  afterAll,
  vi,
} from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import dayjs from "dayjs";
import Register from "../pages/Register";
import Host from "../pages/Listing/Host";
import EditHostListing from "../pages/Listing/EditHostListing";
import ListingView from "../pages/Listing/ViewListing";
import Login from "../pages/Login";
import LogoutBtn from "../components/LogoutBtn";
import authReducer from "../store/slices/authSlice";
import notificationReducer from "../store/slices/notificationSlice";

const mockNavigate = vi.hoisted(() => vi.fn());
const messageSpy = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
}));
const matchMediaMock = vi.hoisted(() =>
  vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
);
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const backendState = {
  users: {},
  listings: [],
  bookings: [],
  currentUserEmail: null,
  listingCounter: 1,
  bookingCounter: 1,
};

const resetBackendState = () => {
  backendState.users = {};
  backendState.listings = [];
  backendState.bookings = [];
  backendState.currentUserEmail = null;
  backendState.listingCounter = 1;
  backendState.bookingCounter = 1;
};

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: matchMediaMock,
  });
});

afterAll(() => {
  window.matchMedia = undefined;
});

vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");

  const MockModal = ({ open, title, children, onCancel, footer }) => {
    if (!open) return null;
    return (
      <div data-testid="mock-modal">
        {title && <h3>{title}</h3>}
        <div>{children}</div>
        {footer}
        <button onClick={onCancel}>Close</button>
      </div>
    );
  };

  const MockDrawer = ({ open, children }) => {
    if (!open) return null;
    return <div data-testid="mock-drawer">{children}</div>;
  };

  const MockRangePicker = ({ value = [], onChange }) => {
    const normalizeValue = (input) =>
      input && dayjs.isDayjs(input) ? input : input ? dayjs(input) : null;
    const safeValue = [normalizeValue(value[0]), normalizeValue(value[1])];
    const handleChange = (index) => (event) => {
      const next = [...safeValue];
      next[index] = event.target.value ? dayjs(event.target.value) : null;
      onChange?.(next);
    };
    return (
      <div>
        <input
          aria-label="Start date"
          type="date"
          value={safeValue[0] ? safeValue[0].format("YYYY-MM-DD") : ""}
          onChange={handleChange(0)}
        />
        <input
          aria-label="End date"
          type="date"
          value={safeValue[1] ? safeValue[1].format("YYYY-MM-DD") : ""}
          onChange={handleChange(1)}
        />
      </div>
    );
  };

  return {
    ...actual,
    Modal: MockModal,
    Drawer: MockDrawer,
    DatePicker: {
      ...actual.DatePicker,
      RangePicker: MockRangePicker,
    },
    message: messageSpy,
  };
});

const registerAPIMock = vi.fn(async (email, password, name) => {
  const token = `token-${email}`;
  backendState.users[email] = { password, name, token };
  backendState.currentUserEmail = email;
  return { token, user: { email, name } };
});
const loginAPIMock = vi.fn(async (email, password) => {
  const user = backendState.users[email];
  if (!user || user.password !== password) {
    throw new Error("Invalid credentials");
  }
  backendState.currentUserEmail = email;
  return { token: user.token, user: { email, name: user.name } };
});
const logoutAPIMock = vi.fn(async () => {
  backendState.currentUserEmail = null;
  return {};
});

vi.mock("../services/authService", () => ({
  registerAPI: (...args) => registerAPIMock(...args),
  loginAPI: (...args) => loginAPIMock(...args),
  logoutAPI: () => logoutAPIMock(),
}));
