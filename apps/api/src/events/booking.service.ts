import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { db, bookings, events, Booking } from "@repo/database";
import { eq } from "drizzle-orm";
import { PricingService } from "./pricing.service";
import { EventsService } from "./events.service";
import { RedisService } from "../redis/redis.service";

interface CreateBookingDto {
  eventId: number;
  userEmail: string;
  quantity: number;
}

@Injectable()
export class BookingsService {
  constructor(
    private readonly pricingService: PricingService,
    private readonly eventsService: EventsService,
    private readonly redisService: RedisService
  ) {}

  async create(dto: CreateBookingDto): Promise<Booking> {
    if (!dto.eventId || !dto.userEmail || !dto.quantity) {
      throw new BadRequestException("Missing required fields");
    }

    if (dto.quantity <= 0) {
      throw new BadRequestException("Quantity must be greater than 0");
    }

    if (!this.isValidEmail(dto.userEmail)) {
      throw new BadRequestException("Invalid email format");
    }

    const result = await db.transaction(async (tx) => {
      const event = await this.eventsService.lockEventForUpdate(
        dto.eventId,
        tx
      );

      if (!event) {
        throw new NotFoundException(`Event with ID ${dto.eventId} not found`);
      }

      const availableTickets = event.totalTickets - event.bookedTickets;
      if (availableTickets < dto.quantity) {
        throw new BadRequestException(
          `Not enough tickets available. Only ${availableTickets} tickets remaining.`
        );
      }

      const pricing = await this.pricingService.calculatePrice(event);
      const totalPrice = pricing.finalPrice * dto.quantity;

      const bookingResult = await tx
        .insert(bookings)
        .values({
          eventId: dto.eventId,
          userEmail: dto.userEmail,
          quantity: dto.quantity,
          totalPrice: totalPrice.toFixed(2),
        })
        .returning();

      if (!bookingResult[0]) {
        throw new BadRequestException("Failed to create booking");
      }

      await tx
        .update(events)
        .set({
          bookedTickets: event.bookedTickets + dto.quantity,
          updatedAt: new Date(),
        })
        .where(eq(events.id, dto.eventId));

      await this.redisService.delPattern("events:*");
      await this.redisService.delPattern("event:*");
      await this.redisService.delPattern("pricing:*");

      return bookingResult[0];
    });

    return result;
  }

  async findByEventId(eventId: number): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.eventId, eventId));
  }

  async findByEmail(userEmail: string): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.userEmail, userEmail));
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
