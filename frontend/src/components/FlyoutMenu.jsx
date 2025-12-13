import { ChevronDownIcon } from "@heroicons/react/20/solid";
import {
  BookmarkSquareIcon,
  CalendarDaysIcon,
  LifebuoyIcon,
} from "@heroicons/react/24/outline";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/designSystem";

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
                <a
                  href={item.href}
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
                </a>
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
              Recent posts
            </h3>
            <a
              href="#"
              style={{
                fontSize: TYPOGRAPHY.SIZE_LABEL_LARGE,
                lineHeight: TYPOGRAPHY.LINE_HEIGHT_NORMAL,
                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                color: COLORS.MIDNIGHT_ASH,
                textDecoration: "none",
              }}
            >
              See all <span aria-hidden="true">&rarr;</span>
            </a>
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
            {recentMessages.map((message) => (
              <li key={message.id} style={{ position: "relative" }}>
                <time
                  dateTime={message.datetime}
                  style={{
                    display: "block",
                    fontSize: TYPOGRAPHY.SIZE_LABEL,
                    lineHeight: TYPOGRAPHY.LINE_HEIGHT_NORMAL,
                    color: COLORS.PEBBLE,
                  }}
                >
                  {message.date}
                </time>
                <a
                  href={message.href}
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
                  {message.title}
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                    }}
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
