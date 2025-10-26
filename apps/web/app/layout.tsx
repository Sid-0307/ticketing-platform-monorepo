// apps/web/src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EventHub - Dynamic Event Ticketing",
  description:
    "Book tickets for amazing events with intelligent dynamic pricing",
};

function Navigation() {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 no-underline">
            <svg
              className="w-8 h-8 text-blue-600"
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
            <span className="text-xl font-bold text-gray-900">EventHub</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              href="/events"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors no-underline"
            >
              Events
            </Link>
            <Link
              href="/my-bookings"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors no-underline"
            >
              My Bookings
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">EventHub</h3>
            <p className="text-gray-400 text-sm">
              Dynamic pricing for event tickets. Get the best deals on amazing
              events.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/events"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Browse Events
                </Link>
              </li>
              <li>
                <Link
                  href="/my-bookings"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <p className="text-gray-400 text-sm">
              Built with Next.js 15, NestJS, PostgreSQL, and intelligent pricing
              algorithms.
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} EventHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Navigation />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
