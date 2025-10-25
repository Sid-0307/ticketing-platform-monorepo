import { Injectable, NotFoundException } from "@nestjs/common";
import { db, events, bookings } from "@repo/database";
import { eq, sql } from "drizzle-orm";

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

@Injectable()
export class AnalyticsService {
  async getEventAnalytics(eventId: number): Promise<EventAnalytics> {
    const eventResult = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId));

    if (!eventResult[0]) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    const event = eventResult[0];

    const eventBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.eventId, eventId));

    const totalSold = event.bookedTickets;
    const remainingTickets = event.totalTickets - event.bookedTickets;
    const bookingCount = eventBookings.length;

    let totalRevenue = 0;
    let totalTicketsFromBookings = 0;

    eventBookings.forEach((booking) => {
      totalRevenue += parseFloat(booking.totalPrice);
      totalTicketsFromBookings += booking.quantity;
    });

    const averagePrice =
      totalTicketsFromBookings > 0
        ? totalRevenue / totalTicketsFromBookings
        : 0;

    return {
      eventId: event.id,
      eventName: event.name,
      totalTickets: event.totalTickets,
      totalSold,
      remainingTickets,
      totalRevenue: totalRevenue.toFixed(2),
      averagePrice: averagePrice.toFixed(2),
      bookingCount,
    };
  }

  async getSystemSummary(): Promise<SystemSummary> {
    const allEvents = await db.select().from(events);

    const allBookings = await db.select().from(bookings);

    const totalTicketsSold = allBookings.reduce((sum, booking) => {
      return sum + booking.quantity;
    }, 0);

    const totalRevenue = allBookings.reduce((sum, booking) => {
      return sum + parseFloat(booking.totalPrice);
    }, 0);

    const averageTicketPrice =
      totalTicketsSold > 0 ? totalRevenue / totalTicketsSold : 0;

    const eventsWithRevenue = await Promise.all(
      allEvents.map(async (event) => {
        const eventBookings = await db
          .select()
          .from(bookings)
          .where(eq(bookings.eventId, event.id));

        const revenue = eventBookings.reduce((sum, booking) => {
          return sum + parseFloat(booking.totalPrice);
        }, 0);

        return {
          id: event.id,
          name: event.name,
          ticketsSold: event.bookedTickets,
          revenue: revenue.toFixed(2),
        };
      })
    );

    const topEvents = eventsWithRevenue
      .sort((a, b) => b.ticketsSold - a.ticketsSold)
      .slice(0, 5);

    return {
      totalEvents: allEvents.length,
      totalTicketsSold,
      totalRevenue: totalRevenue.toFixed(2),
      totalBookings: allBookings.length,
      averageTicketPrice: averageTicketPrice.toFixed(2),
      topEvents,
    };
  }
}
