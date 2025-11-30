import React from "react";
import Header from "../components/Header";
import Tabs from "../components/Tabs";
import Sidebar from "../components/Sidebar";
import CompactOrderSummary from "../components/CompactOrderSummary";

const demoBids = [
  {
    id: 1,
    name: "Nomad Tumbler",
    status: "Highest bid",
    amount: "275.00",
    endTime: "2d 4h",
  },
  {
    id: 2,
    name: "Vintage Chair",
    status: "Outbid",
    amount: "120.00",
    endTime: "5h 12m",
  },
];

const demoOffers = [
  {
    id: 11,
    name: "Museum Print",
    status: "Offer pending",
    amount: "45.00",
    endTime: "3d",
  },
];

const demoLost = [
  { id: 21, name: "Retro Lamp", status: "Lost", amount: "30.00" },
];

export default function BidsOffers() {
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
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Bidding (Ongoing)
                </h2>
                <div className="space-y-3">
                  {demoBids.length === 0 ? (
                    <div className="rounded-md border border-dashed border-gray-200 bg-white p-6 text-center text-gray-500">
                      No active bids
                    </div>
                  ) : (
                    demoBids.map((b) => (
                      <CompactOrderSummary key={b.id} item={b} />
                    ))
                  )}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Offers
                </h2>
                <div className="space-y-3">
                  {demoOffers.length === 0 ? (
                    <div className="rounded-md border border-dashed border-gray-200 bg-white p-6 text-center text-gray-500">
                      No offers
                    </div>
                  ) : (
                    demoOffers.map((o) => (
                      <CompactOrderSummary key={o.id} item={o} />
                    ))
                  )}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Didn't Win
                </h2>
                <div className="space-y-3">
                  {demoLost.length === 0 ? (
                    <div className="rounded-md border border-dashed border-gray-200 bg-white p-6 text-center text-gray-500">
                      No lost items
                    </div>
                  ) : (
                    demoLost.map((l) => (
                      <CompactOrderSummary key={l.id} item={l} />
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
