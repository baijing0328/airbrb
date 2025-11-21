import { createSlice } from "@reduxjs/toolkit";
import { getBookings } from "../../services/bookingService";
import { getListings } from "../../services/listingManageService";
import { selectUser } from "./authSlice";

const initialState = {
  notifications: [], // { id, message, type, read, timestamp, bookingId, link }
  seenBookings: {}, // { [bookingId]: status }
  lastUpdated: null,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift({
        ...action.payload,
        id: Date.now() + Math.random(),
        read: false,
        timestamp: new Date().toISOString(),
      });
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification) {
        notification.read = true;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => {
        n.read = true;
      });
    },
    // Initialize seen bookings without notifying (for first load)
    initializeSeenBookings: (state, action) => {
      // action.payload is array of bookings
      action.payload.forEach((booking) => {
        state.seenBookings[booking.id] = booking.status;
      });
      state.lastUpdated = Date.now();
    },
    // Update seen bookings and return diff (handled in thunk/hook usually, but we can just update here)
    // We will handle the logic of "what changed" in the hook/thunk and just use addNotification
    updateSeenBookingStatus: (state, action) => {
      const { bookingId, status } = action.payload;
      state.seenBookings[bookingId] = status;
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  initializeSeenBookings,
  updateSeenBookingStatus,
} = notificationSlice.actions;

export const selectNotifications = (state) => state.notification.notifications;
export const selectUnreadCount = (state) =>
  state.notification.notifications.filter((n) => !n.read).length;
export const selectSeenBookings = (state) => state.notification.seenBookings;
export const selectLastUpdated = (state) => state.notification.lastUpdated;

// Thunk for polling logic
export const pollNotifications = () => async (dispatch, getState) => {
  const state = getState();
  const user = selectUser(state);
  const seenBookings = selectSeenBookings(state);
  const lastUpdated = selectLastUpdated(state);

  if (!user) return;

  try {
    // Parallel fetch
    const [listingsRes, bookingsRes] = await Promise.all([
      getListings(),
      getBookings(),
    ]);

    const allListings = listingsRes.listings || [];
    const allBookings = bookingsRes.bookings || [];

    // Identify my listings (Host)
    const myListings = allListings.filter((l) => l.owner === user.email);
    const myListingIds = new Set(myListings.map((l) => l.id));

    // First load
    if (!lastUpdated) {
      dispatch(initializeSeenBookings(allBookings));
      return;
    }

    allBookings.forEach((booking) => {
      const oldStatus = seenBookings[booking.id];
      const newStatus = booking.status;

      // Host Logic: New booking request on my listing
      if (myListingIds.has(booking.listingId)) {
        // If we never saw this booking ID before, and it is pending -> Notification
        if (!oldStatus && newStatus === "pending") {
          const listingTitle =
            myListings.find((l) => l.id === booking.listingId)?.title ||
            booking.listingId;
          dispatch(
            addNotification({
              message: `New booking request for "${listingTitle}" by ${booking.owner}`,
              type: "host_request",
              bookingId: booking.id,
            })
          );
        }
      }

      // Guest Logic: Status change on my booking
      if (booking.owner === user.email) {
        if (oldStatus && oldStatus !== newStatus) {
          if (newStatus === "accepted" || newStatus === "declined") {
            const listingTitle =
              allListings.find((l) => l.id === booking.listingId)?.title ||
              booking.listingId;
            dispatch(
              addNotification({
                message: `Your booking for "${listingTitle}" has been ${newStatus}`,
                type: "guest_status",
                bookingId: booking.id,
              })
            );
          }
        }
      }

      // Update known status if changed or new
      if (oldStatus !== newStatus) {
        dispatch(
          updateSeenBookingStatus({ bookingId: booking.id, status: newStatus })
        );
      }
    });
  } catch (error) {
    // Silent fail usually, or log
    console.error("Polling error", error);
  }
};

export default notificationSlice.reducer;
