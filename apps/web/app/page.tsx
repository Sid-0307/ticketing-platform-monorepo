import Link from "next/link";
import { api } from "../lib/api";

async function FeaturedEvents() {
  try {
    const events = await api.events.getAll();
    const featured = events.slice(0, 3);

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {featured.map((event) => (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow no-underline"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {event.name}
            </h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {event.description}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-green-600">
                ${event.currentPrice.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500">
                {event.availableTickets} left
              </span>
            </div>
          </Link>
        ))}
      </div>
    );
  } catch (error) {
    return <div className="text-gray-600">Unable to load featured events</div>;
  }
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-5xl font-bold text-gray-900 mb-6">
          Experience Events Like Never Before
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Book tickets with intelligent dynamic pricing. Get the best deals on
          concerts, festivals, sports, and more.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/events"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors no-underline"
          >
            Browse Events
          </Link>
          <Link
            href="/my-bookings"
            className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-8 rounded-lg text-lg border-2 border-gray-300 transition-colors no-underline"
          >
            My Bookings
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Choose EventHub?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
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
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Dynamic Pricing
            </h3>
            <p className="text-gray-600">
              Prices adjust based on demand, time, and availability. Book early
              to save!
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Instant Booking
            </h3>
            <p className="text-gray-600">
              Secure your tickets instantly with our fast booking system.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-purple-600"
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
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Wide Selection
            </h3>
            <p className="text-gray-600">
              From concerts to sports events, find tickets for all your favorite
              activities.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="container mx-auto px-4 py-16 bg-gray-50">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Featured Events
        </h2>
        <FeaturedEvents />
        <div className="text-center mt-8">
          <Link
            href="/events"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            View All Events →
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How It Works
        </h2>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start mb-8">
            <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4 flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Browse Events
              </h3>
              <p className="text-gray-600">
                Explore our selection of upcoming events and find something that
                interests you.
              </p>
            </div>
          </div>

          <div className="flex items-start mb-8">
            <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4 flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Check Pricing
              </h3>
              <p className="text-gray-600">
                View real-time pricing with detailed breakdowns showing how
                prices are calculated.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4 flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Book Instantly
              </h3>
              <p className="text-gray-600">
                Enter your email, select quantity, and secure your tickets in
                seconds!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export const revalidate = 0;
