import React from "react";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
} from "../constants/designSystem";

const steps = [
  { id: 1, title: "Payment & Delivery" },
  { id: 2, title: "Seller Confirmation" },
  { id: 3, title: "Confirm Receipt" },
  { id: 4, title: "Ratings" },
];

export default function TransactionStepper({ current = 1 }) {
  return (
    <nav aria-label="Progress">
      <ol
        style={{
          display: "flex",
          alignItems: "center",
          gap: SPACING.L,
          listStyle: "none",
          margin: 0,
          padding: 0,
        }}
      >
        {steps.map((s, index) => {
          const completed = s.id < current;
          const active = s.id === current;
          return (
            <li
              key={s.id}
              style={{
                display: "flex",
                alignItems: "center",
                flex: 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: SPACING.M,
                }}
              >
                <div
                  style={{
                    height: "32px",
                    width: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: BORDER_RADIUS.FULL,
                    border: `2px solid ${
                      completed || active
                        ? COLORS.MIDNIGHT_ASH
                        : COLORS.MORNING_MIST
                    }`,
                    backgroundColor: completed
                      ? COLORS.MIDNIGHT_ASH
                      : COLORS.WHITE,
                    color: completed
                      ? COLORS.WHITE
                      : active
                      ? COLORS.MIDNIGHT_ASH
                      : COLORS.PEBBLE,
                    fontSize: TYPOGRAPHY.SIZE_LABEL,
                    fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                    transition: "all 0.3s ease",
                  }}
                >
                  {completed ? "✓" : s.id}
                </div>
                <div>
                  <p
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_LABEL,
                      fontWeight:
                        active || completed
                          ? TYPOGRAPHY.WEIGHT_SEMIBOLD
                          : TYPOGRAPHY.WEIGHT_MEDIUM,
                      color:
                        active || completed
                          ? COLORS.MIDNIGHT_ASH
                          : COLORS.PEBBLE,
                      margin: 0,
                    }}
                  >
                    {s.title}
                  </p>
                </div>
              </div>
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: "2px",
                    backgroundColor: completed
                      ? COLORS.MIDNIGHT_ASH
                      : COLORS.MORNING_MIST,
                    marginLeft: SPACING.M,
                    transition: "background-color 0.3s ease",
                  }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
