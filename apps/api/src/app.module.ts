import { Module } from "@nestjs/common";
import { EventsModule } from "./events/events.module";
import { SeedController } from "./events/events.controller";

@Module({
  imports: [EventsModule],
  controllers: [SeedController],
  providers: [],
})
export class AppModule {}
