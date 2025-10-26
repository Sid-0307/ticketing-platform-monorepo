import { sql } from "drizzle-orm";
import { db, events } from "./index";
import "dotenv/config";
import postgres from "postgres";
import Redis from "ioredis";

const sampleEvents = [
  {
    name: "Tech Conference 2025",
    description:
      "Annual technology conference featuring the latest in AI, cloud computing, and software development.",
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    venue: "Convention Center Hall A",
    totalTickets: 500,
    bookedTickets: 150,
    basePrice: "299.00",
    minPrice: "199.00",
    maxPrice: "599.00",
    pricingRules: {
      timeBasedWeight: 0.3,
      demandBasedWeight: 0.4,
      inventoryBasedWeight: 0.3,
    },
  },
  {
    name: "Summer Music Festival",
    description:
      "Three-day outdoor music festival featuring top artists from around the world.",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    venue: "City Park Amphitheater",
    totalTickets: 1000,
    bookedTickets: 850,
    basePrice: "150.00",
    minPrice: "120.00",
    maxPrice: "400.00",
    pricingRules: {
      timeBasedWeight: 0.4,
      demandBasedWeight: 0.3,
      inventoryBasedWeight: 0.3,
    },
  },
  {
    name: "Comedy Night Special",
    description: "Stand-up comedy show featuring renowned comedians. 18+ only.",
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
    venue: "Downtown Comedy Club",
    totalTickets: 200,
    bookedTickets: 190,
    basePrice: "45.00",
    minPrice: "35.00",
    maxPrice: "120.00",
    pricingRules: {
      timeBasedWeight: 0.5,
      demandBasedWeight: 0.2,
      inventoryBasedWeight: 0.3,
    },
  },
  {
    name: "Food & Wine Expo",
    description:
      "Culinary showcase featuring celebrity chefs, wine tastings, and cooking demonstrations.",
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    venue: "Grand Hotel Ballroom",
    totalTickets: 300,
    bookedTickets: 75,
    basePrice: "89.00",
    minPrice: "69.00",
    maxPrice: "200.00",
    pricingRules: {
      timeBasedWeight: 0.3,
      demandBasedWeight: 0.3,
      inventoryBasedWeight: 0.4,
    },
  },
  {
    name: "Sports Championship Final",
    description:
      "The ultimate showdown! Championship final with premium seating options.",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    venue: "National Stadium",
    totalTickets: 800,
    bookedTickets: 600,
    basePrice: "120.00",
    minPrice: "100.00",
    maxPrice: "350.00",
    pricingRules: {
      timeBasedWeight: 0.3,
      demandBasedWeight: 0.4,
      inventoryBasedWeight: 0.3,
    },
  },
  {
    name: "Classical Orchestra Performance",
    description:
      "Evening of classical music performed by the City Symphony Orchestra.",
    date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    venue: "Metropolitan Opera House",
    totalTickets: 400,
    bookedTickets: 50,
    basePrice: "75.00",
    minPrice: "60.00",
    maxPrice: "180.00",
    pricingRules: {
      timeBasedWeight: 0.2,
      demandBasedWeight: 0.3,
      inventoryBasedWeight: 0.5,
    },
  },
];

async function seed() {
  try {
    console.log("Seeding database...");

    console.log("Clearing Redis cache...");
    const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
    await redis.flushall();
    await redis.quit();
    console.log("Redis cache cleared!");

    console.log("Clearing existing events...");
    await db.delete(events);

    console.log("Resetting sequence...");
    await db.execute(sql`ALTER SEQUENCE events_id_seq RESTART WITH 1`);
    await db.execute(sql`ALTER SEQUENCE bookings_id_seq RESTART WITH 1`);

    console.log("Inserting sample events...");
    const insertedEvents = await db
      .insert(events)
      .values(sampleEvents)
      .returning();

    console.log(`Successfully seeded ${insertedEvents.length} events!`);

    insertedEvents.forEach((event, index) => {
      console.log(`\n${index + 1}. ${event.name}`);
      console.log(`   Date: ${event.date.toLocaleDateString()}`);
      console.log(`   Tickets: ${event.bookedTickets}/${event.totalTickets}`);
      console.log(`   Price: $${event.basePrice}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
