import { Controller, Get, Param } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";

@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("events/:id")
  async getEventAnalytics(@Param("id") id: string) {
    const analytics = await this.analyticsService.getEventAnalytics(
      parseInt(id)
    );

    return {
      success: true,
      data: analytics,
    };
  }

  @Get("summary")
  async getSystemSummary() {
    const summary = await this.analyticsService.getSystemSummary();

    return {
      success: true,
      data: summary,
    };
  }
}
