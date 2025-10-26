// apps/web/src/lib/api.ts

import {
  ApiResponse,
  EventWithPricing,
  EventDetail,
  Booking,
  CreateBookingDto,
  EventAnalytics,
  SystemSummary,
} from "../types/index";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.message || "An error occurred",
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError) {
      throw new ApiError(0, "Network error. Please check your connection.");
    }

    throw new ApiError(500, "An unexpected error occurred");
  }
}

export const api = {
  // Events
  events: {
    getAll: async (): Promise<EventWithPricing[]> => {
      const response =
        await fetcher<ApiResponse<EventWithPricing[]>>("/events");
      return response.data;
    },

    getById: async (id: number): Promise<EventDetail> => {
      const response = await fetcher<ApiResponse<EventDetail>>(`/events/${id}`);
      return response.data;
    },

    create: async (data: any): Promise<any> => {
      const response = await fetcher<ApiResponse<any>>("/events", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.data;
    },
  },

  // Bookings
  bookings: {
    create: async (data: CreateBookingDto): Promise<Booking> => {
      const response = await fetcher<ApiResponse<Booking>>("/bookings", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.data;
    },

    getByEventId: async (eventId: number): Promise<Booking[]> => {
      const response = await fetcher<ApiResponse<Booking[]>>(
        `/bookings?eventId=${eventId}`
      );
      return response.data;
    },

    getByEmail: async (email: string): Promise<Booking[]> => {
      const response = await fetcher<ApiResponse<Booking[]>>(
        `/bookings?userEmail=${encodeURIComponent(email)}`
      );
      return response.data;
    },
  },

  // Analytics
  analytics: {
    getEventAnalytics: async (eventId: number): Promise<EventAnalytics> => {
      const response = await fetcher<ApiResponse<EventAnalytics>>(
        `/analytics/events/${eventId}`
      );
      return response.data;
    },

    getSystemSummary: async (): Promise<SystemSummary> => {
      const response =
        await fetcher<ApiResponse<SystemSummary>>("/analytics/summary");
      return response.data;
    },
  },

  // Development
  seed: async (): Promise<any> => {
    const response = await fetcher<any>("/seed", {
      method: "POST",
    });
    return response;
  },
};

export { ApiError };
