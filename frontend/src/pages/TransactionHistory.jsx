// src/pages/TransactionHistory.jsx (REVISED)

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { listTransactions } from "../services/transactionService";

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Used for login/critical errors only
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        // listTransactions handles the API call and returns an array of orders
        const data = await listTransactions();

        // If the API call succeeds (200 OK) but returns an empty array,
        // that means no history exists. This is NOT an error state.
        setTransactions(data);
        setError(null); // Clear any previous error
      } catch (err) {
        console.error("Failed to fetch transaction history:", err);

        // Check for common authentication errors (401 Unauthorized, 403 Forbidden)
        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          // This is the specific error when the user is not logged in.
          setError("You must be logged in to view your transaction history.");
        } else {
          // General network or server error
          setError("A general error occurred while loading history.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []); // Run once on component mount

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-700">
        <h1 className="text-xl font-semibold">Loading Transactions...</h1>
        <p className="mt-2">Fetching your order history.</p>
      </div>
    );
  }

  // RENDER AUTHENTICATION ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto p-8 text-center bg-white rounded-lg shadow-md mt-10">
          <h1 className="text-3xl font-bold mb-4 text-red-600">
            Access Denied
          </h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => navigate("/auth/signin")} // Redirect to your login page
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Helper function to format status text (already defined, included here for completeness)
  const formatStatus = (status) => {
    if (!status) return "Unknown";
    return status
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // RENDER SUCCESS STATE (History exists OR History is empty)
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">
          Your Transaction History ({transactions.length})
        </h1>

        {/* Check if the array is empty - THIS IS THE "NO ORDERS YET" MESSAGE */}
        {transactions.length === 0 ? (
          <div className="bg-white p-8 border border-dashed border-gray-300 rounded-lg text-center text-gray-500 mt-6">
            <p className="text-lg font-semibold">
              No Transaction History Found
            </p>
            <p className="text-md mt-2">
              Looks like you haven't participated in any completed auctions or
              started any orders yet.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              Go to Homepage
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => navigate(`/transactions/${tx.id}`)}
                className="bg-white p-5 border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-150"
              >
                {/* ... (Your transaction item rendering logic) ... */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    {/* ... (Product Image/Details) ... */}
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        {tx.productName ||
                          `Transaction ID: ${tx.id.slice(0, 8)}`}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Order Placed:{" "}
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-700">
                      ${tx.current_price?.toFixed(2) || "N/A"}
                    </p>
                    <p
                      className={`text-sm font-medium mt-1 ${
                        tx.status === "completed"
                          ? "text-green-600"
                          : tx.status === "cancelled"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {formatStatus(tx.status)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
