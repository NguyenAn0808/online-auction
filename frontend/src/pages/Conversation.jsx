import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  getOrderMessages,
  sendOrderMessage,
  listOrders,
} from "../services/orderService";
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

// Helper functions from ChatBox
function initials(nameOrId) {
  if (!nameOrId) return "?";
  if (nameOrId.includes(" ")) {
    return nameOrId.split(" ")[0].slice(0, 1).toUpperCase();
  }
  return nameOrId.slice(0, 1).toUpperCase();
}

function formatTime(date) {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  }
}

export default function Conversation() {
  const { user } = useAuth();
  const toast = useToast();
  const [transactions, setTransactions] = useState([]);
  const [filteredTx, setFilteredTx] = useState([]);
  const [selectedTxId, setSelectedTxId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const listRef = useRef(null);
  const userId = user?.id;

  // Load orders from backend API
  useEffect(() => {
    const loadOrders = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const orders = await listOrders();
        const mappedOrders = orders.map((order) => ({
          id: order.id,
          buyerId: order.buyer_id || order.buyer?.id,
          sellerId: order.seller_id || order.seller?.id,
          productName: order.product?.name || `Order #${order.id?.slice(0, 8)}`,
          status: order.status || "pending",
          product_id: order.product_id || order.product?.id,
          created_at: order.created_at,
          unread: 0,
        }));
        setTransactions(mappedOrders);
      } catch (error) {
        console.error("Failed to load orders:", error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [userId]);

  // Filter transactions based on search
  useEffect(() => {
    const q = (searchQuery || "").toLowerCase();
    setFilteredTx(
      transactions.filter(
        (t) =>
          t.productName?.toLowerCase().includes(q) ||
          t.status?.toLowerCase().includes(q) ||
          t.id?.toLowerCase().includes(q)
      )
    );
  }, [searchQuery, transactions]);

  // Load messages for selected order
  useEffect(() => {
    if (selectedTxId && userId) {
      const loadMessages = async () => {
        try {
          setLoadingMessages(true);
          const msgs = await getOrderMessages(selectedTxId);
          setMessages(
            msgs.map((msg) => ({
              id: msg.id,
              sender_id: msg.sender_id,
              text: msg.message,
              time: new Date(msg.created_at).getTime(),
              sender_name: msg.sender_name,
            }))
          );
        } catch (error) {
          console.error("Failed to load messages:", error);
          setMessages([]);
        } finally {
          setLoadingMessages(false);
        }
      };

      loadMessages();
    } else {
      setMessages([]);
    }
  }, [selectedTxId, userId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Polling: Refresh messages every 3 seconds
  useEffect(() => {
    if (!selectedTxId || !userId) return;

    const interval = setInterval(async () => {
      try {
        const msgs = await getOrderMessages(selectedTxId);
        setMessages(
          msgs.map((msg) => ({
            id: msg.id,
            sender_id: msg.sender_id,
            text: msg.message,
            time: new Date(msg.created_at).getTime(),
            sender_name: msg.sender_name,
          }))
        );
      } catch (error) {
        console.error("Failed to refresh messages:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedTxId, userId]);

  // Handle sending messages
  async function handleSend() {
    if (!selectedTxId || !text.trim() || !userId) return;

    try {
      await sendOrderMessage(selectedTxId, text.trim());
      const msgs = await getOrderMessages(selectedTxId);
      setMessages(
        msgs.map((msg) => ({
          id: msg.id,
          sender_id: msg.sender_id,
          text: msg.message,
          time: new Date(msg.created_at).getTime(),
          sender_name: msg.sender_name,
        }))
      );
      setText("");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
    }
  }

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
    if (selectedIds.size === filteredTx.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTx.map((m) => m.id)));
    }
  };

  const selectedOrder = transactions.find((t) => t.id === selectedTxId);

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
                    height: "calc(100vh - 250px)",
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
                        checked={selectedIds.size === filteredTx.length && filteredTx.length > 0}
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
                        {loading ? (
                          <li
                            style={{
                              padding: SPACING.XL,
                              textAlign: "center",
                            }}
                          >
                            <div
                              style={{
                                fontSize: TYPOGRAPHY.SIZE_BODY,
                                color: COLORS.PEBBLE,
                              }}
                            >
                              Loading conversations...
                            </div>
                          </li>
                        ) : filteredTx.length === 0 ? (
                          <li
                            style={{
                              padding: SPACING.XL,
                              textAlign: "center",
                            }}
                          >
                            <div
                              style={{
                                fontSize: TYPOGRAPHY.SIZE_BODY,
                                color: COLORS.PEBBLE,
                              }}
                            >
                              No conversations found
                            </div>
                          </li>
                        ) : (
                          filteredTx.map((order) => (
                          <li
                            key={order.id}
                            onClick={() => setSelectedTxId(order.id)}
                            style={{
                              paddingLeft: SPACING.M,
                              paddingRight: SPACING.M,
                              paddingTop: SPACING.S,
                              paddingBottom: SPACING.S,
                              cursor: "pointer",
                              backgroundColor:
                                selectedTxId === order.id
                                  ? COLORS.SOFT_CLOUD
                                  : COLORS.WHITE,
                              borderBottom: `1px solid ${COLORS.MORNING_MIST}20`,
                              transition: "background-color 0.2s ease",
                            }}
                            className="hover:bg-soft-cloud"
                            onMouseEnter={(e) => {
                              if (selectedTxId !== order.id) {
                                e.currentTarget.style.backgroundColor =
                                  COLORS.SOFT_CLOUD + "50";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedTxId !== order.id) {
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
                                checked={selectedIds.has(order.id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleSelect(order.id);
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
                                  <span
                                    style={{
                                      fontSize: TYPOGRAPHY.SIZE_BODY,
                                      fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                                      color: COLORS.MIDNIGHT_ASH,
                                    }}
                                  >
                                    {order.productName}
                                  </span>
                                </div>
                                <span
                                  style={{
                                    fontSize: TYPOGRAPHY.SIZE_LABEL,
                                    padding: `2px ${SPACING.S}`,
                                    borderRadius: BORDER_RADIUS.FULL,
                                    backgroundColor:
                                      order.status === "shipped"
                                        ? "#D1FAE5"
                                        : order.status === "delivered"
                                        ? "#DBEAFE"
                                        : "#FEF3C7",
                                    color:
                                      order.status === "shipped"
                                        ? "#065F46"
                                        : order.status === "delivered"
                                        ? "#1E40AF"
                                        : "#92400E",
                                    fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                                    textTransform: "capitalize",
                                  }}
                                >
                                  {order.status}
                                </span>
                              </div>
                              <span
                                style={{
                                  fontSize: TYPOGRAPHY.SIZE_LABEL,
                                  color: COLORS.PEBBLE,
                                  flexShrink: 0,
                                }}
                              >
                                {formatTime(order.created_at)}
                              </span>
                            </div>
                          </li>
                        ))
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Right column: Message detail or empty state */}
                  <div
                    style={{
                      display: "flex",
                      flex: 1,
                      flexDirection: "column",
                      height: "100%",
                      minHeight: 0,
                      backgroundColor: COLORS.WHITE,
                    }}
                  >
                    {selectedTxId ? (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          overflow: "hidden",
                        }}
                      >
                        {/* HEADER: Fix height, never shrink */}
                        <div
                          style={{
                            flexShrink: 0,
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
                                {selectedOrder?.productName || "Conversation"}
                              </h2>
                              <p
                                style={{
                                  fontSize: TYPOGRAPHY.SIZE_BODY,
                                  color: COLORS.PEBBLE,
                                  marginTop: SPACING.S,
                                  margin: 0,
                                }}
                              >
                                Order Status: {selectedOrder?.status || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                        {/* SCROLL PANEL: Grow to fill space, scroll internally */}
                        <div
                          ref={listRef}
                          className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400"
                          style={{
                            flex: "1 1 0",
                            minHeight: 0,
                            maxHeight: "100%",
                            padding: SPACING.L,
                            paddingBottom: SPACING.M,
                            overflowY: "auto",
                            overflowX: "hidden",
                            backgroundColor: COLORS.WHISPER,
                          }}
                        >
                          {loadingMessages ? (
                            <div
                              style={{
                                textAlign: "center",
                                padding: SPACING.XL,
                              }}
                            >
                              <div
                                style={{
                                  fontSize: TYPOGRAPHY.SIZE_BODY,
                                  color: COLORS.PEBBLE,
                                }}
                              >
                                Loading messages...
                              </div>
                            </div>
                          ) : messages.length === 0 ? (
                            <div
                              style={{
                                textAlign: "center",
                                padding: SPACING.XL,
                              }}
                            >
                              <div
                                style={{
                                  fontSize: TYPOGRAPHY.SIZE_BODY,
                                  color: COLORS.PEBBLE,
                                }}
                              >
                                No messages yet. Start the conversation!
                              </div>
                            </div>
                          ) : (
                            <ul
                              style={{
                                margin: 0,
                                padding: 0,
                                listStyle: "none",
                                display: "flex",
                                flexDirection: "column",
                                gap: SPACING.M,
                              }}
                            >
                              {messages.map((m, idx) => {
                                const prev = messages[idx - 1];
                                const showAvatar = !prev || prev.sender_id !== m.sender_id;
                                // Type-safe comparison: handle number vs string IDs
                                const isMe = String(m.sender_id) === String(userId);
                                return (
                                  <li
                                    key={m.id}
                                    style={{
                                      display: "flex",
                                      alignItems: "flex-start",
                                      gap: SPACING.M,
                                      justifyContent: isMe ? "flex-end" : "flex-start",
                                    }}
                                  >
                                    {!isMe && showAvatar && (
                                      <div
                                        style={{
                                          height: "32px",
                                          width: "32px",
                                          borderRadius: "50%",
                                          backgroundColor: COLORS.MIDNIGHT_ASH,
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          fontSize: TYPOGRAPHY.SIZE_LABEL,
                                          fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                                          color: COLORS.WHITE,
                                          flexShrink: 0,
                                        }}
                                      >
                                        {initials(m.sender_name || m.sender_id)}
                                      </div>
                                    )}
                                    {!isMe && !showAvatar && (
                                      <div style={{ width: "32px" }} />
                                    )}
                                    <div
                                      style={{
                                        maxWidth: "75%",
                                        textAlign: isMe ? "right" : "left",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "inline-block",
                                          paddingLeft: SPACING.M,
                                          paddingRight: SPACING.M,
                                          paddingTop: SPACING.S,
                                          paddingBottom: SPACING.S,
                                          borderRadius: BORDER_RADIUS.MEDIUM,
                                          boxShadow: SHADOWS.SUBTLE,
                                          backgroundColor: isMe
                                            ? COLORS.MIDNIGHT_ASH
                                            : COLORS.WHITE,
                                          color: isMe ? COLORS.WHITE : COLORS.MIDNIGHT_ASH,
                                        }}
                                      >
                                        {!isMe && (
                                          <div
                                            style={{
                                              fontSize: TYPOGRAPHY.SIZE_LABEL,
                                              fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                                              marginBottom: SPACING.XS,
                                            }}
                                          >
                                            {m.sender_name || "User"}
                                          </div>
                                        )}
                                        <div
                                          style={{
                                            fontSize: TYPOGRAPHY.SIZE_BODY,
                                            wordBreak: "break-word",
                                            whiteSpace: "pre-wrap",
                                          }}
                                        >
                                          {m.text}
                                        </div>
                                        <div
                                          style={{
                                            fontSize: TYPOGRAPHY.SIZE_LABEL,
                                            opacity: 0.75,
                                            marginTop: SPACING.XS,
                                          }}
                                        >
                                          {new Date(m.time).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                    {isMe && showAvatar && (
                                      <div
                                        style={{
                                          height: "32px",
                                          width: "32px",
                                          borderRadius: "50%",
                                          backgroundColor: COLORS.MIDNIGHT_ASH,
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          fontSize: TYPOGRAPHY.SIZE_LABEL,
                                          fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                                          color: COLORS.WHITE,
                                          flexShrink: 0,
                                        }}
                                      >
                                        {initials(user?.fullName || user?.email)}
                                      </div>
                                    )}
                                    {isMe && !showAvatar && (
                                      <div style={{ width: "32px" }} />
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                        {/* FOOTER (INPUT): Fix height, never shrink, stick to bottom */}
                        <div
                          style={{
                            flexShrink: 0,
                            padding: SPACING.M,
                            borderTop: `1px solid ${COLORS.MORNING_MIST}`,
                            backgroundColor: COLORS.WHITE,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: SPACING.S,
                              alignItems: "center",
                            }}
                          >
                            <input
                              value={text}
                              onChange={(e) => setText(e.target.value)}
                              placeholder="Write a message..."
                              style={{
                                flex: 1,
                                borderRadius: BORDER_RADIUS.MEDIUM,
                                border: `1px solid ${COLORS.MORNING_MIST}`,
                                paddingLeft: SPACING.M,
                                paddingRight: SPACING.M,
                                paddingTop: "8px",
                                paddingBottom: "8px",
                                fontSize: TYPOGRAPHY.SIZE_BODY,
                                color: COLORS.MIDNIGHT_ASH,
                                backgroundColor: COLORS.WHITE,
                                transition: "border-color 0.2s ease",
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = COLORS.MIDNIGHT_ASH;
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = COLORS.MORNING_MIST;
                              }}
                              onKeyPress={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSend();
                                }
                              }}
                            />
                            <button
                              onClick={handleSend}
                              disabled={!text.trim()}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                paddingLeft: SPACING.M,
                                paddingRight: SPACING.M,
                                paddingTop: "8px",
                                paddingBottom: "8px",
                                backgroundColor: text.trim()
                                  ? COLORS.MIDNIGHT_ASH
                                  : COLORS.PEBBLE,
                                color: COLORS.WHITE,
                                borderRadius: BORDER_RADIUS.SMALL,
                                border: "none",
                                cursor: text.trim() ? "pointer" : "not-allowed",
                                fontSize: TYPOGRAPHY.SIZE_BODY,
                                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                                transition: "opacity 0.2s ease",
                                opacity: text.trim() ? 1 : 0.6,
                              }}
                              className="hover:opacity-90"
                            >
                              Send
                            </button>
                          </div>
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
                          Select a conversation to read messages.
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
