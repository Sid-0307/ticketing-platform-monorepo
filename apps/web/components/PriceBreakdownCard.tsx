"use client";

import { useState } from "react";
import { EventDetail } from "../types/index";

export default function PriceBreakdownCard({ event }: { event: EventDetail }) {
  const [isOpen, setIsOpen] = useState(false);
  const { priceBreakdown } = event;

  const formatPercentage = (value: number) => {
    const percent = value * 100;
    return percent > 0 ? `+${percent.toFixed(1)}%` : `${percent.toFixed(1)}%`;
  };

  const getAdjustmentColor = (value: number) => {
    if (value === 0) return "text-gray-600";
    if (value > 0.3) return "text-red-600";
    if (value > 0.15) return "text-orange-600";
    return "text-yellow-600";
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 px-8 flex justify-between items-center text-left focus:outline-none bg-white outline-none"
      >
        <h2 className="text-2xl text-gray-900">Price Breakdown</h2>
        <div className="flex items-center gap-6">
          {!isOpen && (
            <span className="text-2xl font-bold text-green-600">
              ${priceBreakdown.finalPrice.toFixed(2)}
            </span>
          )}
          <svg
            className={`w-6 h-6 text-gray-900 transition-transform duration-300 flex-shrink-0 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Collapsible Content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="px-8 pb-8 space-y-6 border-t border-gray-200">
          {/* Base Price */}
          <div className="flex justify-between items-center pt-6 pb-4 border-b-2 border-gray-200">
            <span className="text-gray-700 font-medium text-base">
              Base Price:
            </span>
            <span className="text-xl font-semibold text-gray-900">
              ${priceBreakdown.basePrice.toFixed(2)}
            </span>
          </div>

          {/* Adjustments */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide my-3">
              Dynamic Adjustments
            </h3>

            {/* Time-Based */}
            <div className="bg-gray-50 rounded-lg p-4 mb-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-medium text-gray-700 text-base">
                    Time-Based
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Based on days until event
                  </p>
                </div>
                <span
                  className={`font-semibold text-base ${getAdjustmentColor(
                    priceBreakdown.adjustments.time.value
                  )}`}
                >
                  {formatPercentage(priceBreakdown.adjustments.time.value)}
                </span>
              </div>
              <div className="flex items-center text-xs text-gray-600 mt-2">
                <span>
                  Weight:{" "}
                  {(priceBreakdown.adjustments.time.weight * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Demand-Based */}
            <div className="bg-gray-50 rounded-lg p-4 mb-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-medium text-gray-700 text-base">
                    Demand-Based
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Based on recent bookings
                  </p>
                </div>
                <span
                  className={`font-semibold text-base ${getAdjustmentColor(
                    priceBreakdown.adjustments.demand.value
                  )}`}
                >
                  {formatPercentage(priceBreakdown.adjustments.demand.value)}
                </span>
              </div>
              <div className="flex items-center text-xs text-gray-600 mt-2">
                <span>
                  Weight:{" "}
                  {(priceBreakdown.adjustments.demand.weight * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Inventory-Based */}
            <div className="bg-gray-50 rounded-lg p-4 mb-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-medium text-gray-700 text-base">
                    Inventory-Based
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Based on remaining tickets
                  </p>
                </div>
                <span
                  className={`font-semibold text-base ${getAdjustmentColor(
                    priceBreakdown.adjustments.inventory.value
                  )}`}
                >
                  {formatPercentage(priceBreakdown.adjustments.inventory.value)}
                </span>
              </div>
              <div className="flex items-center text-xs text-gray-600 mt-2">
                <span>
                  Weight:{" "}
                  {(priceBreakdown.adjustments.inventory.weight * 100).toFixed(
                    0
                  )}
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Final Price */}
          <div className="flex justify-between items-center pt-4 border-t-2 border-gray-300">
            <span className="text-lg font-bold text-gray-900">
              Current Price:
            </span>
            <span className="text-2xl font-bold text-green-600">
              ${priceBreakdown.finalPrice.toFixed(2)}
            </span>
          </div>

          {/* Floor/Ceiling Indicators */}
          {(priceBreakdown.appliedFloor || priceBreakdown.appliedCeiling) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0"
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
                  <p className="text-blue-900 text-sm font-medium">
                    {priceBreakdown.appliedFloor
                      ? "Minimum price applied"
                      : "Maximum price applied"}
                  </p>
                  <p className="text-blue-700 text-xs mt-1.5">
                    {priceBreakdown.appliedFloor
                      ? `Price capped at floor: $${parseFloat(event.minPrice).toFixed(2)}`
                      : `Price capped at ceiling: $${parseFloat(event.maxPrice).toFixed(2)}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Price Range Info */}
          <div className="text-xs text-gray-500 text-center pt-3">
            Price range: ${parseFloat(event.minPrice).toFixed(2)} - $
            {parseFloat(event.maxPrice).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
