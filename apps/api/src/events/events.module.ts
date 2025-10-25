import { Module } from "@nestjs/common";
import { EventsController } from "./events.controller";
import { EventsService } from "./events.service";
import { PricingService } from "./pricing.service";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";
import { BookingsController } from "./booking.controller";
import { BookingsService } from "./booking.service";

@Module({
  controllers: [EventsController, BookingsController, AnalyticsController],
  providers: [EventsService, PricingService, BookingsService, AnalyticsService],
  exports: [EventsService, PricingService, BookingsService, AnalyticsService],
})
export class EventsModule {}
