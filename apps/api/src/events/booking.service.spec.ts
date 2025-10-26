import { Test, TestingModule } from "@nestjs/testing";
import { BookingsService } from "./booking.service";
import { EventsService } from "./events.service";
import { PricingService } from "./pricing.service";
import { RedisService } from "../redis/redis.service";
import { db, events, bookings } from "@repo/database";
import { eq } from "drizzle-orm";

describe("Concurrency Tests", () => {
  let bookingsService: BookingsService;
  let eventId: number;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        EventsService,
        PricingService,
        {
          provide: RedisService,
          useValue: {
            getOrSet: jest.fn((key, callback) => callback()),
            del: jest.fn().mockResolvedValue(true),
            delPattern: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    bookingsService = module.get<BookingsService>(BookingsService);
  });

  beforeEach(async () => {
    await db.delete(bookings);
    await db.delete(events);

    const [event] = await db
      .insert(events)
      .values({
        name: "Concurrency Test",
        description: "Test",
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        venue: "Test Venue",
        totalTickets: 10,
        bookedTickets: 0,
        basePrice: "100.00",
        minPrice: "80.00",
        maxPrice: "200.00",
        pricingRules: {},
      })
      .returning();

    eventId = event!.id;
  });

  afterAll(async () => {
    await db.delete(bookings);
    await db.delete(events);
  });

  it("should prevent overbooking when 2 users book last ticket simultaneously", async () => {
    await db
      .update(events)
      .set({ totalTickets: 1, bookedTickets: 0 })
      .where(eq(events.id, eventId));

    const results = await Promise.allSettled([
      bookingsService.create({
        eventId,
        userEmail: "user1@test.com",
        quantity: 1,
      }),
      bookingsService.create({
        eventId,
        userEmail: "user2@test.com",
        quantity: 1,
      }),
    ]);

    const successCount = results.filter((r) => r.status === "fulfilled").length;

    expect(successCount).toBeLessThanOrEqual(1);

    const finalEvent = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId));

    expect(finalEvent[0]!.bookedTickets).toBeLessThanOrEqual(1);
  });

  it("should prevent overbooking with 5 concurrent requests for 3 tickets", async () => {
    await db
      .update(events)
      .set({ totalTickets: 10, bookedTickets: 7 })
      .where(eq(events.id, eventId));

    const results = await Promise.allSettled([
      bookingsService.create({
        eventId,
        userEmail: "user1@test.com",
        quantity: 1,
      }),
      bookingsService.create({
        eventId,
        userEmail: "user2@test.com",
        quantity: 1,
      }),
      bookingsService.create({
        eventId,
        userEmail: "user3@test.com",
        quantity: 1,
      }),
      bookingsService.create({
        eventId,
        userEmail: "user4@test.com",
        quantity: 1,
      }),
      bookingsService.create({
        eventId,
        userEmail: "user5@test.com",
        quantity: 1,
      }),
    ]);

    const successCount = results.filter((r) => r.status === "fulfilled").length;

    expect(successCount).toBeLessThanOrEqual(3);

    const finalEvent = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId));

    expect(finalEvent[0]!.bookedTickets).toBeLessThanOrEqual(10);

    const allBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.eventId, eventId));

    const totalBooked = allBookings.reduce((sum, b) => sum + b.quantity, 0);
    expect(finalEvent[0]!.bookedTickets).toBe(7 + totalBooked);
  });

  it("should prevent overbooking with bulk quantity requests", async () => {
    await db
      .update(events)
      .set({ totalTickets: 10, bookedTickets: 5 })
      .where(eq(events.id, eventId));

    await Promise.allSettled([
      bookingsService.create({
        eventId,
        userEmail: "user1@test.com",
        quantity: 3,
      }),
      bookingsService.create({
        eventId,
        userEmail: "user2@test.com",
        quantity: 3,
      }),
    ]);

    const finalEvent = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId));

    const allBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.eventId, eventId));

    const totalBooked = allBookings.reduce((sum, b) => sum + b.quantity, 0);

    expect(totalBooked).toBeLessThanOrEqual(5);
    expect(finalEvent[0]!.bookedTickets).toBeLessThanOrEqual(10);
    expect(finalEvent[0]!.bookedTickets).toBe(5 + totalBooked);
  });

  it("should maintain data consistency under concurrent load", async () => {
    await Promise.allSettled([
      bookingsService.create({
        eventId,
        userEmail: "user1@test.com",
        quantity: 2,
      }),
      bookingsService.create({
        eventId,
        userEmail: "user2@test.com",
        quantity: 3,
      }),
      bookingsService.create({
        eventId,
        userEmail: "user3@test.com",
        quantity: 4,
      }),
    ]);

    const finalEvent = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId));

    const allBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.eventId, eventId));

    const totalBooked = allBookings.reduce((sum, b) => sum + b.quantity, 0);

    expect(finalEvent[0]!.bookedTickets).toBe(totalBooked);
    expect(finalEvent[0]!.bookedTickets).toBeLessThanOrEqual(10);
  });
});
