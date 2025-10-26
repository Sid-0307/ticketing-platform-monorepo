// apps/web/src/app/events/page.tsx

import { api } from "../../lib/api";
import { EventWithPricing } from "../../types/index";
import Link from "next/link";
import { Suspense } from "react";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

function EventCard({ event }: { event: EventWithPricing }) {
  const soldPercentage = (event.bookedTickets / event.totalTickets) * 100;
  const isAlmostSoldOut = event.availableTickets < event.totalTickets * 0.2;
  const isSoldOut = event.availableTickets === 0;

  return (
    <Link
      href={`/events/${event.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200 no-underline"
    >
      <div className="flex justify-between items-start mb-4 overflow-hidden">
        <h2 className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors truncate">
          {event.name}
        </h2>
        <span className="text-2xl font-bold text-green-600 ml-4 flex-shrink-0">
          {formatPrice(event.currentPrice)}
        </span>
      </div>

      <p className="text-gray-600 mb-6 line-clamp-2">{event.description}</p>

      <div className="space-y-3 text-sm">
        <div className="flex items-center text-gray-700">
          <svg
            className="w-5 h-5 mr-3 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{formatDate(event.date)}</span>
        </div>

        <div className="flex items-center text-gray-700 pb-3">
          <svg
            className="w-5 h-5 mr-3 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>{event.venue}</span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-3 text-gray-700 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
            <span
              className={`font-semibold ${
                isSoldOut
                  ? "text-red-600"
                  : isAlmostSoldOut
                    ? "text-orange-600"
                    : "text-gray-700"
              }`}
            >
              {isSoldOut
                ? "SOLD OUT"
                : `${event.availableTickets} tickets left`}
            </span>
          </div>

          {!isSoldOut && isAlmostSoldOut && (
            <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
              Almost Sold Out!
            </span>
          )}
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
          <div
            className={`h-2.5 rounded-full transition-all ${
              soldPercentage >= 90
                ? "bg-red-500"
                : soldPercentage >= 70
                  ? "bg-orange-500"
                  : "bg-green-500"
            }`}
            style={{ width: `${soldPercentage}%` }}
          />
        </div>
      </div>
    </Link>
  );
}

function EventsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-white rounded-lg shadow-md p-6 border border-gray-200 animate-pulse"
        >
          <div className="h-8 bg-gray-200 rounded mb-4" />
          <div className="h-4 bg-gray-200 rounded mb-2" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-6" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function EventsList() {
  const events = await api.events.getAll();

  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <svg
          className="w-20 h-20 text-gray-400 mx-auto mb-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <h3 className="text-2xl font-semibold text-gray-700 mb-3">
          No events available
        </h3>
        <p className="text-gray-500 text-lg">
          Check back later for upcoming events!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Upcoming Events
          </h1>
          <p className="text-gray-600 text-lg">
            Discover amazing events with dynamic pricing
          </p>
        </div>

        <Suspense fallback={<EventsLoadingSkeleton />}>
          <EventsList />
        </Suspense>
      </div>
    </div>
  );
}

export const revalidate = 0;
