import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  getOrderMessages,
  sendOrderMessage,
  listOrders,
} from "../services/orderService";
import { useAuth } from "../context/AuthContext";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/designSystem";

function initials(nameOrId) {
  if (!nameOrId) return "?";
  // If it's a name, use first letter; if it's an ID, use first character
  if (nameOrId.includes(" ")) {
    // It's a name
    return nameOrId.split(" ")[0].slice(0, 1).toUpperCase();
  }
  // It's an ID, use first character
  return nameOrId.slice(0, 1).toUpperCase();
}

export default function ChatBox({ onClose, openForTx, contextProduct }) {
  const location = useLocation();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filteredTx, setFilteredTx] = useState([]);
  const [selectedTxId, setSelectedTxId] = useState(openForTx || null);
  const [tx, setTx] = useState(null);
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const userId = user?.id;
  const listRef = useRef(null);
  const containerRef = useRef(null);
  const [productContext, setProductContext] = useState(contextProduct || null);

  // Load orders from backend API
  useEffect(() => {
    const loadOrders = async () => {
      if (!userId) return;

      try {
        const orders = await listOrders();
        // Map orders to transaction format for compatibility
        const mappedOrders = orders.map((order) => ({
          id: order.id,
          buyerId: order.buyer_id || order.buyer?.id,
          sellerId: order.seller_id || order.seller?.id,
          title: `Order #${order.id?.slice(0, 8) || "N/A"}`,
          product_id: order.product_id || order.product?.id,
          unread: 0, // Will be calculated from messages
        }));
        setTransactions(mappedOrders);
      } catch (error) {
        console.error("Failed to load orders:", error);
        setTransactions([]);
      }
    };

    loadOrders();
  }, [userId]);

  useEffect(() => {
    // filter transactions when search changes
    const q = (search || "").toLowerCase();
    setFilteredTx(
      transactions.filter(
        (t) =>
          `${t.buyerId} ${t.sellerId}`.toLowerCase().includes(q) ||
          (t.title && t.title.toLowerCase().includes(q))
      )
    );
  }, [search, transactions]);

  // auto-select tx from prop or query param `tx`
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const txParam = params.get("tx");
    if (openForTx) {
      setSelectedTxId(openForTx);
    } else if (txParam) {
      setSelectedTxId(txParam);
    }
  }, [location.search, openForTx]);

  // Load messages for selected order
  useEffect(() => {
    if (selectedTxId && userId) {
      const loadMessages = async () => {
        try {
          setLoadingMessages(true);
          const messages = await getOrderMessages(selectedTxId);

          // Find the order to get buyer/seller info
          const order = transactions.find((t) => t.id === selectedTxId);

          setTx({
            id: selectedTxId,
            messages: messages.map((msg) => ({
              id: msg.id,
              sender: msg.sender_id,
              text: msg.message,
              time: new Date(msg.created_at).getTime(),
              sender_name: msg.sender_name,
            })),
            buyerId: order?.buyerId,
            sellerId: order?.sellerId,
          });
        } catch (error) {
          console.error("Failed to load messages:", error);
          setTx(null);
        } finally {
          setLoadingMessages(false);
        }
      };

      loadMessages();
    } else {
      setTx(null);
    }
  }, [selectedTxId, userId, transactions]);

  useEffect(() => {
    // scroll to bottom when messages change
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [tx && tx.messages && tx.messages.length]);

  useEffect(() => {
    setProductContext(contextProduct || null);
  }, [contextProduct]);

  async function handleSend() {
    if (!tx || !text.trim() || !userId) return;

    try {
      // Send message via API
      await sendOrderMessage(tx.id, text.trim());

      // Reload messages to get the new one
      const messages = await getOrderMessages(tx.id);
      const order = transactions.find((t) => t.id === tx.id);

      setTx({
        id: tx.id,
        messages: messages.map((msg) => ({
          id: msg.id,
          sender: msg.sender_id,
          text: msg.message,
          time: new Date(msg.created_at).getTime(),
          sender_name: msg.sender_name,
        })),
        buyerId: order?.buyerId,
        sellerId: order?.sellerId,
      });

      setText("");
      setFiles([]);
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    }
  }

  function handleFileChange(e) {
    const list = Array.from(e.target.files || []);
    setFiles(list);
  }

  // Render ChatBox (parent handles conditional rendering)
  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        right: SPACING.L,
        bottom: `calc(${SPACING.L} + 72px)`,
        zIndex: 9999,
        transform: "scale(1)",
        transformOrigin: "bottom right",
        transition: "opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        width: "900px",
        height: "500px",
        maxWidth: "calc(100vw - 2rem)",
      }}
    >
      <div
        style={{
          backgroundColor: COLORS.WHITE,
          border: `1px solid ${COLORS.MORNING_MIST}`,
          borderRadius: BORDER_RADIUS.MEDIUM,
          boxShadow: SHADOWS.SUBTLE,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* Header */}
        <div
          style={{
            paddingLeft: SPACING.M,
            paddingRight: SPACING.M,
            paddingTop: SPACING.S,
            paddingBottom: SPACING.S,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: COLORS.MIDNIGHT_ASH,
            color: COLORS.WHITE,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: SPACING.M,
            }}
          >
            <svg
              style={{
                height: "20px",
                width: "20px",
              }}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 12h18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M3 6h18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.3"
              />
            </svg>
            <h4
              style={{
                fontSize: TYPOGRAPHY.SIZE_BODY,
                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
              }}
            >
              Messages
            </h4>
          </div>
          <div style={{ display: "flex", gap: SPACING.S }}>
            <button
              onClick={onClose}
              aria-label="Minimize"
              style={{
                color: COLORS.WHITE,
                fontSize: TYPOGRAPHY.SIZE_LABEL,
                paddingLeft: SPACING.S,
                paddingRight: SPACING.S,
                paddingTop: "4px",
                paddingBottom: "4px",
                borderRadius: BORDER_RADIUS.SMALL,
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                transition: "background-color 0.2s ease",
              }}
              className="hover:bg-midnight-ash-700"
            >
              _
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                color: COLORS.WHITE,
                fontSize: TYPOGRAPHY.SIZE_LABEL,
                paddingLeft: SPACING.S,
                paddingRight: SPACING.S,
                paddingTop: "4px",
                paddingBottom: "4px",
                borderRadius: BORDER_RADIUS.SMALL,
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                transition: "background-color 0.2s ease",
              }}
              className="hover:bg-midnight-ash-700"
            >
              ×
            </button>
          </div>
        </div>
        <div style={{ display: "flex", flex: 1 }}>
          {/* Left sidebar: 30% */}
          <div
            style={{
              width: "33.333%",
              borderRight: `1px solid ${COLORS.MORNING_MIST}20`,
              backgroundColor: COLORS.WHITE,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ padding: SPACING.M }}>
              <input
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
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
              />
            </div>
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
                {(filteredTx.length > 0 ? filteredTx : transactions).map(
                  (t) => (
                    <li
                      key={t.id}
                      onClick={() => setSelectedTxId(t.id)}
                      style={{
                        padding: SPACING.M,
                        cursor: "pointer",
                        backgroundColor:
                          selectedTxId === t.id
                            ? COLORS.SOFT_CLOUD
                            : COLORS.WHITE,
                        borderBottom: `1px solid ${COLORS.MORNING_MIST}20`,
                        transition: "background-color 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: SPACING.M,
                      }}
                      onMouseEnter={(e) => {
                        if (selectedTxId !== t.id) {
                          e.currentTarget.style.backgroundColor =
                            COLORS.SOFT_CLOUD + "50";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedTxId !== t.id) {
                          e.currentTarget.style.backgroundColor = COLORS.WHITE;
                        }
                      }}
                    >
                      <div
                        style={{
                          height: "40px",
                          width: "40px",
                          borderRadius: "50%",
                          backgroundColor: COLORS.MIDNIGHT_ASH,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: TYPOGRAPHY.SIZE_LABEL_LARGE,
                          fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                          color: COLORS.WHITE,
                          flexShrink: 0,
                        }}
                      >
                        {initials(t.title || t.buyerId)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "4px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: TYPOGRAPHY.SIZE_BODY,
                              fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                              color: COLORS.MIDNIGHT_ASH,
                            }}
                          >
                            {t.title || `Tx #${t.id}`}
                          </div>
                          <div
                            style={{
                              fontSize: TYPOGRAPHY.SIZE_LABEL,
                              color: COLORS.PEBBLE,
                            }}
                          >
                            {t.unread || 0}
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: TYPOGRAPHY.SIZE_LABEL,
                            color: COLORS.PEBBLE,
                          }}
                        >
                          {t.title || `Order #${t.id?.slice(0, 8) || "N/A"}`}
                        </div>
                      </div>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
          {/* Right chat area: 70% */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              backgroundColor: COLORS.WHISPER,
            }}
          >
            {/* Product snippet banner if productContext */}
            {productContext && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: SPACING.M,
                  padding: SPACING.M,
                  backgroundColor: COLORS.WHITE,
                  borderBottom: `1px solid ${COLORS.MORNING_MIST}20`,
                }}
              >
                <img
                  src={productContext.image}
                  alt={productContext.name}
                  style={{
                    height: "48px",
                    width: "48px",
                    borderRadius: BORDER_RADIUS.SMALL,
                    objectFit: "cover",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_BODY,
                      fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                      color: COLORS.MIDNIGHT_ASH,
                    }}
                  >
                    {productContext.name}
                  </div>
                  <div
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_LABEL,
                      color: COLORS.PEBBLE,
                    }}
                  >
                    {productContext.price}
                  </div>
                </div>
                <div>
                  <button
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      borderRadius: BORDER_RADIUS.FULL,
                      backgroundColor: COLORS.MIDNIGHT_ASH,
                      paddingLeft: SPACING.M,
                      paddingRight: SPACING.M,
                      paddingTop: "4px",
                      paddingBottom: "4px",
                      fontSize: TYPOGRAPHY.SIZE_BODY,
                      fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                      color: COLORS.WHITE,
                      border: "none",
                      cursor: "pointer",
                      transition: "opacity 0.2s ease",
                    }}
                    className="hover:opacity-90"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            )}
            <div
              ref={listRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: SPACING.M,
              }}
            >
              {!tx && (
                <div
                  style={{
                    fontSize: TYPOGRAPHY.SIZE_LABEL,
                    color: COLORS.PEBBLE,
                  }}
                >
                  Select a conversation on the left to view messages.
                </div>
              )}
              {tx && (
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
                  {tx.messages.map((m, idx) => {
                    const prev = tx.messages[idx - 1];
                    const showAvatar = !prev || prev.sender !== m.sender;
                    const mine = m.sender === userId;
                    return (
                      <li
                        key={m.id}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: SPACING.M,
                          justifyContent: mine ? "flex-end" : "flex-start",
                        }}
                      >
                        {!mine &&
                          (showAvatar ? (
                            <div style={{ flexShrink: 0 }}>
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
                                }}
                              >
                                {initials(m.sender)}
                              </div>
                            </div>
                          ) : (
                            <div style={{ width: "32px" }} />
                          ))}
                        <div
                          style={{
                            maxWidth: "75%",
                            textAlign: mine ? "right" : "left",
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
                              backgroundColor: mine
                                ? COLORS.SOFT_CLOUD
                                : COLORS.WHITE,
                              borderBottomRightRadius: mine
                                ? BORDER_RADIUS.SMALL
                                : BORDER_RADIUS.MEDIUM,
                              borderBottomLeftRadius: mine
                                ? BORDER_RADIUS.MEDIUM
                                : BORDER_RADIUS.SMALL,
                            }}
                          >
                            <div
                              style={{
                                fontSize: TYPOGRAPHY.SIZE_LABEL,
                                color: COLORS.PEBBLE,
                              }}
                            >
                              {!mine && (
                                <span
                                  style={{
                                    fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                                  }}
                                >
                                  {m.sender_name || m.sender}
                                </span>
                              )}
                              <span
                                style={{
                                  marginLeft: SPACING.S,
                                  fontSize: TYPOGRAPHY.SIZE_LABEL,
                                  color: COLORS.PEBBLE,
                                }}
                              >
                                {new Date(m.time).toLocaleString()}
                              </span>
                            </div>
                            <div
                              style={{
                                fontSize: TYPOGRAPHY.SIZE_BODY,
                                color: COLORS.MIDNIGHT_ASH,
                                marginTop: SPACING.S,
                              }}
                            >
                              {m.text}
                            </div>
                            {m.attachments && m.attachments.length > 0 && (
                              <div style={{ marginTop: SPACING.S }}>
                                {m.attachments.map((a, i) => (
                                  <a
                                    key={i}
                                    href={a.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                      fontSize: TYPOGRAPHY.SIZE_LABEL,
                                      color: COLORS.MIDNIGHT_ASH,
                                      display: "block",
                                      textDecoration: "none",
                                      transition: "opacity 0.2s ease",
                                    }}
                                    className="hover:opacity-75"
                                  >
                                    {a.name}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        {mine &&
                          (showAvatar ? (
                            <div style={{ flexShrink: 0 }}>
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
                                }}
                              >
                                {initials(m.sender)}
                              </div>
                            </div>
                          ) : (
                            <div style={{ width: "32px" }} />
                          ))}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div
              style={{
                paddingLeft: SPACING.M,
                paddingRight: SPACING.M,
                paddingTop: SPACING.M,
                paddingBottom: SPACING.M,
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
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  style={{
                    fontSize: TYPOGRAPHY.SIZE_LABEL,
                    border: `1px solid ${COLORS.MORNING_MIST}`,
                    borderRadius: BORDER_RADIUS.SMALL,
                    paddingLeft: SPACING.S,
                    paddingRight: SPACING.S,
                    paddingTop: "6px",
                    paddingBottom: "6px",
                    backgroundColor: COLORS.SOFT_CLOUD,
                    color: COLORS.MIDNIGHT_ASH,
                  }}
                />
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
                />
                <button
                  onClick={handleSend}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    paddingLeft: SPACING.M,
                    paddingRight: SPACING.M,
                    paddingTop: "8px",
                    paddingBottom: "8px",
                    backgroundColor: COLORS.MIDNIGHT_ASH,
                    color: COLORS.WHITE,
                    borderRadius: BORDER_RADIUS.SMALL,
                    border: "none",
                    cursor: "pointer",
                    fontSize: TYPOGRAPHY.SIZE_BODY,
                    fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                    transition: "opacity 0.2s ease",
                  }}
                  className="hover:opacity-90"
                >
                  Send
                </button>
              </div>
              {files.length > 0 && (
                <div
                  style={{
                    marginTop: SPACING.S,
                    fontSize: TYPOGRAPHY.SIZE_LABEL,
                    color: COLORS.PEBBLE,
                  }}
                >
                  Attachments: {files.map((f) => f.name).join(", ")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
