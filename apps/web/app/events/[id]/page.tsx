// apps/web/src/app/events/[id]/page.tsx

import { api } from "../../../lib/api";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PriceBreakdownCard from "../../../components/PriceBreakdownCard";
import PricingRefresher from "../../../components/PricingRefresher";
import BookingForm from "../../../components/BookingForm";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function EventDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-12 bg-gray-200 rounded mb-4 w-3/4" />
      <div className="h-6 bg-gray-200 rounded mb-10 w-1/2" />
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="h-64 bg-gray-200 rounded" />
          <div className="h-48 bg-gray-200 rounded" />
        </div>
        <div className="h-96 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

async function EventDetailContent({ id }: { id: string }) {
  let event;

  try {
    event = await api.events.getById(parseInt(id));
  } catch (error) {
    notFound();
  }

  const isSoldOut = event.availableTickets === 0;
  const isAlmostSoldOut = event.availableTickets < event.totalTickets * 0.2;

  return (
    <>
      <PricingRefresher eventId={event.id} />

      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.name}</h1>
        <div className="flex flex-wrap items-center gap-6 text-gray-600">
          <div className="flex items-center">
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
          <div className="flex items-center">
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
            </svg>
            <span>{event.venue}</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          {/* Description */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-4">
            <h2 className="text-2xl font-semibold mb-5 text-gray-900">
              About This Event
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
              {event.description}
            </p>
          </div>

          {/* Ticket Availability */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-4">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">
              Ticket Availability
            </h2>

            <div className="space-y-5">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-700 text-base">Total Tickets:</span>
                <span className="font-semibold text-gray-900 text-lg">
                  {event.totalTickets}
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-700 text-base">Tickets Sold:</span>
                <span className="font-semibold text-gray-900 text-lg">
                  {event.bookedTickets}
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-700 text-base">Available:</span>
                <span
                  className={`font-bold text-xl ${
                    isSoldOut
                      ? "text-red-600"
                      : isAlmostSoldOut
                        ? "text-orange-600"
                        : "text-green-600"
                  }`}
                >
                  {event.availableTickets}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
                <div
                  className={`h-3 rounded-full transition-all ${
                    isSoldOut
                      ? "bg-red-500"
                      : isAlmostSoldOut
                        ? "bg-orange-500"
                        : "bg-green-500"
                  }`}
                  style={{
                    width: `${(event.bookedTickets / event.totalTickets) * 100}%`,
                  }}
                />
              </div>

              {isAlmostSoldOut && !isSoldOut && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-5 mt-6">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-orange-800 text-sm font-medium">
                      Selling fast! Only a few tickets remaining.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Price Breakdown */}
          <PriceBreakdownCard event={event} />
        </div>

        {/* Sidebar - Booking Form */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-8 sticky top-24">
            <BookingForm event={event} />
          </div>
        </div>
      </div>
    </>
  );
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 lg:px-8 py-12">
        <Suspense fallback={<EventDetailSkeleton />}>
          <EventDetailContent id={id} />
        </Suspense>
      </div>
    </div>
  );
}

export const revalidate = 0;
