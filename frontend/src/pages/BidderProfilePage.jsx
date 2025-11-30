import React from "react";
import Header from "../components/Header";
import Tabs from "../components/Tabs";
import Sidebar from "../components/Sidebar";
import BidderProfile from "../components/BidderProfile";
import UserFeedback from "../components/UserFeedback";
import CompactOrderSummary from "../components/CompactOrderSummary";
import { Link } from "react-router-dom";

export const BidderProfilePage = () => {
  // Demo items for the small activity panels
  const demoBids = [
    {
      id: 1,
      name: "Nomad Tumbler",
      status: "Highest bid",
      amount: "275.00",
      endTime: "2d 4h",
    },
  ];
  const demoFeedback = [
    {
      id: 1,
      user: "Jane Cooper",
      rating: 5,
      title: "Great seller!",
      body: "Item as described.",
      date: "2025-11-15",
    },
  ];

  const userId = localStorage.getItem("userId") || "buyer-1";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="lg:flex lg:space-x-6">
          {/* Sidebar */}
          <div className="hidden lg:block lg:w-64">
            <Sidebar />
          </div>

          {/* Main area */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <Tabs />
            </div>

            <div className="space-y-8">
              <section>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Profile
                  </h2>
                  <BidderProfile />
                </div>
              </section>

              <section>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Ratings
                    </h3>
                    <UserFeedback items={demoFeedback} />
                    <div className="mt-4">
                      <Link
                        to={`/ratings/${userId}`}
                        className="text-sm text-indigo-600"
                      >
                        View all ratings
                      </Link>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Watchlist
                    </h3>
                    <p className="text-sm text-gray-600">
                      You have X items in your watchlist.
                    </p>
                    <div className="mt-4">
                      <Link
                        to={`/watchlists/${userId}`}
                        className="text-sm text-indigo-600"
                      >
                        Manage watchlist
                      </Link>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Bids & Offers
                    </h3>
                    {demoBids.map((b) => (
                      <CompactOrderSummary key={b.id} item={b} />
                    ))}
                    <div className="mt-4">
                      <Link
                        to={`/products/${userId}/bidding`}
                        className="text-sm text-indigo-600"
                      >
                        View all bids & offers
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
