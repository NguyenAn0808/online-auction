import { ChevronDownIcon } from "@heroicons/react/20/solid";
import {
  UserIcon,
  StarIcon,
  HeartIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ArrowRightStartOnRectangleIcon,
  BookmarkSquareIcon,
  LifebuoyIcon,
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
  const isAdmin = user?.role === "admin";
  const isBidder = user?.role === "bidder";

  const resources = [
    {
      name: "Summary",
      description: "Profile summary",
      href: userId ? `/summary/${userId}` : "/auth/signin",
      icon: UserIcon,
    },
    {
      name: "Ratings",
      description: "Reviews and ratings",
      href: userId ? `/ratings/${userId}` : "/auth/signin",
      icon: StarIcon,
    },
    {
      name: "Watchlist",
      description: "Favorite items",
      href: userId ? `/watchlists/${userId}` : "/auth/signin",
      icon: HeartIcon,
    },
    {
      name: "Bids & Offers",
      description: "Your bidding activity",
      href: userId ? `/products/${userId}/bidding` : "/auth/signin",
      icon: ShoppingBagIcon,
    },
    // Seller Upgrade link - only shown to bidder users
    ...(isBidder
      ? [
          {
            name: "Seller Upgrade",
            description: "Upgrade to seller account",
            href: "/upgrade-requests",
            icon: CurrencyDollarIcon,
          },
        ]
      : []),
    // Admin Panel link - only shown to admin users
    ...(isAdmin
      ? [
          {
            name: "Admin Panel",
            description: "Manage users, products, and settings",
            href: "/admin",
            icon: LifebuoyIcon,
          },
        ]
      : []),
  ];
  // Temporary placeholder recent transactions (top 3)
  // const recentTransactions = [
  //   {
  //     id: "tx_1",
  //     title: "Won: Waxed Canvas Backpack",
  //     date: "Nov 15",
  //     datetime: "2025-11-15",
  //   },
  //   {
  //     id: "tx_2",
  //     title: "Purchased: Zip Tote Basket",
  //     date: "Oct 30",
  //     datetime: "2025-10-30",
  //   },
  //   {
  //     id: "tx_3",
  //     title: "Refunded: Classic Leather Satchel",
  //     date: "Sep 8",
  //     datetime: "2025-09-08",
  //   },
  // ];
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
          width: "320px",
          maxWidth: "",
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
                padding: SPACING.S,
                transition: "background-color 0.2s ease",
                // backgroundColor: COLORS.WHITE,
                position: "relative",
              }}
              className="group hover:bg-soft-cloud"
            >
              <div
                style={{
                  // marginTop: "4px",
                  display: "flex",
                  padding: SPACING.S,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: BORDER_RADIUS.MEDIUM,
                  // backgroundColor: COLORS.SOFT_CLOUD,
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
        {/* <div
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
        </div> */}
        <div
          style={{
            borderTop: `1px solid ${COLORS.MORNING_MIST}40`,
            paddingLeft: SPACING.M,
            paddingBlock: SPACING.S,
          }}
        >
          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: "flex",
              gap: SPACING.L,
              borderRadius: BORDER_RADIUS.MEDIUM,
              padding: SPACING.S,
              transition: "background-color 0.2s ease",
              position: "relative",
              width: "100%",
              textAlign: "left",
              backgroundColor: "transparent",
              border: "none",
            }}
            className="group hover:bg-soft-cloud"
          >
            <div
              style={{
                display: "flex",
                padding: SPACING.S,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: BORDER_RADIUS.MEDIUM,
                transition: "background-color 0.2s ease",
              }}
              className="group-hover:bg-white"
            >
              <ArrowRightStartOnRectangleIcon
                aria-hidden="true"
                style={{
                  width: "24px",
                  height: "24px",
                  color: COLORS.PEBBLE,
                  transition: "color 0.2s ease",
                }}
                className="group-hover:text-red-600"
              />
            </div>
            <div
              style={{
                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                color: COLORS.MIDNIGHT_ASH,
                textDecoration: "none",
              }}
              className="group-hover:text-red-700 justify-center items-center flex"
            >
              Sign out
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
