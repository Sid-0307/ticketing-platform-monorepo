import { Injectable } from "@nestjs/common";
import { Event, bookings } from "@repo/database";
import { db } from "@repo/database";
import { eq, and, gte } from "drizzle-orm";
import { RedisService } from "../redis/redis.service";

interface PricingBreakdown {
  basePrice: number;
  timeAdjustment: number;
  demandAdjustment: number;
  inventoryAdjustment: number;
  finalPrice: number;
  appliedFloor: boolean;
  appliedCeiling: boolean;
}

@Injectable()
export class PricingService {
  constructor(private readonly redisService: RedisService) {}

  private readonly TIME_WEIGHT = parseFloat(process.env.TIME_WEIGHT || "0.3");
  private readonly DEMAND_WEIGHT = parseFloat(
    process.env.DEMAND_WEIGHT || "0.4"
  );
  private readonly INVENTORY_WEIGHT = parseFloat(
    process.env.INVENTORY_WEIGHT || "0.3"
  );

  private calculateTimeAdjustment(eventDate: Date): number {
    const now = new Date();
    const eventDateObj =
      typeof eventDate === "string" ? new Date(eventDate) : eventDate;
    const daysUntilEvent = Math.ceil(
      (eventDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilEvent < 0) {
      return 0;
    } else if (daysUntilEvent <= 1) {
      return 0.5; // +50%
    } else if (daysUntilEvent <= 3) {
      return 0.3; // +30%
    } else if (daysUntilEvent <= 7) {
      return 0.2; // +20%
    } else if (daysUntilEvent <= 14) {
      return 0.1; // +10%
    } else {
      return 0; // No adjustment
    }
  }

  private calculateInventoryAdjustment(
    totalTickets: number,
    bookedTickets: number
  ): number {
    const percentRemaining = (totalTickets - bookedTickets) / totalTickets;

    if (percentRemaining <= 0) {
      return 0;
    } else if (percentRemaining <= 0.1) {
      return 0.4; // +40%
    } else if (percentRemaining <= 0.2) {
      return 0.25; // +25%
    } else if (percentRemaining <= 0.5) {
      return 0.15; // +15%
    } else {
      return 0;
    }
  }

  private async calculateDemandAdjustment(eventId: number): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentBookings = await db
      .select()
      .from(bookings)
      .where(
        and(eq(bookings.eventId, eventId), gte(bookings.createdAt, oneHourAgo))
      );

    const bookingCount = recentBookings.length;

    if (bookingCount >= 15) {
      return 0.5; // +50%
    } else if (bookingCount >= 10) {
      return 0.35; // +35%
    } else if (bookingCount >= 5) {
      return 0.2; // +20%
    } else if (bookingCount >= 3) {
      return 0.1; // +10%
    } else {
      return 0;
    }
  }

  async calculatePrice(event: Event): Promise<PricingBreakdown> {
    return this.redisService.getOrSet(
      `pricing:${event.id}:${event.bookedTickets}`,
      async () => {
        const basePrice = parseFloat(event.basePrice);
        const minPrice = parseFloat(event.minPrice);
        const maxPrice = parseFloat(event.maxPrice);

        const timeAdjustment = this.calculateTimeAdjustment(event.date);
        const inventoryAdjustment = this.calculateInventoryAdjustment(
          event.totalTickets,
          event.bookedTickets
        );
        const demandAdjustment = await this.calculateDemandAdjustment(event.id);

        const totalAdjustment =
          timeAdjustment * this.TIME_WEIGHT +
          demandAdjustment * this.DEMAND_WEIGHT +
          inventoryAdjustment * this.INVENTORY_WEIGHT;

        let finalPrice = basePrice * (1 + totalAdjustment);

        let appliedFloor = false;
        let appliedCeiling = false;

        if (finalPrice < minPrice) {
          finalPrice = minPrice;
          appliedFloor = true;
        }

        if (finalPrice > maxPrice) {
          finalPrice = maxPrice;
          appliedCeiling = true;
        }

        finalPrice = Math.round(finalPrice * 100) / 100;

        return {
          basePrice,
          timeAdjustment,
          demandAdjustment,
          inventoryAdjustment,
          finalPrice,
          appliedFloor,
          appliedCeiling,
        };
      },
      15
    );
  }

  async calculatePricesForEvents(
    events: Event[]
  ): Promise<Map<number, PricingBreakdown>> {
    const priceMap = new Map<number, PricingBreakdown>();

    for (const event of events) {
      const pricing = await this.calculatePrice(event);
      priceMap.set(event.id, pricing);
    }

    return priceMap;
  }
}
