import React, { useState } from "react";
import Header from "../components/Header";
import Tabs from "../components/Tabs";
import Sidebar from "../components/Sidebar";
import {
  MagnifyingGlassIcon,
  TrashIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/designSystem";

const dummyMessages = [
  {
    id: "m1",
    sender: "eBay",
    subject: "Your use of the eBay platform has been restricted",
    preview: "Dear member, we have detected unusual activity...",
    time: "1d",
    read: false,
    hasBlueIndicator: true,
  },
  {
    id: "m2",
    sender: "eBay",
    subject: "A new device is using your account",
    preview: "We noticed a login from a new device...",
    time: "Dec 3",
    read: true,
    hasBlueIndicator: false,
  },
  {
    id: "m3",
    sender: "eBay",
    subject: "ACTION NEEDED: Please update the information we requested",
    preview: "To continue using your account...",
    time: "Dec 2",
    read: false,
    hasBlueIndicator: true,
  },
  {
    id: "m4",
    sender: "eBay",
    subject: "ACTION NEEDED: Please update the information we requested",
    preview: "We need additional verification...",
    time: "Nov 25",
    read: false,
    hasBlueIndicator: true,
  },
  {
    id: "m5",
    sender: "eBay",
    subject: "Finish your draft",
    preview: "You have an unfinished listing...",
    time: "Nov 22",
    read: true,
    hasBlueIndicator: false,
  },
  {
    id: "m6",
    sender: "eBay",
    subject: "eBay, bigger range, better choice!",
    preview: "Explore our expanded catalog...",
    time: "Nov 21",
    read: true,
    hasBlueIndicator: false,
  },
  {
    id: "m7",
    sender: "eBay",
    subject: "A new device is using your account",
    preview: "Security alert for your account...",
    time: "Nov 20",
    read: false,
    hasBlueIndicator: true,
  },
  {
    id: "m8",
    sender: "eBay",
    subject: "ACTION NEEDED: Please update the information we requested",
    preview: "Important account update required...",
    time: "Nov 18",
    read: false,
    hasBlueIndicator: true,
  },
];

export default function Conversation() {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === dummyMessages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(dummyMessages.map((m) => m.id)));
    }
  };

  return (
    <div
      style={{
        backgroundColor: COLORS.WHISPER,
        minHeight: "100vh",
      }}
    >
      <Header />

      <div style={{ paddingTop: SPACING.M }}>
        <div
          style={{
            maxWidth: "1400px",
            marginLeft: "auto",
            marginRight: "auto",
            paddingLeft: SPACING.M,
            paddingRight: SPACING.M,
          }}
        >
          <div className="lg:flex lg:space-x-6">
            {/* Sidebar */}
            <div className="hidden lg:block" style={{ width: "256px" }}>
              <Sidebar />
            </div>

            {/* Main content area */}
            <main className="flex-1 min-w-0">
              <div style={{ marginBottom: SPACING.L }}>
                <Tabs />
              </div>
              <div
                style={{
                  backgroundColor: COLORS.WHITE,
                  boxShadow: SHADOWS.SUBTLE,
                  borderRadius: BORDER_RADIUS.MEDIUM,
                  border: `1px solid rgba(179, 191, 185, 0.2)`,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr",
                    height: "calc(100vh - 200px)",
                  }}
                >
                  {/* Left column: Message list */}
                  <div
                    style={{
                      borderRight: `1px solid ${COLORS.MORNING_MIST}20`,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Search bar */}
                    <div
                      style={{
                        padding: SPACING.M,
                        borderBottom: `1px solid ${COLORS.MORNING_MIST}20`,
                      }}
                    >
                      <div style={{ position: "relative" }}>
                        <MagnifyingGlassIcon
                          style={{
                            position: "absolute",
                            left: SPACING.M,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: "20px",
                            height: "20px",
                            color: COLORS.PEBBLE,
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Search all member messages"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          style={{
                            width: "100%",
                            paddingLeft: `${40 + 16}px`,
                            paddingRight: SPACING.M,
                            paddingTop: "10px",
                            paddingBottom: "10px",
                            borderRadius: BORDER_RADIUS.FULL,
                            border: `1px solid ${COLORS.MORNING_MIST}`,
                            fontSize: TYPOGRAPHY.SIZE_BODY,
                            backgroundColor: COLORS.WHITE,
                            color: COLORS.MIDNIGHT_ASH,
                            transition: "border-color 0.2s ease",
                          }}
                          className="focus:outline-none"
                          onFocus={(e) => {
                            e.target.style.borderColor = COLORS.MIDNIGHT_ASH;
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = COLORS.MORNING_MIST;
                          }}
                        />
                      </div>
                    </div>

                    {/* Action toolbar */}
                    <div
                      style={{
                        paddingLeft: SPACING.M,
                        paddingRight: SPACING.M,
                        paddingTop: SPACING.S,
                        paddingBottom: SPACING.S,
                        borderBottom: `1px solid ${COLORS.MORNING_MIST}20`,
                        display: "flex",
                        alignItems: "center",
                        gap: SPACING.M,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.size === dummyMessages.length}
                        onChange={toggleSelectAll}
                        style={{
                          accentColor: COLORS.MIDNIGHT_ASH,
                          cursor: "pointer",
                        }}
                      />
                      <button
                        style={{
                          padding: `${SPACING.S} 6px`,
                          backgroundColor: "transparent",
                          border: "none",
                          borderRadius: BORDER_RADIUS.SMALL,
                          cursor: "pointer",
                          transition: "background-color 0.2s ease",
                        }}
                        className="hover:bg-gray-100"
                        title="Delete"
                      >
                        <TrashIcon
                          style={{
                            height: "20px",
                            width: "20px",
                            color: COLORS.PEBBLE,
                          }}
                        />
                      </button>
                      <button
                        style={{
                          padding: `${SPACING.S} 6px`,
                          backgroundColor: "transparent",
                          border: "none",
                          borderRadius: BORDER_RADIUS.SMALL,
                          cursor: "pointer",
                          transition: "background-color 0.2s ease",
                        }}
                        className="hover:bg-gray-100"
                        title="Mark as read"
                      >
                        <EnvelopeOpenIcon
                          style={{
                            height: "20px",
                            width: "20px",
                            color: COLORS.PEBBLE,
                          }}
                        />
                      </button>
                      <button
                        style={{
                          padding: `${SPACING.S} 6px`,
                          backgroundColor: "transparent",
                          border: "none",
                          borderRadius: BORDER_RADIUS.SMALL,
                          cursor: "pointer",
                          transition: "background-color 0.2s ease",
                        }}
                        className="hover:bg-gray-100"
                        title="Mark as unread"
                      >
                        <EnvelopeIcon
                          style={{
                            height: "20px",
                            width: "20px",
                            color: COLORS.PEBBLE,
                          }}
                        />
                      </button>
                      <button
                        style={{
                          padding: `${SPACING.S} 6px`,
                          backgroundColor: "transparent",
                          border: "none",
                          borderRadius: BORDER_RADIUS.SMALL,
                          cursor: "pointer",
                          transition: "background-color 0.2s ease",
                        }}
                        className="hover:bg-gray-100"
                        title="Archive"
                      >
                        <ArchiveBoxIcon
                          style={{
                            height: "20px",
                            width: "20px",
                            color: COLORS.PEBBLE,
                          }}
                        />
                      </button>
                    </div>

                    {/* Message list */}
                    <div
                      style={{
                        flex: 1,
                        overflowY: "auto",
                      }}
                    >
                      <ul
                        style={{
                          margin: 0,
                          padding: 0,
                          listStyle: "none",
                          borderTop: `1px solid ${COLORS.MORNING_MIST}20`,
                        }}
                      >
                        {dummyMessages.map((msg) => (
                          <li
                            key={msg.id}
                            onClick={() => setSelectedMessage(msg)}
                            style={{
                              paddingLeft: SPACING.M,
                              paddingRight: SPACING.M,
                              paddingTop: SPACING.S,
                              paddingBottom: SPACING.S,
                              cursor: "pointer",
                              backgroundColor:
                                selectedMessage?.id === msg.id
                                  ? COLORS.SOFT_CLOUD
                                  : COLORS.WHITE,
                              borderBottom: `1px solid ${COLORS.MORNING_MIST}20`,
                              transition: "background-color 0.2s ease",
                            }}
                            className="hover:bg-soft-cloud"
                            onMouseEnter={(e) => {
                              if (selectedMessage?.id !== msg.id) {
                                e.currentTarget.style.backgroundColor =
                                  COLORS.SOFT_CLOUD + "50";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedMessage?.id !== msg.id) {
                                e.currentTarget.style.backgroundColor =
                                  COLORS.WHITE;
                              }
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: SPACING.M,
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={selectedIds.has(msg.id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleSelect(msg.id);
                                }}
                                style={{
                                  marginTop: "6px",
                                  accentColor: COLORS.MIDNIGHT_ASH,
                                  cursor: "pointer",
                                }}
                              />
                              <div
                                style={{
                                  flex: 1,
                                  minWidth: 0,
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: SPACING.S,
                                    marginBottom: SPACING.XS,
                                  }}
                                >
                                  {msg.hasBlueIndicator && (
                                    <div
                                      style={{
                                        height: "8px",
                                        width: "8px",
                                        borderRadius: "50%",
                                        backgroundColor: "#3b82f6",
                                        flexShrink: 0,
                                      }}
                                    />
                                  )}
                                  <span
                                    style={{
                                      fontSize: TYPOGRAPHY.SIZE_BODY,
                                      fontWeight: msg.read
                                        ? TYPOGRAPHY.WEIGHT_NORMAL
                                        : TYPOGRAPHY.WEIGHT_SEMIBOLD,
                                      color: msg.read
                                        ? COLORS.PEBBLE
                                        : COLORS.MIDNIGHT_ASH,
                                    }}
                                  >
                                    {msg.sender}
                                  </span>
                                </div>
                                <p
                                  style={{
                                    fontSize: TYPOGRAPHY.SIZE_BODY,
                                    color: msg.read
                                      ? COLORS.PEBBLE
                                      : COLORS.MIDNIGHT_ASH,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    margin: 0,
                                  }}
                                >
                                  {msg.subject}
                                </p>
                                <p
                                  style={{
                                    fontSize: TYPOGRAPHY.SIZE_LABEL,
                                    color: COLORS.PEBBLE,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    margin: `${SPACING.XS} 0 0 0`,
                                  }}
                                >
                                  {msg.preview}
                                </p>
                              </div>
                              <span
                                style={{
                                  fontSize: TYPOGRAPHY.SIZE_LABEL,
                                  color: COLORS.PEBBLE,
                                  flexShrink: 0,
                                }}
                              >
                                {msg.time}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right column: Message detail or empty state */}
                  <div
                    style={{
                      display: "flex",
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: COLORS.WHITE,
                    }}
                  >
                    {selectedMessage ? (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <div
                          style={{
                            padding: SPACING.L,
                            borderBottom: `1px solid ${COLORS.MORNING_MIST}20`,
                            backgroundColor: COLORS.WHITE,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                            }}
                          >
                            <div>
                              <h2
                                style={{
                                  fontSize: TYPOGRAPHY.SIZE_HEADER,
                                  fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                                  color: COLORS.MIDNIGHT_ASH,
                                  margin: 0,
                                }}
                              >
                                {selectedMessage.subject}
                              </h2>
                              <p
                                style={{
                                  fontSize: TYPOGRAPHY.SIZE_BODY,
                                  color: COLORS.PEBBLE,
                                  marginTop: SPACING.S,
                                  margin: 0,
                                }}
                              >
                                From: {selectedMessage.sender} ·{" "}
                                {selectedMessage.time}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            flex: 1,
                            padding: SPACING.L,
                            overflowY: "auto",
                          }}
                        >
                          <p
                            style={{
                              fontSize: TYPOGRAPHY.SIZE_BODY,
                              color: COLORS.MIDNIGHT_ASH,
                              lineHeight: TYPOGRAPHY.LINE_HEIGHT_RELAXED,
                            }}
                          >
                            {selectedMessage.preview}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            marginBottom: SPACING.L,
                          }}
                        >
                          <svg
                            style={{
                              height: "128px",
                              width: "128px",
                            }}
                            viewBox="0 0 200 200"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect
                              x="50"
                              y="60"
                              width="100"
                              height="80"
                              rx="8"
                              fill="#D4A574"
                            />
                            <rect
                              x="55"
                              y="65"
                              width="90"
                              height="70"
                              rx="4"
                              fill="#8B6F47"
                            />
                            <circle cx="85" cy="95" r="8" fill="#F4A460" />
                            <circle cx="85" cy="95" r="4" fill="#2C5F2D" />
                            <path
                              d="M75 110 Q85 120 95 110"
                              stroke="#F4A460"
                              strokeWidth="3"
                              fill="none"
                            />
                            <rect
                              x="110"
                              y="85"
                              width="25"
                              height="15"
                              rx="2"
                              fill="#2C7A7B"
                            />
                            <rect
                              x="115"
                              y="88"
                              width="3"
                              height="9"
                              fill="#81E6D9"
                            />
                            <path
                              d="M100 140 L100 170"
                              stroke="#8B6F47"
                              strokeWidth="4"
                            />
                            <ellipse
                              cx="100"
                              cy="175"
                              rx="15"
                              ry="5"
                              fill="#4A5568"
                            />
                          </svg>
                        </div>
                        <p
                          style={{
                            fontSize: TYPOGRAPHY.SIZE_BODY,
                            fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                            color: COLORS.MIDNIGHT_ASH,
                          }}
                        >
                          Select a message to read.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
