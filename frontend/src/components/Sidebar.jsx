import { NavLink } from "react-router-dom";
import {
  UserIcon,
  StarIcon,
  HeartIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
} from "../constants/designSystem";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Sidebar() {
  const storedUserStr = localStorage.getItem("user");
  const storedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
  const userId = storedUser?.id || "buyer-1";
  const items = [
    { name: "Profile", to: `/summary/${userId}`, icon: UserIcon },
    { name: "Ratings", to: `/ratings/${userId}`, icon: StarIcon },
    { name: "Watchlists", to: `/watchlists/${userId}`, icon: HeartIcon },
    {
      name: "Bids & Offers",
      to: `/products/${userId}/bidding`,
      icon: ShoppingBagIcon,
    },
    {
      name: "Selling Request",
      to: `/upgrade-requests`,
      icon: CurrencyDollarIcon,
    },
  ];

  return (
    <nav
      aria-label="Sidebar"
      className="flex flex-1 flex-col"
      style={{
        backgroundColor: COLORS.WHITE,
        borderRadius: BORDER_RADIUS.MEDIUM,
        padding: SPACING.M,
      }}
    >
      <ul role="list" className="space-y-1">
        {items.map((item) => (
          <li key={item.name}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                classNames(
                  isActive
                    ? "text-pebble font-bold"
                    : "text-midnight-ash hover:text-midnight-ash hover:bg-whisper",
                  "group flex gap-x-3 rounded-md p-2 text-sm font-semibold transition-all duration-200 pl-4"
                )
              }
              style={({ isActive }) => ({
                backgroundColor: isActive ? COLORS.WHISPER : "transparent",
              })}
            >
              <item.icon
                aria-hidden="true"
                className="h-6 w-6 shrink-0"
                style={{
                  color: "currentColor",
                }}
              />
              <span style={{ fontSize: TYPOGRAPHY.SIZE_BODY }}>
                {item.name}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
