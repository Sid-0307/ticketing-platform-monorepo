import { Test, TestingModule } from "@nestjs/testing";
import { PricingService } from "./pricing.service";
import { Event } from "@repo/database";

jest.mock("@repo/database", () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockResolvedValue([]),
  },
  bookings: {},
  eq: jest.fn(),
  and: jest.fn(),
  gte: jest.fn(),
}));

describe("PricingService", () => {
  let service: PricingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PricingService],
    }).compile();

    service = module.get<PricingService>(PricingService);

    process.env.TIME_WEIGHT = "0.3";
    process.env.DEMAND_WEIGHT = "0.4";
    process.env.INVENTORY_WEIGHT = "0.3";
  });

  const createMockEvent = (overrides?: Partial<Event>): Event => ({
    id: 1,
    name: "Test Event",
    description: "Test Description",
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    venue: "Test Venue",
    totalTickets: 100,
    bookedTickets: 50,
    basePrice: "100.00",
    minPrice: "80.00",
    maxPrice: "200.00",
    pricingRules: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe("Time-Based Pricing", () => {
    it("should apply 50% adjustment for events tomorrow", async () => {
      const event = createMockEvent({
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      });

      const pricing = await service.calculatePrice(event);

      expect(pricing.timeAdjustment).toBe(0.5);
    });

    it("should apply 30% adjustment for events in 2 days", async () => {
      const event = createMockEvent({
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      });

      const pricing = await service.calculatePrice(event);

      expect(pricing.timeAdjustment).toBe(0.3);
    });

    it("should apply 20% adjustment for events in 5 days", async () => {
      const event = createMockEvent({
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      });

      const pricing = await service.calculatePrice(event);

      expect(pricing.timeAdjustment).toBe(0.2);
    });

    it("should apply no adjustment for events 30+ days away", async () => {
      const event = createMockEvent({
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      const pricing = await service.calculatePrice(event);

      expect(pricing.timeAdjustment).toBe(0);
    });

    it("should apply no adjustment for past events", async () => {
      const event = createMockEvent({
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      });

      const pricing = await service.calculatePrice(event);

      expect(pricing.timeAdjustment).toBe(0);
    });
  });

  describe("Inventory-Based Pricing", () => {
    it("should apply 40% adjustment when less than 10% tickets remain", async () => {
      const event = createMockEvent({
        totalTickets: 100,
        bookedTickets: 95, // 5% remaining
      });

      const pricing = await service.calculatePrice(event);

      expect(pricing.inventoryAdjustment).toBe(0.4);
    });

    it("should apply 25% adjustment when less than 20% tickets remain", async () => {
      const event = createMockEvent({
        totalTickets: 100,
        bookedTickets: 85, // 15% remaining
      });

      const pricing = await service.calculatePrice(event);

      expect(pricing.inventoryAdjustment).toBe(0.25);
    });

    it("should apply 15% adjustment when less than 50% tickets remain", async () => {
      const event = createMockEvent({
        totalTickets: 100,
        bookedTickets: 60, // 40% remaining
      });

      const pricing = await service.calculatePrice(event);

      expect(pricing.inventoryAdjustment).toBe(0.15);
    });

    it("should apply no adjustment when plenty of tickets available", async () => {
      const event = createMockEvent({
        totalTickets: 100,
        bookedTickets: 20, // 80% remaining
      });

      const pricing = await service.calculatePrice(event);

      expect(pricing.inventoryAdjustment).toBe(0);
    });

    it("should apply no adjustment when sold out", async () => {
      const event = createMockEvent({
        totalTickets: 100,
        bookedTickets: 100, // 0% remaining
      });

      const pricing = await service.calculatePrice(event);

      expect(pricing.inventoryAdjustment).toBe(0);
    });
  });

  describe("Combined Pricing Rules", () => {
    it("should combine all adjustments with weights", async () => {
      const event = createMockEvent({
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow (0.5)
        totalTickets: 100,
        bookedTickets: 95, // 5% remaining (0.4)
        // Demand is 0 because we mock empty bookings
      });

      const pricing = await service.calculatePrice(event);

      const expectedPrice = 100 * (1 + 0.27);

      expect(pricing.finalPrice).toBe(127);
    });

    it("should round final price to 2 decimal places", async () => {
      const event = createMockEvent({
        basePrice: "99.99",
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 0.2 time
        totalTickets: 100,
        bookedTickets: 60, // 0.15 inventory
      });

      const pricing = await service.calculatePrice(event);

      expect(pricing.finalPrice.toString()).toMatch(/^\d+\.\d{2}$/);
    });
  });

  describe("Floor and Ceiling Constraints", () => {
    it("should apply floor price when calculated price is below minimum", async () => {
      const event = createMockEvent({
        basePrice: "50.00",
        minPrice: "100.00",
        maxPrice: "200.00",
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        totalTickets: 100,
        bookedTickets: 10,
      });

      const pricing = await service.calculatePrice(event);

      expect(pricing.finalPrice).toBe(100);
      expect(pricing.appliedFloor).toBe(true);
      expect(pricing.appliedCeiling).toBe(false);
    });

    it("should apply ceiling price when calculated price exceeds maximum", async () => {
      const event = createMockEvent({
        basePrice: "100.00",
        minPrice: "80.00",
        maxPrice: "120.00",
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        totalTickets: 100,
        bookedTickets: 95,
      });

      const pricing = await service.calculatePrice(event);

      expect(pricing.finalPrice).toBe(120);
      expect(pricing.appliedFloor).toBe(false);
      expect(pricing.appliedCeiling).toBe(true);
    });

    it("should not apply floor/ceiling when price is within range", async () => {
      const event = createMockEvent({
        basePrice: "100.00",
        minPrice: "80.00",
        maxPrice: "200.00",
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        totalTickets: 100,
        bookedTickets: 50,
      });

      const pricing = await service.calculatePrice(event);

      expect(pricing.appliedFloor).toBe(false);
      expect(pricing.appliedCeiling).toBe(false);
      expect(pricing.finalPrice).toBeGreaterThan(100);
      expect(pricing.finalPrice).toBeLessThan(200);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero base price", async () => {
      const event = createMockEvent({
        basePrice: "0.00",
      });

      const pricing = await service.calculatePrice(event);

      expect(pricing.finalPrice).toBeGreaterThanOrEqual(0);
    });

    it("should handle events with no tickets", async () => {
      const event = createMockEvent({
        totalTickets: 0,
        bookedTickets: 0,
      });

      const pricing = await service.calculatePrice(event);

      expect(pricing.inventoryAdjustment).toBe(0);
    });
  });
});
