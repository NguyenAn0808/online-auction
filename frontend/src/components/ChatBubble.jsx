import React, { useEffect, useState } from "react";
import ChatBox from "./ChatBox";
import {
  getUnreadCount,
  listTransactions,
} from "../services/transactionService";

function getCurrentUser() {
  return localStorage.getItem("userId") || "buyer-1";
}

export default function ChatBubble() {
  const [open, setOpen] = useState(false);
  const [badge, setBadge] = useState(0);

  const userId = getCurrentUser();

  useEffect(() => {
    setBadge(getUnreadCount(userId));
    const iv = setInterval(() => setBadge(getUnreadCount(userId)), 3000);
    return () => clearInterval(iv);
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

  function handleClick() {
    if (!open) {
      // opening: if there are unread messages, open the first one
      const txId = findFirstUnreadTx();
      if (txId) {
        setOpen({ txId });
        // store badge update
        setTimeout(() => setBadge(getUnreadCount(userId)), 500);
        return;
      }
    }
    setOpen((s) => (s ? false : true));
  }

  return (
    <>
      <ChatBox
        open={!!open}
        onClose={() => setOpen(false)}
        openForTx={open && open.txId}
      />
      <button
        onClick={handleClick}
        aria-label="Open chat"
        className="fixed right-6 bottom-6 z-50 inline-flex items-center justify-center h-14 w-14 rounded-full bg-indigo-600 text-gray-700 shadow-lg"
      >
        <span>Chat</span>
        {badge > 0 && (
          <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs">
            {badge}
          </span>
        )}
      </button>
    </>
  );
}
