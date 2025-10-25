import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  decimal,
  jsonb,
} from "drizzle-orm/pg-core";

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  venue: text("venue").notNull(),
  totalTickets: integer("total_tickets").notNull(),
  bookedTickets: integer("booked_tickets").notNull().default(0),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  minPrice: decimal("min_price", { precision: 10, scale: 2 }).notNull(),
  maxPrice: decimal("max_price", { precision: 10, scale: 2 }).notNull(),
  pricingRules: jsonb("pricing_rules").notNull().default({
    timeBasedWeight: 0.3,
    demandBasedWeight: 0.4,
    inventoryBasedWeight: 0.3,
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  userEmail: text("user_email").notNull(),
  quantity: integer("quantity").notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
