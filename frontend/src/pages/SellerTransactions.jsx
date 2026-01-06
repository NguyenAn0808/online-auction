import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { listTransactions, STATUS } from "../services/transactionService";

export default function SellerTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    async function load() {
      try {
        // Fetch real orders from API
        const data = await listTransactions("seller");

        // Optional: Filter for only "Waiting" items if this page is just for pending tasks
        // Or keep all and let the UI sort them.
        const pending = data.filter(
          (t) => t.status === STATUS.WAITING_SELLER_CONFIRMATION
        );
        setTransactions(pending);
      } catch (err) {
        console.error("Failed to load seller transactions", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-whisper">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          <aside className="col-span-12 lg:col-span-3">
            <Sidebar />
          </aside>

          <main className="col-span-12 lg:col-span-9">
            <h2 className="text-lg font-semibold mb-4">
              Orders waiting for your confirmation
            </h2>
            <div className="space-y-4">
              {transactions.length === 0 && (
                <div className="text-sm text-gray-500">
                  No pending orders. Great job!
                </div>
              )}
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="bg-white p-4 rounded-md border border-soft-cloud"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium">
                        Transaction #{t.id}
                      </div>
                      <div className="text-xs text-gray-500">
                        Buyer: {t.buyerId}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelected(t);
                        }}
                        className="text-sm text-midnight-ash hover:text-pebble"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => handleReject(t.id)}
                        className="text-sm text-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selected && (
              <div className="mt-6 bg-white p-4 rounded-md border">
                <h3 className="text-sm font-semibold">
                  Transaction #{selected.id}
                </h3>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(selected.paymentInvoice, null, 2)}
                </pre>
                <div className="mt-4 h-8 flex items-center w-full gap-2">
                  <button
                    onClick={() =>
                      handleConfirm(selected.id, {
                        carrier: "UPS",
                        tracking: "TRK123",
                      })
                    }
                    className="mr-2 btn-primary px-3 py-2 rounded-md"
                  >
                    Confirm & send shipping
                  </button>
                  <button
                    onClick={() => handleReject(selected.id)}
                    className="px-3 py-2 border rounded-md  btn-secondary"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
