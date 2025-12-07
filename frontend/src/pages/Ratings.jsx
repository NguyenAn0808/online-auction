import React from "react";
import Header from "../components/Header";
import Tabs from "../components/Tabs";
import Sidebar from "../components/Sidebar";
import UserFeedback from "../components/UserFeedback";

const demoFeedback = [
  {
    id: 1,
    user: "Jane Cooper",
    rating: 5,
    title: "Great seller!",
    body: "Item as described — fast shipping and excellent communication. Highly recommend.",
    date: "2025-11-15",
  },
  {
    id: 2,
    user: "John Doe",
    rating: 4,
    title: "Good experience",
    body: "Product arrived quickly and in good condition. Packaging could be improved.",
    date: "2025-10-30",
  },
  {
    id: 3,
    user: "Alex Smith",
    rating: 3,
    title: "Okay",
    body: "Item worked but customer support took a while to reply.",
    date: "2025-09-21",
  },
];

export default function Ratings() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="lg:flex lg:space-x-6">
          {/* Sidebar */}
          <div className="hidden lg:block lg:w-64">
            <Sidebar />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <Tabs />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-semibold text-gray-900 mb-4">
                User Ratings & Feedback
              </h1>
              <div className="mt-6">
                <UserFeedback items={demoFeedback} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
