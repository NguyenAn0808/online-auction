import React from "react";

const steps = [
  { id: 1, title: "Payment & Delivery" },
  { id: 2, title: "Seller Confirmation" },
  { id: 3, title: "Confirm Receipt" },
  { id: 4, title: "Ratings" },
];

export default function TransactionStepper({ current = 1 }) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center space-x-4">
        {steps.map((s) => {
          const completed = s.id < current;
          const active = s.id === current;
          return (
            <li key={s.id} className="flex items-center">
              <div
                className={`h-8 w-8 flex items-center justify-center rounded-full border ${
                  completed
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : active
                    ? "bg-white text-indigo-600 border-indigo-600"
                    : "bg-white text-gray-500 border-gray-200"
                }`}
              >
                {s.id}
              </div>
              <div className="ml-3 text-sm">
                <p
                  className={`font-medium ${
                    active ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {s.title}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
