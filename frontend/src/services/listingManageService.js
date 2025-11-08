import request from "@/utils/request";

/**
 * Listing Management API Service
 */

export async function getListings() {
  return await request.get("/listings");
}

export async function addListing(params) {
  return await request.post("/listings/new", params);
}

export async function getListing(listingId) {
  return await request.get(`/listings/${listingId}`);
}
