import React from "react";
import Header from "../components/Header";
import Tabs from "../components/Tabs";
import Sidebar from "../components/Sidebar";
import { HeartIcon } from "@heroicons/react/24/outline";

export default function Watchlist() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="lg:flex lg:space-x-6">
          {/* Sidebar on the left */}
          <div className="hidden lg:block lg:w-64">
            <Sidebar />
          </div>

          {/* Main area */}
          <div className="flex-1 min-w-0">
            {/* Tabs under the header */}
            <div className="mb-6">
              <Tabs />
            </div>

            {/* Empty watchlist centered */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-2xl">
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-white py-20 px-6 text-center shadow-sm">
                  <HeartIcon className="h-16 w-16 text-red-500 mb-6" />
                  <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                    You have no items in your Watchlist.
                  </h2>
                  <p className="text-sm text-gray-600 max-w-prose">
                    Start adding items to your Watchlist today! Simply tap
                    <span className="font-medium"> ‘Add to watchlist’ </span>
                    next to the item you want to keep a close eye on.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
