import { Test, TestingModule } from "@nestjs/testing";
import { BookingsService } from "./booking.service";
import { EventsService } from "./events.service";
import { PricingService } from "./pricing.service";
import { db, events, bookings } from "@repo/database";
import { eq } from "drizzle-orm";

describe("BookingsService - Concurrency Control", () => {
  let bookingsService: BookingsService;
  let eventsService: EventsService;
  let pricingService: PricingService;
  let eventId: number;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookingsService, EventsService, PricingService],
    }).compile();

    bookingsService = module.get<BookingsService>(BookingsService);
    eventsService = module.get<EventsService>(EventsService);
    pricingService = module.get<PricingService>(PricingService);

    // Clear database
    await db.delete(bookings);
    await db.delete(events);

    // Create test event with only 1 ticket
    const [event] = await db
      .insert(events)
      .values({
        name: "Concurrency Test Event",
        description: "Testing concurrent bookings",
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        venue: "Test Venue",
        totalTickets: 1,
        bookedTickets: 0,
        basePrice: "100.00",
        minPrice: "80.00",
        maxPrice: "200.00",
        pricingRules: {
          timeBasedWeight: 0.3,
          demandBasedWeight: 0.4,
          inventoryBasedWeight: 0.3,
        },
      })
      .returning();

    if (!event) {
      throw new Error("Failed to seed test event");
    }

    eventId = event.id;
  });

  afterAll(async () => {
    // Cleanup
    await db.delete(bookings);
    await db.delete(events);
  });

  it("should prevent overbooking of last ticket when 2 users book simultaneously", async () => {
    const dto1 = {
      eventId,
      userEmail: "user1@test.com",
      quantity: 1,
    };

    const dto2 = {
      eventId,
      userEmail: "user2@test.com",
      quantity: 1,
    };

    // Execute both bookings simultaneously
    const results = await Promise.allSettled([
      bookingsService.create(dto1),
      bookingsService.create(dto2),
    ]);

    // Count successes and failures
    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const failCount = results.filter((r) => r.status === "rejected").length;

    // Exactly 1 should succeed, 1 should fail
    expect(successCount).toBe(1);
    expect(failCount).toBe(1);

    // Verify failure reason
    const failedResult = results.find(
      (r) => r.status === "rejected"
    ) as PromiseRejectedResult;
    expect(failedResult.reason.message).toContain(
      "Not enough tickets available"
    );

    // Verify only ONE booking was stored
    const allBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.eventId, eventId));
    expect(allBookings.length).toBe(1);

    // Verify event bookedTickets is exactly 1 (not 2!)
    const [updatedEvent] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId));

    expect(updatedEvent?.bookedTickets).toBe(1);
    expect(updatedEvent!.totalTickets - updatedEvent!.bookedTickets).toBe(0);
  });
});
