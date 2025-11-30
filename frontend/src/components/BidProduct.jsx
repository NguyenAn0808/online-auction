import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BiddingQuickView from "./BiddingQuickView";
import {
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

// Demo product(s)
const products = [
  {
    id: 1,
    name: "Nomad Tumbler",
    description:
      "This durable and portable insulated tumbler will keep your beverage at the perfect temperature during your next adventure.",
    href: "#",
    price: "35.00",
    imageSrc:
      "https://tailwindui.com/plus-assets/img/ecommerce-images/confirmation-page-03-product-01.jpg",
    imageAlt: "Insulated bottle with white base and black snap lid.",
    // demo auction due time: 2 days from now
    dueTime: new Date(Date.now()).toISOString(),
  },
];

// Demo bids and current user (replace with API/auth in real app)
const bids = [
  { id: 1, name: "Jane Cooper", time: "1 hour ago", amount: 200.0 },
  { id: 2, name: "John Doe", time: "2 hours ago", amount: 250.0 },
  { id: 3, name: "Alex Smith", time: "3 hours ago", amount: 180.0 },
  { id: 4, name: "Lisa Wong", time: "30 minutes ago", amount: 275.0 },
];
const CURRENT_USER_NAME = "Lisa Wong";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function BidProduct() {
  const [showQuickView, setShowQuickView] = useState(false);
  const navigate = useNavigate();

  const highest = useMemo(() => {
    return bids.slice().sort((a, b) => b.amount - a.amount)[0];
  }, []);

  return (
    <div className="bg-gray-50 py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="space-y-2 sm:flex sm:items-baseline sm:justify-between sm:space-y-0">
          <div className="flex items-baseline space-x-4">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Bidding History
            </h1>
            <a
              href="#"
              className="hidden text-sm font-medium text-indigo-600 hover:text-indigo-500 sm:block"
            >
              View product details <span aria-hidden>→</span>
            </a>
          </div>
          <div className="text-sm text-gray-600">
            Time left <time className="font-medium text-gray-900">2 days</time>
          </div>
        </div>

        <div className="mt-6 space-y-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="border-t border-b border-gray-200 bg-white shadow-sm sm:rounded-lg sm:border"
            >
              <div className="px-4 py-6 sm:px-6 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:p-8">
                <div className="sm:flex lg:col-span-7">
                  <img
                    alt={product.imageAlt}
                    src={product.imageSrc}
                    className="aspect-square w-full shrink-0 rounded-lg object-cover sm:h-40 sm:w-40"
                  />

                  <div className="mt-6 sm:mt-0 sm:ml-6">
                    <h3 className="text-base font-medium text-gray-900">
                      <a href={product.href}>{product.name}</a>
                    </h3>
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      ${product.price}
                    </p>
                    <p className="mt-3 text-sm text-gray-500">
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 lg:col-span-5 lg:mt-0">
                  <dl className="grid grid-cols-2 gap-x-6 text-sm">
                    <div>
                      <dt className="font-medium text-gray-900">
                        Delivery address
                      </dt>
                      <dd className="mt-3 text-gray-500">
                        <span className="block">Floyd Miles</span>
                        <span className="block">7363 Cynthia Pass</span>
                        <span className="block">Toronto, ON</span>
                      </dd>
                    </div>

                    <div>
                      <dt className="font-medium text-gray-900">
                        Current max bid
                      </dt>
                      <dd className="mt-3 text-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-700">
                            Current max bid:{" "}
                            <span className="font-medium text-gray-900">
                              ${highest.amount.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => setShowQuickView(true)}
                              className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              Increase max bid
                            </button>
                          </div>
                        </div>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Auction result actions - show only after auction ended */}
              {(() => {
                const now = Date.now();
                const ended = now > new Date(product.dueTime).getTime();
                if (!ended) return null;
                const highestLocal = bids
                  .slice()
                  .sort((a, b) => b.amount - a.amount)[0];
                const isWinner =
                  highestLocal && highestLocal.name === CURRENT_USER_NAME;

                return (
                  <div className="px-4 sm:px-6 lg:px-8">
                    <div className="mt-6 rounded-lg border bg-white p-4 shadow-sm">
                      <div
                        className={
                          isWinner
                            ? "text-green-700 font-semibold"
                            : "text-red-600 font-semibold"
                        }
                      >
                        {isWinner
                          ? "Congrats, you won!"
                          : "Good luck next time!"}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        {isWinner && (
                          <button
                            type="button"
                            onClick={() => navigate(`/orders/${product.id}`)}
                            aria-label="Pay now"
                            className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <CurrencyDollarIcon
                              className="h-5 w-5 mr-2"
                              aria-hidden="true"
                            />
                            Pay now
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => alert("Contact seller (placeholder)")}
                          aria-label="Contact seller"
                          className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <ChatBubbleLeftRightIcon
                            className="h-5 w-5 mr-2"
                            aria-hidden="true"
                          />
                          Contact seller
                        </button>

                        <button
                          type="button"
                          onClick={() => alert("Leave feedback (placeholder)")}
                          aria-label="Leave feedback"
                          className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <StarIcon
                            className="h-5 w-5 mr-2"
                            aria-hidden="true"
                          />
                          Leave feedback
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            alert("Sell one like this (placeholder)")
                          }
                          aria-label="Sell one like this"
                          className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <ShoppingBagIcon
                            className="h-5 w-5 mr-2"
                            aria-hidden="true"
                          />
                          Sell one like this
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="border-t border-gray-200 px-4 py-6 sm:px-6 lg:p-8">
                <h4 className="sr-only">Status</h4>
                <p className="text-sm font-medium text-gray-900">Status</p>

                <div aria-hidden="true" className="mt-6">
                  {/* Time-progress until dueTime */}
                  {(() => {
                    const now = Date.now();
                    const due = new Date(product.dueTime).getTime();
                    // assume auction started 2 days before now (demo)
                    const start = now - 2 * 24 * 60 * 60 * 1000;
                    const total = Math.max(1, due - start);
                    const elapsed = Math.max(0, Math.min(now - start, total));
                    const percent = Math.round((elapsed / total) * 100);

                    const highestLocal = bids
                      .slice()
                      .sort((a, b) => b.amount - a.amount)[0];
                    const isCurrentUserHighest =
                      highestLocal && highestLocal.name === CURRENT_USER_NAME;
                    const barColor = isCurrentUserHighest
                      ? "bg-green-600"
                      : "bg-red-600";

                    const msLeft = Math.max(0, due - now);
                    const days = Math.floor(msLeft / (24 * 60 * 60 * 1000));
                    const hours = Math.floor(
                      (msLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
                    );

                    return (
                      <>
                        <div className="overflow-hidden rounded-full bg-gray-200">
                          <div
                            style={{ width: `${percent}%` }}
                            className={`h-2 rounded-full ${barColor}`}
                          />
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                          <div>
                            {isCurrentUserHighest ? (
                              <span className="font-medium text-green-700">
                                You are the highest bidder
                              </span>
                            ) : (
                              <span className="font-medium text-red-700">
                                You are not the highest bidder
                              </span>
                            )}
                          </div>
                          <div>
                            Time left: {days > 0 ? `${days}d ` : ""}
                            {hours}h
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  <div className="mt-6 hidden grid-cols-4 text-sm font-medium text-gray-600 sm:grid">
                    <div className="text-indigo-600">Start time</div>
                    <div
                      className={classNames(
                        product.step > 0 ? "text-indigo-600" : "",
                        "text-center"
                      )}
                    ></div>
                    <div
                      className={classNames(
                        product.step > 1 ? "text-indigo-600" : "",
                        "text-center"
                      )}
                    ></div>
                    <div
                      className={classNames(
                        product.step > 2 ? "text-indigo-600" : "",
                        "text-right"
                      )}
                    >
                      End time
                    </div>
                  </div>
                </div>

                {/* controlled quick view modal for this product */}
                <BiddingQuickView
                  open={showQuickView}
                  onClose={() => setShowQuickView(false)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
