"use client";

import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { Booking, EventWithPricing } from "../../types/index";
import Link from "next/link";

interface BookingWithEvent extends Booking {
  event?: EventWithPricing;
}

export default function MyBookingsPage() {
  const [email, setEmail] = useState("");
  const [bookings, setBookings] = useState<BookingWithEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSearched(true);

    try {
      localStorage.setItem("userEmail", email);

      const userBookings = await api.bookings.getByEmail(email);

      const allEvents = await api.events.getAll();
      const eventsMap = new Map(allEvents.map((e) => [e.id, e]));

      const bookingsWithEvents = userBookings.map((booking) => ({
        ...booking,
        event: eventsMap.get(booking.eventId),
      }));

      setBookings(bookingsWithEvents);
    } catch (err: any) {
      setError(err.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">
            View and manage your event ticket bookings
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label
                htmlFor="search-email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter your email to view bookings
              </label>
              <div className="flex gap-3">
                <input
                  type="email"
                  id="search-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-md p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded w-2/3 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : searched && bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Bookings Found
            </h3>
            <p className="text-gray-500 mb-6">No bookings found for {email}</p>
            <Link
              href="/events"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Browse Events
            </Link>
          </div>
        ) : searched && bookings.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {bookings.length}{" "}
                {bookings.length === 1 ? "Booking" : "Bookings"} Found
              </h2>
            </div>

            {bookings.map((booking) => {
              const pricePaid = parseFloat(booking.totalPrice);
              const pricePerTicket = pricePaid / booking.quantity;
              const currentPrice = booking.event?.currentPrice || 0;
              const priceDifference = currentPrice - pricePerTicket;

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow  mb-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <Link
                        href={`/events/${booking.eventId}`}
                        className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {booking.event?.name || `Event #${booking.eventId}`}
                      </Link>
                      {booking.event && (
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-2"
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
                            {formatDate(booking.event.date)}
                          </div>
                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-2"
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
                            {booking.event.venue}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500">Booking ID</span>
                      <p className="font-mono text-sm text-gray-700">
                        #{booking.id}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-gray-200">
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">
                        Tickets
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        {booking.quantity}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">
                        Price Paid
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        ${pricePerTicket.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">
                        Total Paid
                      </span>
                      <span className="text-lg font-semibold text-green-600">
                        ${pricePaid.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">
                        Current Price
                      </span>
                      <span className="text-lg font-semibold text-blue-600">
                        ${currentPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {Math.abs(priceDifference) > 0.01 && (
                    <div className="mt-4">
                      {priceDifference > 0 ? (
                        <div className="flex items-center text-sm text-red-600">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Price increased by $
                          {Math.abs(priceDifference).toFixed(2)} per ticket
                        </div>
                      ) : (
                        <div className="flex items-center text-sm text-green-600">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          You saved ${Math.abs(priceDifference).toFixed(2)} per
                          ticket!
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 text-xs text-gray-500">
                    Booked on {formatDate(booking.createdAt)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
