import React, { useEffect, useMemo, useState } from "react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

function formatTime(t) {
  try {
    const d = new Date(t);
    return d.toLocaleString();
  } catch (e) {
    return String(t);
  }
}

const sampleMessages = [
  {
    id: "m1",
    sender: "Alice",
    text: "Hi — is this item still available?",
    time: Date.now() - 1000 * 60 * 30,
    read: false,
  },
  {
    id: "m2",
    sender: "Seller Support",
    text: "Yes — we can ship internationally.",
    time: Date.now() - 1000 * 60 * 60 * 5,
    read: true,
  },
  {
    id: "m3",
    sender: "Bob",
    text: "Can you provide more photos of the scratches?",
    time: Date.now() - 1000 * 60 * 60 * 24,
    read: false,
  },
];

export default function MessagesList({
  messages: propsMessages,
  selectedIds = [],
  onSelectMessage,
  onMarkRead,
  onToggleSelect,
}) {
  const [messages, setMessages] = useState(propsMessages || sampleMessages);
  const [selected, setSelected] = useState(() => new Set(selectedIds || []));

  useEffect(() => {
    if (propsMessages) setMessages(propsMessages);
  }, [propsMessages]);

  useEffect(() => {
    setSelected(new Set(selectedIds || []));
  }, [selectedIds]);

  const unreadCount = useMemo(
    () => messages.filter((m) => !m.read).length,
    [messages]
  );

  function toggleSelect(id) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
    if (onToggleSelect) onToggleSelect(id, next.has(id));
  }

  function markRead(id, read = true) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read } : m)));
    if (onMarkRead) onMarkRead(id, read);
  }

  function handleSelectMessage(id) {
    if (onSelectMessage) onSelectMessage(id);
  }

  function toggleSelectAll() {
    if (selected.size === messages.length) {
      setSelected(new Set());
      messages.forEach((m) => onToggleSelect && onToggleSelect(m.id, false));
    } else {
      const all = new Set(messages.map((m) => m.id));
      setSelected(all);
      messages.forEach((m) => onToggleSelect && onToggleSelect(m.id, true));
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            {selected.size === messages.length ? "Unselect all" : "Select all"}
          </button>
          <span className="text-sm text-gray-500">{unreadCount} unread</span>
        </div>
        <div className="text-sm text-gray-400">Actions</div>
      </div>

      <ul role="list" className="divide-y divide-gray-100">
        {messages.map((msg) => (
          <li key={msg.id} className="py-3">
            <div className="flex items-start gap-3">
              <div className="shrink-0 pt-1">
                <input
                  type="checkbox"
                  checked={selected.has(msg.id)}
                  onChange={() => toggleSelect(msg.id)}
                  aria-label={`Select message ${msg.id}`}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
              </div>

              <div
                className={`min-w-0 flex-1 ${
                  msg.read ? "text-gray-600" : "text-gray-900"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleSelectMessage(msg.id)}
                  className="text-left w-full"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{msg.sender}</p>
                      <p className="mt-1 text-sm text-gray-500 truncate">
                        {msg.text}
                      </p>
                    </div>
                    <div className="ml-4 shrink-0 text-right">
                      <p className="text-xs text-gray-400">
                        {formatTime(msg.time)}
                      </p>
                    </div>
                  </div>
                </button>

                <div className="mt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => markRead(msg.id, !msg.read)}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    {msg.read ? "Mark unread" : "Mark read"}
                  </button>
                  <button
                    type="button"
                    onClick={() => alert(`Reply to ${msg.sender}`)}
                    className="text-xs text-gray-500 hover:underline"
                  >
                    Reply
                  </button>
                </div>
              </div>

              <div className="shrink-0 self-center">
                <ChevronRightIcon
                  className="h-5 w-5 text-gray-300"
                  aria-hidden
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
