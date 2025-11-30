import { NavLink } from "react-router-dom";
import {
  UserIcon,
  StarIcon,
  HeartIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Sidebar() {
  const userId = localStorage.getItem("userId") || "buyer-1";
  const items = [
    { name: "Profile", to: `/summary/${userId}`, icon: UserIcon },
    { name: "Ratings", to: `/ratings/${userId}`, icon: StarIcon },
    { name: "Watchlists", to: `/watchlists/${userId}`, icon: HeartIcon },
    {
      name: "Bids & Offers",
      to: `/products/${userId}/bidding`,
      icon: ShoppingBagIcon,
    },
  ];

  return (
    <nav aria-label="Sidebar" className="flex flex-1 flex-col">
      <ul role="list" className="-mx-2 space-y-1">
        {items.map((item) => (
          <li key={item.name}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                classNames(
                  isActive
                    ? "bg-gray-50 text-indigo-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600",
                  "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
                )
              }
            >
              <item.icon
                aria-hidden="true"
                className={classNames(
                  "size-6 shrink-0",
                  "text-gray-400 group-hover:text-indigo-600"
                )}
              />
              {item.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
