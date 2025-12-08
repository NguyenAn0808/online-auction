import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { COLORS, TYPOGRAPHY, SPACING } from "../constants/designSystem";

export default function Tabs() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isMessages = pathname.startsWith("/conversations");
  const userId = localStorage.getItem("userId") || "buyer-1";

  function goDetails() {
    navigate(`/summary/${userId}`);
  }

  function goMessages() {
    navigate(`/conversations`);
  }

  return (
    <div>
      {/* Mobile dropdown */}
      <div className="grid grid-cols-1 sm:hidden">
        <select
          value={isMessages ? "Messages" : "Details"}
          aria-label="Select a tab"
          style={{
            backgroundColor: COLORS.WHITE,
            color: COLORS.MIDNIGHT_ASH,
            border: `1px solid ${COLORS.MORNING_MIST}`,
            borderRadius: "6px",
            fontSize: TYPOGRAPHY.SIZE_BODY,
            padding: `${SPACING.S} ${SPACING.M}`,
            paddingRight: "32px",
          }}
          className="col-start-1 row-start-1 w-full appearance-none focus:outline-none focus:ring-2 focus:ring-midnight-ash"
          onChange={(e) =>
            e.target.value === "Messages" ? goMessages() : goDetails()
          }
        >
          <option>Details</option>
          <option>Messages</option>
        </select>
        <ChevronDownIcon
          aria-hidden="true"
          className="pointer-events-none col-start-1 row-start-1 mr-2 h-5 w-5 self-center justify-self-end"
          style={{ color: COLORS.PEBBLE }}
        />
      </div>

      {/* Desktop tabs */}
      <div className="hidden sm:block">
        <div style={{ borderBottom: `1px solid ${COLORS.MORNING_MIST}` }}>
          <nav aria-label="Tabs" className="flex space-x-8">
            <button
              onClick={goDetails}
              aria-current={!isMessages ? "page" : undefined}
              style={{
                paddingBottom: SPACING.M,
                fontSize: TYPOGRAPHY.SIZE_BODY,
                fontWeight: !isMessages
                  ? TYPOGRAPHY.WEIGHT_SEMIBOLD
                  : TYPOGRAPHY.WEIGHT_MEDIUM,
                color: !isMessages ? COLORS.MIDNIGHT_ASH : COLORS.PEBBLE,
                backgroundColor: "transparent",
                border: "none",
                borderBottom: !isMessages
                  ? `2px solid ${COLORS.MIDNIGHT_ASH}`
                  : "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
              className="hover:text-midnight-ash"
            >
              Details
            </button>

            <button
              onClick={goMessages}
              aria-current={isMessages ? "page" : undefined}
              style={{
                paddingBottom: SPACING.M,
                fontSize: TYPOGRAPHY.SIZE_BODY,
                fontWeight: isMessages
                  ? TYPOGRAPHY.WEIGHT_SEMIBOLD
                  : TYPOGRAPHY.WEIGHT_MEDIUM,
                color: isMessages ? COLORS.MIDNIGHT_ASH : COLORS.PEBBLE,
                backgroundColor: "transparent",
                border: "none",
                borderBottom: isMessages
                  ? `2px solid ${COLORS.MIDNIGHT_ASH}`
                  : "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
              className="hover:text-midnight-ash"
            >
              Messages
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
