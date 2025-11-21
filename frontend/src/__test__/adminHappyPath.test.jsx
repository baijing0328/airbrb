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

const getListingsMock = vi.fn(async () => ({
  listings: backendState.listings.map((listing) => ({ id: listing.id })),
}));
const getListingMock = vi.fn(async (listingId) => {
  // Handle both number and string IDs
  const numericId =
    typeof listingId === "string" ? Number(listingId) : listingId;
  const listing = backendState.listings.find((item) => item.id === numericId);
  if (!listing) {
    throw new Error("Listing not found");
  }
  return { listing };
});
const newListingMock = vi.fn(async (params) => {
  const listing = {
    id: backendState.listingCounter++,
    owner: backendState.currentUserEmail,
    reviews: [],
    postedOn: null,
    availability: params.metadata?.availability || [],
    published: false,
    ...params,
  };
  backendState.listings.push(listing);
  return { listingId: listing.id };
});
const updateListingMock = vi.fn(async (listingId, params) => {
  // Handle both number and string IDs
  const numericId =
    typeof listingId === "string" ? Number(listingId) : listingId;
  const index = backendState.listings.findIndex(
    (listing) => listing.id === numericId
  );
  if (index === -1) {
    throw new Error("Listing not found");
  }
  backendState.listings[index] = {
    ...backendState.listings[index],
    ...params,
  };
  return { listing: backendState.listings[index] };
});
const publishListingMock = vi.fn(async (listingId, availability) => {
  // Handle both number and string IDs
  const numericId =
    typeof listingId === "string" ? Number(listingId) : listingId;
  const listing = backendState.listings.find((item) => item.id === numericId);
  if (!listing) {
    throw new Error("Listing not found");
  }
  listing.availability = availability;
  listing.published = true;
  listing.postedOn = new Date().toISOString();
  return {};
});
const unpublishListingMock = vi.fn(async (listingId) => {
  // Handle both number and string IDs
  const numericId =
    typeof listingId === "string" ? Number(listingId) : listingId;
  const listing = backendState.listings.find((item) => item.id === numericId);
  if (listing) {
    listing.published = false;
    listing.availability = [];
    listing.postedOn = null;
  }
  return {};
});

vi.mock("../services/listingManageService", () => ({
  getListings: () => getListingsMock(),
  getListing: (listingId) => getListingMock(listingId),
  newListing: (params) => newListingMock(params),
  updateListing: (listingId, params) => updateListingMock(listingId, params),
  publishListing: (listingId, availability) =>
    publishListingMock(listingId, availability),
  unpublishListing: (listingId) => unpublishListingMock(listingId),
}));

const getBookingsMock = vi.fn(async () => ({
  bookings: backendState.bookings,
}));

const newBookingMock = vi.fn(async (listingId, params) => {
  backendState.bookings.push({
    id: backendState.bookingCounter++,
    listingId: Number(listingId),
    owner: backendState.currentUserEmail,
    status: "pending",
    dateRange: params.dateRange,
    totalPrice: params.totalPrice,
  });
  return {};
});

vi.mock("../services/bookingService", () => ({
  getBookings: () => getBookingsMock(),
  newBooking: (listingId, params) => newBookingMock(listingId, params),
}));

vi.mock("../components/NotificationMenu", () => ({
  __esModule: true,
  default: () => null,
}));

vi.mock("../components/ProfitChart", () => ({
  __esModule: true,
  default: () => <div data-testid="profit-chart" />,
}));

vi.mock("../components/LocationMap", () => ({
  __esModule: true,
  default: () => <div data-testid="map-placeholder" />,
}));

const availabilityWindow = [
  {
    start: dayjs().add(1, "day").format("YYYY-MM-DD"),
    end: dayjs().add(5, "day").format("YYYY-MM-DD"),
  },
];

vi.mock("../components/HostListing/PublishHostItem", async () => {
  const React = await vi.importActual("react");
  const listingService = await import("../services/listingManageService");

  return {
    __esModule: true,
    default: ({ listingId, isPublished, onSuccess }) => {
      const handleClick = async () => {
        if (isPublished) {
          await listingService.unpublishListing(listingId);
        } else {
          await listingService.publishListing(listingId, availabilityWindow);
        }
        onSuccess?.();
      };
      return (
        <button onClick={handleClick}>
          {isPublished ? "Unpublish listing" : "Publish listing"}
        </button>
      );
    },
  };
});

vi.mock("../components/HostListing/HostListingForm", async () => {
  const React = await vi.importActual("react");
  const listingService = await import("../services/listingManageService");
  const { useEffect, useState } = React;

  return {
    __esModule: true,
    default: ({ mode, listingId, onSuccess }) => {
      const [title, setTitle] = useState("");
      const [thumbnail, setThumbnail] = useState("");

      useEffect(() => {
        if (mode === "edit" && listingId) {
          listingService.getListing(listingId).then(({ listing }) => {
            setTitle(listing.title || "");
            setThumbnail(listing.thumbnail || "");
          });
        } else if (mode === "create") {
          setTitle("");
          setThumbnail("");
        }
      }, [mode, listingId]);

      const handleSubmit = async (event) => {
        event.preventDefault();
        const payload = {
          title,
          thumbnail,
          price: 250,
          address: { formatted: "123 Test Street", city: "Sydney" },
          metadata: {
            bedrooms: 2,
            bathrooms: 1,
            amenities: ["WiFi"],
          },
        };

        if (mode === "create") {
          await listingService.newListing(payload);
        } else {
          await listingService.updateListing(listingId, payload);
        }
        onSuccess?.();
      };

      return (
        <form onSubmit={handleSubmit}>
          <label>
            Listing Title
            <input
              aria-label="Listing title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Listing title"
            />
          </label>
          <label>
            Thumbnail URL
            <input
              aria-label="Thumbnail url"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder="Thumbnail URL"
            />
          </label>
          <button type="submit">
            {mode === "create" ? "Create Listing" : "Save Changes"}
          </button>
        </form>
      );
    },
  };
});

vi.mock("../components/HostListing/HostItem", async () => {
  const React = await vi.importActual("react");
  const { default: PublishHostItem } = await import(
    "../components/HostListing/PublishHostItem"
  );
  const { useNavigate } = await vi.importActual("react-router-dom");

  return {
    __esModule: true,
    default: ({ listing, listingId, isPublished, onPublishSuccess }) => {
      const navigate = useNavigate();
      return (
        <div data-testid={`host-card-${listingId}`}>
          <p>Listing: {listing.title}</p>
          <button onClick={() => navigate(`/host/edit/${listingId}`)}>
            Edit listing
          </button>
          <PublishHostItem
            listingId={listingId}
            isPublished={isPublished}
            onSuccess={onPublishSuccess}
          />
        </div>
      );
    },
  };
});

const renderWithProviders = (ui, { store, route = "/" } = {}) =>
  render(ui, {
    wrapper: ({ children }) => (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </Provider>
    ),
  });

const createTestStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      notification: notificationReducer,
    },
    preloadedState: {
      auth: {
        token: null,
        user: null,
        isAuthenticated: false,
      },
      notification: {
        notifications: [],
        seenBookings: {},
        lastUpdated: null,
      },
    },
  });

describe("Admin happy path UI flow", () => {
  const admin = {
    name: "Admin Tester",
    email: "admin@example.com",
    password: "S3cret!Pass",
  };
  beforeEach(() => {
    resetBackendState();
    localStorage.clear();
    mockNavigate.mockClear();
    registerAPIMock.mockClear();
    loginAPIMock.mockClear();
    logoutAPIMock.mockClear();
    newListingMock.mockClear();
    updateListingMock.mockClear();
    publishListingMock.mockClear();
    unpublishListingMock.mockClear();
    newBookingMock.mockClear();
    getListingsMock.mockClear();
    getListingMock.mockClear();
    getBookingsMock.mockClear();
    messageSpy.success.mockClear();
    messageSpy.error.mockClear();
    messageSpy.warning.mockClear();
  });
  it("registers, manages listings, books, and logs back in", async () => {
    const store = createTestStore();
    // Step 1: Register
    renderWithProviders(
      <Routes>
        <Route path="/register" element={<Register />} />
      </Routes>,
      { store, route: "/register" }
    );
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: admin.name },
    });
    fireEvent.change(screen.getByLabelText(/^email/i), {
      target: { value: admin.email },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: admin.password },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: admin.password },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    await waitFor(() =>
      expect(registerAPIMock).toHaveBeenCalledWith(
        admin.email,
        admin.password,
        admin.name
      )
    );
    expect(store.getState().auth.isAuthenticated).toBe(true);
    expect(mockNavigate).toHaveBeenCalledWith("/all");
    cleanup();
    // Step 2: Create listing on host page
    const initialTitle = "Harbour Hideaway";
    const initialThumbnail = "https://example.com/harbour.png";
    renderWithProviders(
      <Routes>
        <Route path="/host" element={<Host />} />
      </Routes>,
      { store, route: "/host" }
    );
    await screen.findByText(/Past 30 Days Profit/i);
    fireEvent.click(
      screen.getByRole("button", { name: /create new listing/i })
    );
    fireEvent.change(screen.getByLabelText(/listing title/i), {
      target: { value: initialTitle },
    });
    fireEvent.change(screen.getByLabelText(/thumbnail url/i), {
      target: { value: initialThumbnail },
    });
    fireEvent.click(screen.getByText(/create listing/i));
    await waitFor(() => expect(newListingMock).toHaveBeenCalled());
    expect(
      await screen.findByText(`Listing: ${initialTitle}`)
    ).toBeInTheDocument();
    const listingId = backendState.listings[0].id;
    cleanup();
    // Step 3: Update listing via edit page
    const updatedTitle = "Ocean Retreat";
    const updatedThumbnail = "https://example.com/ocean.png";

    renderWithProviders(
      <Routes>
        <Route path="/host/edit/:listingId" element={<EditHostListing />} />
      </Routes>,
      { store, route: `/host/edit/${listingId}` }
    );
    await screen.findByDisplayValue(initialTitle);

    fireEvent.change(screen.getByLabelText(/listing title/i), {
      target: { value: updatedTitle },
    });
    fireEvent.change(screen.getByLabelText(/thumbnail url/i), {
      target: { value: updatedThumbnail },
    });
    fireEvent.click(screen.getByText(/save changes/i));

    await waitFor(() =>
      expect(updateListingMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything()
      )
    );
    expect(mockNavigate).toHaveBeenCalledWith("/host");

    cleanup();

    // Step 4 & 5: Publish then unpublish listing
    renderWithProviders(
      <Routes>
        <Route path="/host" element={<Host />} />
      </Routes>,
      { store, route: "/host" }
    );

    await screen.findByText(`Listing: ${updatedTitle}`);

    fireEvent.click(screen.getByRole("button", { name: /publish listing/i }));
    await waitFor(() =>
      expect(publishListingMock).toHaveBeenCalledWith(
        listingId,
        availabilityWindow
      )
    );
    expect(
      await screen.findByRole("button", { name: /unpublish listing/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /unpublish listing/i }));
    await waitFor(() =>
      expect(unpublishListingMock).toHaveBeenCalledWith(listingId)
    );

    // Re-publish to make booking possible in the next step
    fireEvent.click(screen.getByRole("button", { name: /publish listing/i }));
    await waitFor(() => expect(publishListingMock).toHaveBeenCalledTimes(2));

    cleanup();

    // Step 6: Make booking as guest on listing view
    renderWithProviders(
      <Routes>
        <Route path="/listing/:listingId" element={<ListingView />} />
      </Routes>,
      { store, route: `/listing/${listingId}` }
    );
    await screen.findByText(updatedTitle);
    fireEvent.change(screen.getByLabelText(/start date/i), {
      target: { value: availabilityWindow[0].start },
    });
    fireEvent.change(screen.getByLabelText(/end date/i), {
      target: { value: availabilityWindow[0].end },
    });
    fireEvent.click(screen.getByRole("button", { name: /request booking/i }));
    await waitFor(() =>
      expect(newBookingMock).toHaveBeenCalledWith(
        String(listingId),
        expect.objectContaining({
          dateRange: expect.any(Object),
        })
      )
    );
    expect(messageSpy.success).toHaveBeenCalledWith(
      "Booking request submitted!"
    );
    cleanup();
    // Step 7: Logout
    renderWithProviders(<LogoutBtn />, { store });
    fireEvent.click(screen.getByRole("button", { name: /logout/i }));
    await waitFor(() => expect(logoutAPIMock).toHaveBeenCalled());
    expect(store.getState().auth.isAuthenticated).toBe(false);
    cleanup();
    // Step 8: Login again
    renderWithProviders(
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>,
      { store, route: "/login" }
    );
    fireEvent.change(screen.getByLabelText(/^email/i), {
      target: { value: admin.email },
    });
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: admin.password },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() =>
      expect(loginAPIMock).toHaveBeenCalledWith(admin.email, admin.password)
    );
    expect(store.getState().auth.isAuthenticated).toBe(true);
    expect(mockNavigate).toHaveBeenCalledWith("/all");
  }, 20000);
});