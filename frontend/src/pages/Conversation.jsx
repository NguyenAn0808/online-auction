import React from "react";
import Header from "../components/Header";
import Tabs from "../components/Tabs";
import Sidebar from "../components/Sidebar";
import MessagesList from "../components/MessagesListImpl";

const dummyThreads = [
  {
    id: "thread-1",
    title: "Order #12345 — Shipping question",
    meta: "2 hours ago · 3 messages",
  },
  {
    id: "thread-2",
    title: "Question about item condition",
    meta: "Yesterday · 5 messages",
  },
  {
    id: "thread-3",
    title: "Offer negotiation — Item 987",
    meta: "3 days ago · 2 messages",
  },
  {
    id: "thread-4",
    title: "General support inquiry",
    meta: "Apr 2 · 7 messages",
  },
];

export default function Conversation() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs />

          <div className="mt-6 grid grid-cols-12 gap-6">
            {/* Sidebar */}
            <aside className="col-span-12 lg:col-span-3">
              <div className="sticky top-20">
                <Sidebar />
              </div>
            </aside>

            {/* Main content: stacked conversation cards */}
            <main className="col-span-12 lg:col-span-9">
              <div
                className="space-y-6"
                style={{ maxHeight: "calc(100vh - 180px)", overflowY: "auto" }}
              >
                {dummyThreads.map((thread) => (
                  <section
                    key={thread.id}
                    className="bg-white shadow-sm rounded-lg border border-gray-100"
                  >
                    <header className="px-4 py-3 border-b border-gray-100 flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          {thread.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {thread.meta}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400">Manage</div>
                    </header>

                    <div className="p-4">
                      {/* Each MessagesList represents a conversation thread. The component
                          is expected to render a list of messages and provide basic actions
                          (read, mark as read, select). We pass no props here to keep the
                          example compatible with the existing usage; adapt to the
                          MessagesList API if it accepts props like `messages` or callbacks. */}
                      <MessagesList />
                    </div>
                  </section>
                ))}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
