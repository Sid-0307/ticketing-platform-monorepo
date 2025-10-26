"use server";

import { api } from "../lib/api";
import { CreateBookingDto } from "../types/index";
import { revalidatePath } from "next/cache";

export async function createBooking(data: CreateBookingDto) {
  try {
    const booking = await api.bookings.create(data);

    // Revalidate ALL relevant pages
    revalidatePath("/"); // Homepage
    revalidatePath("/events"); // Events list
    revalidatePath(`/events/${data.eventId}`); // Specific event
    revalidatePath("/my-bookings"); // My bookings (in case user checks)

    return {
      success: true,
      booking,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to create booking",
    };
  }
}
