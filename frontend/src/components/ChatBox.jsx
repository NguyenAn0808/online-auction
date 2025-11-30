import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  listTransactions,
  getTransaction,
  addMessage,
  markMessagesRead,
} from "../services/transactionService";

function getCurrentUser() {
  return localStorage.getItem("userId") || "buyer-1";
}

function initials(name) {
  if (!name) return "?";
  return name.split("-")[0].slice(0, 1).toUpperCase();
}

export default function ChatBox({ open, onClose, openForTx }) {
  const location = useLocation();
  const [transactions, setTransactions] = useState([]);
  const [selectedTxId, setSelectedTxId] = useState(openForTx || null);
  const [tx, setTx] = useState(null);
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const userId = getCurrentUser();
  const listRef = useRef(null);

  useEffect(() => {
    setTransactions(listTransactions((t) => true));
  }, [open]);

  // auto-select tx from prop or query param `tx`
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const txParam = params.get("tx");
    if (openForTx) setSelectedTxId(openForTx);
    else if (txParam) setSelectedTxId(txParam);
  }, [location.search, openForTx]);

  useEffect(() => {
    if (selectedTxId) {
      setTx(getTransaction(selectedTxId));
      // mark messages as read for this user
      markMessagesRead(selectedTxId, userId);
    } else setTx(null);
  }, [selectedTxId]);

  useEffect(() => {
    // scroll to bottom when messages change
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [tx && tx.messages && tx.messages.length]);

  function handleSend() {
    if (!tx || (!text.trim() && files.length === 0)) return;
    const attachments = files.map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
    }));
    addMessage(tx.id, {
      sender: userId,
      text: text.trim(),
      time: Date.now(),
      attachments,
    });
    setTx(getTransaction(tx.id));
    setText("");
    setFiles([]);
    // mark read
    markMessagesRead(tx.id, userId);
  }

  function handleFileChange(e) {
    const list = Array.from(e.target.files || []);
    setFiles(list);
  }

  if (!open) return null;

  return (
    <div className="fixed right-6 bottom-20 z-50 w-96">
      <div className="bg-white border rounded-lg shadow-lg overflow-hidden flex flex-col h-96">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h4 className="text-sm font-medium">Chat</h4>
          <div className="flex items-center gap-2">
            <select
              value={selectedTxId || ""}
              onChange={(e) => setSelectedTxId(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="">Select transaction</option>
              {transactions.map((t) => (
                <option
                  key={t.id}
                  value={t.id}
                >{`#${t.id} — ${t.buyerId} / ${t.sellerId}`}</option>
              ))}
            </select>
            <button onClick={onClose} className="text-xs text-gray-500">
              Close
            </button>
          </div>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto p-3 bg-gray-50">
          {!tx && (
            <div className="text-xs text-gray-500">
              Select a transaction to view messages.
            </div>
          )}
          {tx && (
            <ul className="space-y-3">
              {tx.messages.map((m, idx) => {
                const prev = tx.messages[idx - 1];
                const showAvatar = !prev || prev.sender !== m.sender;
                const mine = m.sender === userId;
                return (
                  <li
                    key={m.id}
                    className={`flex items-start gap-3 ${
                      mine ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!mine &&
                      (showAvatar ? (
                        <div className="shrink-0">
                          <div className="h-8 w-8 rounded-full bg-indigo-200 flex items-center justify-center text-xs font-semibold text-indigo-800">
                            {initials(m.sender)}
                          </div>
                        </div>
                      ) : (
                        <div style={{ width: 32 }} />
                      ))}

                    <div
                      className={`max-w-[75%] ${
                        mine ? "text-right" : "text-left"
                      }`}
                    >
                      <div
                        className={`inline-block p-2 rounded-lg shadow-sm wrap-break-word ${
                          mine
                            ? "bg-indigo-100 rounded-br-none"
                            : "bg-white rounded-bl-none"
                        }`}
                      >
                        <div className="text-xs text-gray-500">
                          {!mine && (
                            <span className="font-medium">{m.sender}</span>
                          )}
                          <span className="ml-2 text-xs text-gray-400">
                            {new Date(m.time).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-900 mt-1">
                          {m.text}
                        </div>
                        {m.attachments && m.attachments.length > 0 && (
                          <div className="mt-2">
                            {m.attachments.map((a, i) => (
                              <a
                                key={i}
                                href={a.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-indigo-600 block"
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
                        <div className="shrink-0">
                          <div className="h-8 w-8 rounded-full bg-indigo-200 flex items-center justify-center text-xs font-semibold text-indigo-800">
                            {initials(m.sender)}
                          </div>
                        </div>
                      ) : (
                        <div style={{ width: 32 }} />
                      ))}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="p-3 border-t bg-white sticky bottom-0">
          <div className="flex gap-2 items-center">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="text-xs border rounded px-2 py-1 bg-gray-50"
            />
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a message..."
              className="flex-1 rounded-md border-gray-300 px-3 py-2"
            />
            <button
              onClick={handleSend}
              className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md"
            >
              Send
            </button>
          </div>
          {files.length > 0 && (
            <div className="mt-2 text-xs text-gray-600">
              Attachments: {files.map((f) => f.name).join(", ")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
