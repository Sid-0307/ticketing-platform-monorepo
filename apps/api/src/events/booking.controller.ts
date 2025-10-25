import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { BookingsService } from "./booking.service";

@Controller("bookings")
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async create(
    @Body()
    bookingData: {
      eventId: number;
      userEmail: string;
      quantity: number;
    }
  ) {
    const booking = await this.bookingsService.create(bookingData);

    return {
      success: true,
      data: booking,
      message: "Booking created successfully",
    };
  }

  @Get()
  async findBookings(
    @Query("eventId") eventId?: string,
    @Query("userEmail") userEmail?: string
  ) {
    let bookings;

    if (eventId) {
      bookings = await this.bookingsService.findByEventId(parseInt(eventId));
    } else if (userEmail) {
      bookings = await this.bookingsService.findByEmail(userEmail);
    } else {
      throw new BadRequestException(
        "Either eventId or userEmail query parameter is required"
      );
    }

    return {
      success: true,
      data: bookings,
      count: bookings.length,
    };
  }
}
