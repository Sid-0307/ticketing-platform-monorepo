import { Test, TestingModule } from "@nestjs/testing";
import { BookingsService } from "./booking.service";
import { EventsService } from "./events.service";
import { PricingService } from "./pricing.service";
import { RedisService } from "../redis/redis.service";
import { db, events, bookings } from "@repo/database";
import { eq } from "drizzle-orm";

describe("Booking Flow Integration Tests", () => {
  let bookingsService: BookingsService;
  let pricingService: PricingService;
  let testEventId: number;

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
    pricingService = module.get<PricingService>(PricingService);
  });

  beforeEach(async () => {
    await db.delete(bookings);
    await db.delete(events);

    const [event] = await db
      .insert(events)
      .values({
        name: "Test Event",
        description: "Test",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        venue: "Test Venue",
        totalTickets: 100,
        bookedTickets: 50,
        basePrice: "100.00",
        minPrice: "80.00",
        maxPrice: "200.00",
        pricingRules: {},
      })
      .returning();

    testEventId = event!.id;
  });

  afterAll(async () => {
    await db.delete(bookings);
    await db.delete(events);
  });

  describe("Complete Booking Flow", () => {
    it("should create booking and update inventory", async () => {
      const booking = await bookingsService.create({
        eventId: testEventId,
        userEmail: "test@example.com",
        quantity: 5,
      });

      expect(booking).toBeDefined();
      expect(booking.eventId).toBe(testEventId);
      expect(booking.quantity).toBe(5);
      expect(parseFloat(booking.totalPrice)).toBeGreaterThan(0);

      const eventResult = await db
        .select()
        .from(events)
        .where(eq(events.id, testEventId));

      expect(eventResult[0]!.bookedTickets).toBe(55);
    });

    it("should reject booking when insufficient tickets", async () => {
      await expect(
        bookingsService.create({
          eventId: testEventId,
          userEmail: "test@example.com",
          quantity: 51,
        })
      ).rejects.toThrow("Not enough tickets available");

      const allBookings = await db
        .select()
        .from(bookings)
        .where(eq(bookings.eventId, testEventId));
      expect(allBookings.length).toBe(0);
    });

    it("should handle multiple sequential bookings", async () => {
      await bookingsService.create({
        eventId: testEventId,
        userEmail: "user1@example.com",
        quantity: 10,
      });

      await bookingsService.create({
        eventId: testEventId,
        userEmail: "user2@example.com",
        quantity: 15,
      });

      const eventResult = await db
        .select()
        .from(events)
        .where(eq(events.id, testEventId));

      expect(eventResult[0]!.bookedTickets).toBe(75);

      const allBookings = await db
        .select()
        .from(bookings)
        .where(eq(bookings.eventId, testEventId));
      expect(allBookings.length).toBe(2);
    });
  });

  describe("Validation Tests", () => {
    it("should reject invalid email", async () => {
      await expect(
        bookingsService.create({
          eventId: testEventId,
          userEmail: "invalid-email",
          quantity: 1,
        })
      ).rejects.toThrow("Invalid email format");
    });

    it("should reject zero quantity", async () => {
      await expect(
        bookingsService.create({
          eventId: testEventId,
          userEmail: "test@example.com",
          quantity: 0,
        })
      ).rejects.toThrow();
    });

    it("should reject non-existent event", async () => {
      await expect(
        bookingsService.create({
          eventId: 99999,
          userEmail: "test@example.com",
          quantity: 1,
        })
      ).rejects.toThrow();
    });
  });

  describe("Pricing Integration", () => {
    it("should calculate price correctly", async () => {
      const eventResult = await db
        .select()
        .from(events)
        .where(eq(events.id, testEventId));

      const pricing = await pricingService.calculatePrice(eventResult[0]!);

      expect(pricing.finalPrice).toBeGreaterThan(0);
      expect(pricing.basePrice).toBe(100);
    });

    it("should increase price as inventory decreases", async () => {
      const initialEventResult = await db
        .select()
        .from(events)
        .where(eq(events.id, testEventId));

      const initialPricing = await pricingService.calculatePrice(
        initialEventResult[0]!
      );

      await bookingsService.create({
        eventId: testEventId,
        userEmail: "test@example.com",
        quantity: 40,
      });

      const updatedEventResult = await db
        .select()
        .from(events)
        .where(eq(events.id, testEventId));

      const newPricing = await pricingService.calculatePrice(
        updatedEventResult[0]!
      );

      expect(newPricing.inventoryAdjustment).toBeGreaterThan(
        initialPricing.inventoryAdjustment
      );
    });
  });
});
