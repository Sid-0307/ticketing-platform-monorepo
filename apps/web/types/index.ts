export interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  venue: string;
  totalTickets: number;
  bookedTickets: number;
  basePrice: string;
  minPrice: string;
  maxPrice: string;
  pricingRules: {
    timeBasedWeight?: number;
    demandBasedWeight?: number;
    inventoryBasedWeight?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EventWithPricing extends Event {
  currentPrice: number;
  availableTickets: number;
}

export interface PriceAdjustment {
  value: number;
  weight: number;
}

export interface PriceBreakdown {
  basePrice: number;
  adjustments: {
    time: PriceAdjustment;
    demand: PriceAdjustment;
    inventory: PriceAdjustment;
  };
  finalPrice: number;
  appliedFloor: boolean;
  appliedCeiling: boolean;
}

export interface EventDetail extends Event {
  currentPrice: number;
  availableTickets: number;
  priceBreakdown: PriceBreakdown;
}

export interface Booking {
  id: number;
  eventId: number;
  userEmail: string;
  quantity: number;
  totalPrice: string;
  createdAt: string;
}

export interface BookingWithEvent extends Booking {
  event?: EventWithPricing;
}

export interface EventAnalytics {
  eventId: number;
  eventName: string;
  totalTickets: number;
  totalSold: number;
  remainingTickets: number;
  totalRevenue: string;
  averagePrice: string;
  bookingCount: number;
}

export interface SystemSummary {
  totalEvents: number;
  totalTicketsSold: number;
  totalRevenue: string;
  totalBookings: number;
  averageTicketPrice: string;
  topEvents: Array<{
    id: number;
    name: string;
    ticketsSold: number;
    revenue: string;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
}

export interface CreateBookingDto {
  eventId: number;
  userEmail: string;
  quantity: number;
}

export interface CreateEventDto {
  name: string;
  description: string;
  date: string;
  venue: string;
  totalTickets: number;
  basePrice: string;
  minPrice: string;
  maxPrice: string;
  pricingRules?: {
    timeBasedWeight?: number;
    demandBasedWeight?: number;
    inventoryBasedWeight?: number;
  };
}
