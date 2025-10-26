"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EventDetail } from "../types/index";
import { createBooking } from "../app/action";

export default function BookingForm({ event }: { event: EventDetail }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isSoldOut = event.availableTickets === 0;
  const maxQuantity = Math.min(event.availableTickets, 10);
  const totalPrice = event.currentPrice * quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await createBooking({
        eventId: event.id,
        userEmail: email,
        quantity,
      });

      if (result.success) {
        sessionStorage.setItem(
          "lastBooking",
          JSON.stringify({
            booking: result.booking,
            event: {
              name: event.name,
              date: event.date,
              venue: event.venue,
              currentPrice: event.currentPrice,
            },
          })
        );
        router.push("/bookings/success");
      } else {
        setError(result.error || "Failed to create booking");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSoldOut) {
    return (
      <div className="text-center py-10">
        <svg
          className="w-20 h-20 text-red-500 mx-auto mb-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        <h3 className="text-xl font-bold text-gray-900 mb-3">Sold Out</h3>
        <p className="text-gray-600 text-base">
          Unfortunately, all tickets for this event have been sold.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Book Tickets</h2>
        <p className="text-3xl font-bold text-green-600">
          ${event.currentPrice.toFixed(2)}
          <span className="text-sm text-gray-600 font-normal"> / ticket</span>
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-5 mb-6">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="mb-3">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
          placeholder="your@email.com"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label
          htmlFor="quantity"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Number of Tickets
        </label>
        <select
          id="quantity"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
          disabled={isSubmitting}
        >
          {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>
              {num} {num === 1 ? "ticket" : "tickets"}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-gray-50 rounded-lg p-5 space-y-3 mt-6">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Price per ticket:</span>
          <span className="font-medium text-gray-900">
            ${event.currentPrice.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm mb-3">
          <span className="text-gray-600">Quantity:</span>
          <span className="font-medium text-gray-900">{quantity}</span>
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
          <span className="font-semibold text-gray-900 text-base">Total:</span>
          <span className="font-bold text-xl text-gray-900">
            ${totalPrice.toFixed(2)}
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3.5 px-6 rounded-lg transition-colors mt-6"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </span>
        ) : (
          "Book Now"
        )}
      </button>

      <p className="text-xs text-gray-500 text-center pt-2">
        By booking, you agree to our terms and conditions. Prices may change
        based on demand.
      </p>
    </form>
  );
}
