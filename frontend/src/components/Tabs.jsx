import { COLORS, TYPOGRAPHY, SPACING } from "../constants/designSystem";

export default function Tabs() {
  return (
    <div>
      {/* Desktop tabs */}
      <div>
        <div style={{ borderBottom: `1px solid ${COLORS.MORNING_MIST}` }}>
          <nav aria-label="Tabs" className="flex space-x-8">
            <div
              aria-current="page"
              style={{
                paddingBottom: SPACING.M,
                fontSize: TYPOGRAPHY.SIZE_BODY,
                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                color: COLORS.MIDNIGHT_ASH,
                borderBottom: `2px solid ${COLORS.MIDNIGHT_ASH}`,
                whiteSpace: "nowrap",
              }}
            >
              Details
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
