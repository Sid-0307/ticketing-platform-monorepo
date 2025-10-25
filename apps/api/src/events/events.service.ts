import { Injectable } from "@nestjs/common";
import { db, events, Event } from "@repo/database";
import { eq } from "drizzle-orm";

@Injectable()
export class EventsService {
  async findAll(): Promise<Event[]> {
    return db.select().from(events);
  }

  async findOne(id: number): Promise<Event | null> {
    const result = await db.select().from(events).where(eq(events.id, id));
    return result[0] || null;
  }

  async create(eventData: typeof events.$inferInsert): Promise<Event> {
    const result = await db.insert(events).values(eventData).returning();
    if (!result[0]) {
      throw new Error("Failed to create event");
    }
    return result[0];
  }
}
