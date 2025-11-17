import request from "@/utils/request";

/**
 * Booking API Service
 */

export async function getBookings() {
  return await request.get("/bookings");
}

