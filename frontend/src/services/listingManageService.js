import request from "@/utils/request";

/**
 * Listing Management API Service
 */

export async function getListings() {
  return await request.get("/listings");
}

export async function newListing(params) {
  return await request.post("/listings/new", params);
}

export async function getListing(listingid) {
  return await request.get(`/listings/${listingid}`, { listingid: listingid });
}

export async function updateListing(listingid, params) {
  return await request.put(`/listings/${listingid}`, params);
}

export async function deleteListing(listingid) {
  return await request.delete(`/listings/${listingid}`);
}

export async function publishListing(listingid, availability) {
  return await request.put(`/listings/publish/${listingid}`, { availability });
}

export async function unpublishListing(listingid) {
  return await request.put(`/listings/unpublish/${listingid}`);
}

export async function putListingReview(listingid, bookingid, review) {
  return await request.put(`/listings/${listingid}/review/${bookingid}`, {
    review,
  });
}
