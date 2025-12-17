import { ChevronDownIcon } from "@heroicons/react/20/solid";
import {
  BookmarkSquareIcon,
  CalendarDaysIcon,
  LifebuoyIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/designSystem";
import { useAuth } from "../context/AuthContext"; // 1. Import Hook
import { useNavigate, Link } from "react-router-dom";
export default function FlyoutMenu({ alignRight = false }) {
  const { user, signout } = useAuth(); // 2. Get the signout function
  const navigate = useNavigate();
  const handleLogout = async () => {
    // 3. Call the context function (not the API directly)
    await signout();

    // 4. Redirect to home or login page
    navigate("/auth/signin");
  };
  const userId = user?.id;
  const resources = [
    {
      name: "Summary",
      description: "Go to your profile summary",
      href: userId ? `/summary/${userId}` : "/auth/signin",
      icon: LifebuoyIcon,
    },
    {
      name: "Ratings",
      description: "Performance reviews and ratings",
      href: userId ? `/ratings/${userId}` : "/auth/signin",
      icon: BookmarkSquareIcon,
    },
    {
      name: "Watchlist",
      description: "See your watchlist and other saved items",
      href: userId ? `/watchlists/${userId}` : "/auth/signin",
      icon: CalendarDaysIcon,
    },
    {
      name: "Bids & Offers",
      description: "Track your bids and offers",
      href: userId ? `/products/${userId}/bidding` : "/auth/signin",
      icon: CalendarDaysIcon,
    },
  ];
  // Temporary placeholder recent transactions (top 3)
  const recentTransactions = [
    {
      id: "tx_1",
      title: "Won: Waxed Canvas Backpack",
      date: "Nov 15",
      datetime: "2025-11-15",
    },
    {
      id: "tx_2",
      title: "Purchased: Zip Tote Basket",
      date: "Oct 30",
      datetime: "2025-10-30",
    },
    {
      id: "tx_3",
      title: "Refunded: Classic Leather Satchel",
      date: "Sep 8",
      datetime: "2025-09-08",
    },
  ];
  // alignRight: when true, position the panel to the right of its container (for profile button)
  const containerStyle = alignRight
    ? {
        position: "absolute",
        right: 0,
        zIndex: 10,
        marginTop: SPACING.S,
        paddingLeft: SPACING.S,
        paddingRight: SPACING.S,
      }
    : {
        position: "absolute",
        left: "50%",
        zIndex: 10,
        marginTop: SPACING.L,
        display: "flex",
        width: "100vw",
        maxWidth: "100%",
        transform: "translateX(-50%)",
        paddingLeft: SPACING.M,
        paddingRight: SPACING.M,
      };

  return (
    // Panel only. The header will control when this is rendered.
    <div style={containerStyle}>
      <div
        style={{
          width: "100%",
          maxWidth: "448px",
          overflow: "hidden",
          borderRadius: "24px",
          backgroundColor: COLORS.WHITE,
          fontSize: TYPOGRAPHY.SIZE_BODY,
          lineHeight: TYPOGRAPHY.LINE_HEIGHT_NORMAL,
          boxShadow: SHADOWS.SUBTLE,
          border: `1px solid ${COLORS.MORNING_MIST}20`,
        }}
      >
        <div style={{ padding: SPACING.M }}>
          {resources.map((item) => (
            <div
              key={item.name}
              style={{
                display: "flex",
                gap: SPACING.L,
                borderRadius: BORDER_RADIUS.MEDIUM,
                padding: SPACING.M,
                transition: "background-color 0.2s ease",
                backgroundColor: COLORS.WHITE,
                position: "relative",
              }}
              className="group hover:bg-soft-cloud"
            >
              <div
                style={{
                  marginTop: "4px",
                  display: "flex",
                  width: "44px",
                  height: "44px",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: BORDER_RADIUS.MEDIUM,
                  backgroundColor: COLORS.SOFT_CLOUD,
                  transition: "background-color 0.2s ease",
                }}
                className="group-hover:bg-white"
              >
                <item.icon
                  aria-hidden="true"
                  style={{
                    width: "24px",
                    height: "24px",
                    color: COLORS.PEBBLE,
                    transition: "color 0.2s ease",
                  }}
                  className="group-hover:text-midnight-ash"
                />
              </div>
              <div>
                <Link
                  to={item.href}
                  style={{
                    fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                    color: COLORS.MIDNIGHT_ASH,
                    position: "relative",
                    textDecoration: "none",
                    display: "block",
                  }}
                >
                  {item.name}
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                    }}
                  />
                </Link>
                <p
                  style={{
                    marginTop: SPACING.S,
                    color: COLORS.PEBBLE,
                    margin: 0,
                  }}
                >
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            backgroundColor: COLORS.SOFT_CLOUD,
            paddingLeft: SPACING.XL,
            paddingRight: SPACING.XL,
            paddingTop: SPACING.XL,
            paddingBottom: SPACING.XL,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <h3
              style={{
                fontSize: TYPOGRAPHY.SIZE_LABEL_LARGE,
                lineHeight: TYPOGRAPHY.LINE_HEIGHT_NORMAL,
                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                color: COLORS.PEBBLE,
              }}
            >
              Recent Transactions
            </h3>
            <Link
              to={
                userId
                  ? `/products/${userId}/bidding`
                  : "/products/:userId/bidding"
              }
              style={{
                fontSize: TYPOGRAPHY.SIZE_LABEL_LARGE,
                lineHeight: TYPOGRAPHY.LINE_HEIGHT_NORMAL,
                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                color: COLORS.MIDNIGHT_ASH,
                textDecoration: "none",
              }}
            >
              See all <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
          <ul
            role="list"
            style={{
              marginTop: SPACING.L,
              display: "flex",
              flexDirection: "column",
              gap: SPACING.L,
              margin: 0,
              padding: 0,
              listStyle: "none",
            }}
          >
            {recentTransactions.map((tx) => (
              <li key={tx.id} style={{ position: "relative" }}>
                <time
                  dateTime={tx.datetime}
                  style={{
                    display: "block",
                    fontSize: TYPOGRAPHY.SIZE_LABEL,
                    lineHeight: TYPOGRAPHY.LINE_HEIGHT_NORMAL,
                    color: COLORS.PEBBLE,
                  }}
                >
                  {tx.date}
                </time>
                <Link
                  to={`/transactions/${tx.id}`}
                  style={{
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: TYPOGRAPHY.SIZE_BODY,
                    lineHeight: TYPOGRAPHY.LINE_HEIGHT_NORMAL,
                    fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                    color: COLORS.MIDNIGHT_ASH,
                    textDecoration: "none",
                    transition: "opacity 0.2s ease",
                  }}
                  className="hover:opacity-75"
                >
                  {tx.title}
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                    }}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={handleLogout}
          className="group hover:bg-red-50" // Light red hover for logout
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            textAlign: "left",
            border: "none",
            borderTop: `1px solid ${COLORS.MORNING_MIST}40`,
            backgroundColor: COLORS.WHITE,
            cursor: "pointer",
            padding: SPACING.M,
            gap: SPACING.L,
            transition: "background-color 0.2s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "44px",
              height: "44px",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: BORDER_RADIUS.MEDIUM,
              backgroundColor: COLORS.SOFT_CLOUD,
              transition: "background-color 0.2s ease",
            }}
            className="group-hover:bg-white"
          >
            <ArrowRightStartOnRectangleIcon
              style={{
                width: "24px",
                height: "24px",
                color: COLORS.PEBBLE,
                transition: "color 0.2s ease",
              }}
              className="group-hover:text-red-600" // Turn red on hover
            />
          </div>
          <div>
            <div
              style={{
                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                color: COLORS.MIDNIGHT_ASH,
                fontSize: TYPOGRAPHY.SIZE_BODY,
                transition: "color 0.2s ease",
              }}
              className="group-hover:text-red-700"
            >
              Sign out
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
