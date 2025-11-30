import { ChevronDownIcon } from "@heroicons/react/20/solid";
import {
  BookmarkSquareIcon,
  CalendarDaysIcon,
  LifebuoyIcon,
} from "@heroicons/react/24/outline";

const resources = [
  {
    name: "Summary",
    description: "Get all of your questions answered",
    href: "/summary/1",
    icon: LifebuoyIcon,
  },
  {
    name: "Ratings",
    description: "Learn how to maximize our platform",
    href: "/ratings/1",
    icon: BookmarkSquareIcon,
  },
  {
    name: "Watchlist",
    description: "See meet-ups and other events near you",
    href: "/watchlists/1",
    icon: CalendarDaysIcon,
  },
  {
    name: "Purchase History",
    description: "See meet-ups and other events near you",
    href: "/products/1",
    icon: CalendarDaysIcon,
  },
];
const recentMessages = [
  {
    id: 1,
    title: "Boost your conversion rate",
    href: "#",
    date: "Mar 5, 2023",
    datetime: "2023-03-05",
  },
  {
    id: 2,
    title:
      "How to use search engine optimization to drive traffic to your site",
    href: "#",
    date: "Feb 25, 2023",
    datetime: "2023-02-25",
  },
  {
    id: 3,
    title: "Improve your customer experience",
    href: "#",
    date: "Feb 21, 2023",
    datetime: "2023-02-21",
  },
];

export default function FlyoutMenu({ alignRight = false }) {
  // alignRight: when true, position the panel to the right of its container (for profile button)
  const containerClass = alignRight
    ? "absolute right-0 z-10 mt-2 w-80 px-2"
    : "absolute left-1/2 z-10 mt-5 flex w-screen max-w-max -translate-x-1/2 px-4";

  return (
    // Panel only. The header will control when this is rendered.
    <div className={containerClass}>
      <div className="w-full max-w-md flex-auto overflow-hidden rounded-3xl bg-white text-sm/6 ring-1 shadow-lg ring-gray-900/5">
        <div className="p-4">
          {resources.map((item) => (
            <div
              key={item.name}
              className="group relative flex gap-x-6 rounded-lg p-4 hover:bg-gray-50"
            >
              <div className="mt-1 flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                <item.icon
                  aria-hidden="true"
                  className="size-6 text-gray-600 group-hover:text-indigo-600"
                />
              </div>
              <div>
                <a href={item.href} className="font-semibold text-gray-900">
                  {item.name}
                  <span className="absolute inset-0" />
                </a>
                <p className="mt-1 text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 p-8">
          <div className="flex justify-between">
            <h3 className="text-sm/6 font-semibold text-gray-500">
              Recent posts
            </h3>
            <a href="#" className="text-sm/6 font-semibold text-indigo-600">
              See all <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
          <ul role="list" className="mt-6 space-y-6">
            {recentMessages.map((message) => (
              <li key={message.id} className="relative">
                <time
                  dateTime={message.datetime}
                  className="block text-xs/6 text-gray-600"
                >
                  {message.date}
                </time>
                <a
                  href={message.href}
                  className="block truncate text-sm/6 font-semibold text-gray-900"
                >
                  {message.title}
                  <span className="absolute inset-0" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
