import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  NotFoundException,
} from "@nestjs/common";
import { EventsService } from "./events.service";
import { PricingService } from "./pricing.service";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

@Controller("events")
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly pricingService: PricingService
  ) {}

  @Get()
  async findAll() {
    const events = await this.eventsService.findAll();

    const priceMap = await this.pricingService.calculatePricesForEvents(events);

    const eventsWithPricing = events.map((event) => {
      const pricing = priceMap.get(event.id);
      return {
        ...event,
        currentPrice: pricing?.finalPrice || parseFloat(event.basePrice),
        availableTickets: event.totalTickets - event.bookedTickets,
      };
    });

    return {
      success: true,
      data: eventsWithPricing,
      count: eventsWithPricing.length,
    };
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const event = await this.eventsService.findOne(parseInt(id));

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    const pricing = await this.pricingService.calculatePrice(event);

    return {
      success: true,
      data: {
        ...event,
        currentPrice: pricing.finalPrice,
        availableTickets: event.totalTickets - event.bookedTickets,
        priceBreakdown: {
          basePrice: pricing.basePrice,
          adjustments: {
            time: {
              value: pricing.timeAdjustment,
              weight: parseFloat(process.env.TIME_WEIGHT || "0.3"),
            },
            demand: {
              value: pricing.demandAdjustment,
              weight: parseFloat(process.env.DEMAND_WEIGHT || "0.4"),
            },
            inventory: {
              value: pricing.inventoryAdjustment,
              weight: parseFloat(process.env.INVENTORY_WEIGHT || "0.3"),
            },
          },
          finalPrice: pricing.finalPrice,
          appliedFloor: pricing.appliedFloor,
          appliedCeiling: pricing.appliedCeiling,
        },
      },
    };
  }

  @Post()
  async create(@Body() eventData: any) {
    const event = await this.eventsService.create(eventData);
    return {
      success: true,
      data: event,
      message: "Event created successfully",
    };
  }
}

@Controller("seed")
export class SeedController {
  @Post()
  async seed() {
    try {
      const { stdout, stderr } = await execAsync(
        "cd ../../packages/database && pnpm db:seed",
        { cwd: __dirname }
      );

      return {
        success: true,
        message: "Database seeded successfully",
        output: stdout,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to seed database",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
