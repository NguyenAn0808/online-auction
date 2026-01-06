import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

const steps = [
  { id: 1, title: "Payment & Delivery" },
  { id: 2, title: "Seller Confirmation" },
  { id: 3, title: "Confirm Receipt" },
  { id: 4, title: "Ratings" },
];

/**
 * TransactionStepper - Visual progress indicator with step navigation
 * @param {number} current - The actual progress step (based on order status)
 * @param {number} viewStep - The step currently being viewed (for navigation)
 * @param {function} onStepClick - Callback when a step is clicked (receives step id)
 */
export default function TransactionStepper({
  current = 1,
  viewStep,
  onStepClick,
}) {
  // If viewStep is not provided, default to current
  const activeView = viewStep ?? current;

  return (
    <div className="flex flex-col gap-4">
      {/* Stepper Nav */}
      <nav aria-label="Progress">
        <ol className="flex items-center gap-6 list-none m-0 p-0">
          {steps.map((s, index) => {
            const completed = s.id < current;
            const isCurrentStep = s.id === current;
            const isViewing = s.id === activeView;
            // Allow clicking on completed steps or current step
            const isClickable = s.id <= current && onStepClick;

            return (
              <li key={s.id} className="flex items-center flex-1">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(s.id)}
                  disabled={!isClickable}
                  className={`flex items-center gap-3 bg-transparent border-none p-0 ${
                    isClickable
                      ? "cursor-pointer hover:opacity-80"
                      : "cursor-default"
                  }`}
                  title={
                    isClickable
                      ? `View Step ${s.id}: ${s.title}`
                      : `Step ${s.id}: ${s.title}`
                  }
                >
                  {/* Step Circle */}
                  <div
                    className={`h-8 w-8 flex items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${
                      completed
                        ? "bg-midnight-ash text-white border-2 border-midnight-ash"
                        : isCurrentStep
                        ? "bg-white text-midnight-ash border-2 border-midnight-ash"
                        : "bg-white text-pebble border-2 border-morning-mist"
                    } ${
                      isViewing && !completed
                        ? "ring-2 ring-blue-400 ring-offset-2"
                        : ""
                    } ${
                      isViewing && completed
                        ? "ring-2 ring-green-400 ring-offset-2"
                        : ""
                    }`}
                  >
                    {completed ? "✓" : s.id}
                  </div>

                  {/* Step Title */}
                  <div>
                    <p
                      className={`text-xs m-0 transition-colors ${
                        isCurrentStep || completed
                          ? "font-semibold text-midnight-ash"
                          : "font-medium text-pebble"
                      } ${
                        isViewing
                          ? "underline decoration-2 underline-offset-2"
                          : ""
                      }`}
                    >
                      {s.title}
                    </p>
                    {/* Viewing indicator */}
                    {isViewing && s.id !== current && (
                      <span className="text-[10px] text-midnight-ash font-medium">
                        Viewing
                      </span>
                    )}
                  </div>
                </button>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 ml-3 transition-colors duration-300 ${
                      completed ? "bg-midnight-ash" : "bg-morning-mist"
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Navigation Controls */}
      {onStepClick && current > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => onStepClick(Math.max(1, activeView - 1))}
            disabled={activeView <= 1}
            className={`flex items-center gap-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-all ${
              activeView <= 1
                ? "text-gray-300 cursor-not-allowed"
                : "text-midnight-ash hover:bg-soft-cloud cursor-pointer"
            }`}
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Previous
          </button>

          <span className="text-xs text-pebble">
            Viewing Step {activeView} of {Math.min(current, 4)}
          </span>

          <button
            type="button"
            onClick={() => onStepClick(Math.min(current, activeView + 1))}
            disabled={activeView >= current || activeView >= 4}
            className={`flex items-center gap-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-all ${
              activeView >= current || activeView >= 4
                ? "text-gray-300 cursor-not-allowed"
                : "text-midnight-ash hover:bg-soft-cloud cursor-pointer"
            }`}
          >
            Next
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
