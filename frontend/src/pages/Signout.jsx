import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

function Signout() {
  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      {/* Top lightweight nav */}
      <div className="w-full bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-end text-sm text-gray-600 gap-4">
          <span>Hi!</span>
          <Link to="/auth/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
          <span className="text-gray-300">|</span>
          <Link to="/auth/signup" className="text-blue-600 hover:underline">
            Register
          </Link>
        </div>
      </div>

      {/* Header area with logo and search bar */}
      <header className="w-full border-b border-transparent">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center">
              <img src={logo} alt="eBid" className="h-8 w-auto mr-4" />
            </div>

            {/* Search bar */}
            <div className="w-full sm:max-w-2xl">
              <form className="flex items-center gap-2">
                <select
                  aria-label="Shop by category"
                  className="h-10 pl-3 pr-2 text-sm rounded-l-full border border-gray-200 bg-white"
                  defaultValue="all"
                >
                  <option value="all">All categories</option>
                  <option value="electronics">Electronics</option>
                  <option value="fashion">Fashion</option>
                  <option value="motors">Motors</option>
                </select>

                <input
                  aria-label="Search"
                  className="flex-1 h-10 px-4 text-sm border-t border-b border-gray-200 bg-white placeholder-gray-500"
                  placeholder="Search for anything"
                />

                <button
                  type="submit"
                  className="h-10 rounded-r-full px-5 bg-[#0064d2] text-white font-semibold text-sm hover:bg-[#0057b8]"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          <div className="bg-[#d6f8d6] rounded-xl p-8 text-center mx-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              You've signed out.
            </h2>
            <p className="mt-3 text-sm text-gray-700">
              Return to your account to enjoy buying and selling.
            </p>

            <div className="mt-6 flex justify-center">
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-3 px-5 py-2.5 bg-white border border-green-600 text-green-600 rounded-md font-medium hover:bg-gray-50"
              >
                <span>Sign in again</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-100 text-gray-600 text-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-700">About</h4>
                <a href="#" className="block hover:underline">
                  Company
                </a>
                <a href="#" className="block hover:underline">
                  Careers
                </a>
                <a href="#" className="block hover:underline">
                  Press
                </a>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-700">
                  Help & Contact
                </h4>
                <a href="#" className="block hover:underline">
                  Customer Service
                </a>
                <a href="#" className="block hover:underline">
                  Returns
                </a>
                <a href="#" className="block hover:underline">
                  Community
                </a>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-700">Buy</h4>
                <a href="#" className="block hover:underline">
                  Bidding
                </a>
                <a href="#" className="block hover:underline">
                  Buying Guides
                </a>
                <a href="#" className="block hover:underline">
                  Stores
                </a>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-700">Sell</h4>
                <a href="#" className="block hover:underline">
                  Start selling
                </a>
                <a href="#" className="block hover:underline">
                  Business sellers
                </a>
                <a href="#" className="block hover:underline">
                  Seller Centre
                </a>
              </div>
            </div>

            <div className="flex-1">
              <div className="text-xs text-gray-500 mt-2">
                © 2025 eBid Inc. All Rights Reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Signout;
