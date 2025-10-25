import { Injectable } from "@nestjs/common";
import { db, events, Event } from "@repo/database";
import { eq } from "drizzle-orm";
import { RedisService } from "../redis/redis.service";

@Injectable()
export class EventsService {
  constructor(private readonly redisService: RedisService) {}

  async findAll(): Promise<Event[]> {
    return this.redisService.getOrSet(
      "events:all",
      async () => db.select().from(events),
      30
    );
  }

  async findOne(id: number): Promise<Event | null> {
    return this.redisService.getOrSet(
      `event:${id}`,
      async () => {
        const result = await db.select().from(events).where(eq(events.id, id));
        return result[0] || null;
      },
      30
    );
  }

  async create(eventData: typeof events.$inferInsert): Promise<Event> {
    const result = await db.insert(events).values(eventData).returning();
    if (!result[0]) {
      throw new Error("Failed to create event");
    }

    await this.redisService.delPattern("events:*");
    await this.redisService.delPattern("event:*");

    return result[0];
  }

  async lockEventForUpdate(
    eventId: number,
    tx: any = db
  ): Promise<Event | null> {
    const [event] = await tx
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .for("update");

    await this.redisService.del(`event:${eventId}`);

    return event || null;
  }
}
