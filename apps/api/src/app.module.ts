import { Module } from "@nestjs/common";
import { EventsModule } from "./events/events.module";
import { SeedController } from "./events/events.controller";
import { RedisModule } from "./redis/redis.module";

@Module({
  imports: [RedisModule, EventsModule],
  controllers: [SeedController],
  providers: [],
})
export class AppModule {}
