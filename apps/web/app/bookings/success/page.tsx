"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Booking } from "../../../types/index";

interface BookingData {
  booking: Booking;
  event: {
    name: string;
    date: string;
    venue: string;
    currentPrice: number;
  };
}

export default function BookingSuccessPage() {
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("lastBooking");
    if (data) {
      setBookingData(JSON.parse(data));
      sessionStorage.removeItem("lastBooking");
    }
  }, []);

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-6">No booking information found.</p>
          <Link
            href="/events"
            className="text-blue-600 hover:text-blue-700 font-medium no-underline"
          >
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  const { booking, event } = bookingData;
  const pricePaid = parseFloat(booking.totalPrice);
  const pricePerTicket = pricePaid / booking.quantity;
  const priceDifference = event.currentPrice - pricePerTicket;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600">
            Your tickets have been successfully booked.
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Booking Details
          </h2>

          <div className="space-y-6">
            <div className="mb-3">
              <span className="text-sm text-gray-600 block">Event</span>
              <span className="text-lg font-semibold text-gray-900">
                {event.name}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-3">
              <div>
                <span className="text-sm text-gray-600 block">Booking ID</span>
                <span className="font-mono text-gray-900">#{booking.id}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600 block">Email</span>
                <span className="text-gray-900">{booking.userEmail}</span>
              </div>
            </div>

            <div className="mb-3">
              <span className="text-sm text-gray-600 block mb-2">
                Event Date & Time
              </span>
              <div className="flex items-center text-gray-900">
                <svg
                  className="w-5 h-5 mr-2 flex-shrink-0"
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
                {formatDate(event.date)}
              </div>
            </div>

            <div>
              <span className="text-sm text-gray-600 block mb-2">Venue</span>
              <div className="flex items-center text-gray-900">
                <svg
                  className="w-5 h-5 mr-2 flex-shrink-0"
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
                {event.venue}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Payment Summary
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between text-gray-700 mb-2">
              <span>Number of Tickets:</span>
              <span className="font-semibold">{booking.quantity}</span>
            </div>

            <div className="flex justify-between text-gray-700 mb-4">
              <span>Price per Ticket:</span>
              <span className="font-semibold">
                ${pricePerTicket.toFixed(2)}
              </span>
            </div>

            <div className="border-t border-gray-200 pt-4 flex justify-between">
              <span className="text-lg font-bold text-gray-900">
                Total Paid:
              </span>
              <span className="text-2xl font-bold text-green-600">
                ${pricePaid.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Price Comparison */}
          {Math.abs(priceDifference) > 0.01 && (
            <div
              className={`mt-6 p-4 rounded-lg ${
                priceDifference > 0
                  ? "bg-green-50 border border-green-200"
                  : "bg-orange-50 border border-orange-200"
              }`}
            >
              <div className="flex items-start">
                <svg
                  className={`w-5 h-5 mr-2 mt-0.5 flex-shrink-0 ${
                    priceDifference > 0 ? "text-green-600" : "text-orange-600"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      priceDifference > 0 ? "text-green-900" : "text-orange-900"
                    }`}
                  >
                    {priceDifference > 0
                      ? "Great timing! You saved money."
                      : "Prices have decreased since your purchase."}
                  </p>
                  <p
                    className={`text-xs mt-2 ${
                      priceDifference > 0 ? "text-green-700" : "text-orange-700"
                    }`}
                  >
                    Current price: ${event.currentPrice.toFixed(2)} per ticket
                    {priceDifference > 0
                      ? ` (You saved $${Math.abs(priceDifference).toFixed(2)} per ticket)`
                      : ""}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link
            href="/my-bookings"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors no-underline"
          >
            View My Bookings
          </Link>
          <Link
            href="/events"
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg text-center transition-colors no-underline"
          >
            Browse More Events
          </Link>
        </div>

        {/* Confirmation Note */}
        <div className="text-center text-sm text-gray-500">
          <p>A confirmation has been recorded for {booking.userEmail}</p>
          <p className="mt-2">Please save your booking ID for reference.</p>
        </div>
      </div>
    </div>
  );
}
