import request from "@/utils/request";

/**
 * Booking API Service
 */

export async function getBookings() {
  return await request.get("/bookings");
}

export async function newBooking(listingid, params) {
  return await request.post(`/bookings/new/${listingid}`, params);
}

export async function acceptBooking(bookingid) {
  return await request.put(`/bookings/accept/${bookingid}`);
}

export async function declineBooking(bookingid) {
  return await request.put(`/bookings/decline/${bookingid}`);
}

export async function deleteBooking(bookingid) {
  return await request.delete(`/bookings/${bookingid}`);
}
