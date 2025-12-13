import React, { useEffect, useState } from "react";
import ChatBox from "./ChatBox";
import {
  getUnreadCount,
  listTransactions,
} from "../services/transactionService";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/designSystem";

function getCurrentUser() {
  return localStorage.getItem("userId") || "buyer-1";
}

export default function ChatBubble() {
  // open state for ChatBox visibility
  const [open, setOpen] = useState(true);
  const [txId, setTxId] = useState(null);
  const [badge, setBadge] = useState(0);
  const [contextProduct, setContextProduct] = useState(null);

  const userId = getCurrentUser();

  // Update badge count periodically
  useEffect(() => {
    setBadge(getUnreadCount(userId));
    const iv = setInterval(() => setBadge(getUnreadCount(userId)), 3000);
    return () => clearInterval(iv);
  }, [userId]);

  useEffect(() => {
    // expose a global helper for other components to open chat with product context
    window.openChat = (payload = {}) => {
      // payload: { product, txId }
      const { product, txId: openTxId } = payload;
      setContextProduct(product || null);
      setTxId(openTxId || null);
      setOpen(true);
    };

    function onOpenChatEvent(e) {
      const { product, txId: openTxId } = e.detail || {};
      setContextProduct(product || null);
      setTxId(openTxId || null);
      setOpen(true);
    }

    window.addEventListener("openChat", onOpenChatEvent);
    return () => window.removeEventListener("openChat", onOpenChatEvent);
  }, []);

  function findFirstUnreadTx() {
    const txs = listTransactions();
    for (const tx of txs) {
      const last = (tx.lastReadAt && tx.lastReadAt[userId]) || 0;
      const newMsgs = tx.messages.filter(
        (m) => m.time && m.time > last && m.sender !== userId
      );
      if (newMsgs.length > 0) return tx.id;
    }
    return null;
  }

  function handleToggle() {
    if (!open) {
      // Opening: if there are unread messages, open the first one
      const unreadTxId = findFirstUnreadTx();
      if (unreadTxId) {
        setTxId(unreadTxId);
        setTimeout(() => setBadge(getUnreadCount(userId)), 500);
      }
    }
    setOpen((s) => !s);
  }

  return (
    <>
      <ChatBox
        open={open}
        onClose={() => setOpen(false)}
        openForTx={txId}
        contextProduct={contextProduct}
      />
      <button
        onClick={handleToggle}
        aria-label="Toggle messages panel"
        style={{
          position: "fixed",
          right: SPACING.L,
          bottom: SPACING.L,
          zIndex: 51,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          height: "56px",
          width: "56px",
          borderRadius: BORDER_RADIUS.FULL,
          backgroundColor: COLORS.MIDNIGHT_ASH,
          color: COLORS.WHITE,
          boxShadow: SHADOWS.LIGHT,
          border: "none",
          cursor: "pointer",
          transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <span
          style={{
            fontSize: TYPOGRAPHY.SIZE_BODY,
            fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
          }}
        >
          Chat
        </span>
        {badge > 0 && (
          <span
            style={{
              marginLeft: SPACING.S,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: "20px",
              width: "20px",
              borderRadius: BORDER_RADIUS.FULL,
              backgroundColor: "#EF4444",
              color: COLORS.WHITE,
              fontSize: TYPOGRAPHY.SIZE_LABEL,
              fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
            }}
          >
            {badge}
          </span>
        )}
      </button>
    </>
  );
}
