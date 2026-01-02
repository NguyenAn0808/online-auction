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

  // // Render ChatBox (parent handles conditional rendering)
  // return (
  //   <div
  //     ref={containerRef}
  //     style={{
  //       position: "fixed",
  //       right: SPACING.L,
  //       bottom: `calc(${SPACING.L} + 72px)`,
  //       zIndex: 9999,
  //       transform: "scale(1)",
  //       transformOrigin: "bottom right",
  //       transition: "opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
  //       width: "900px",
  //       height: "500px",
  //       maxWidth: "calc(100vw - 2rem)",
  //     }}
  //   >
  //     <div
  //       style={{
  //         backgroundColor: COLORS.WHITE,
  //         border: `1px solid ${COLORS.MORNING_MIST}`,
  //         borderRadius: BORDER_RADIUS.MEDIUM,
  //         boxShadow: SHADOWS.SUBTLE,
  //         overflow: "hidden",
  //         display: "flex",
  //         flexDirection: "column",
  //         height: "100%",
  //       }}
  //     >
  //       {/* Header */}
  //       <div
  //         style={{
  //           paddingLeft: SPACING.M,
  //           paddingRight: SPACING.M,
  //           paddingTop: SPACING.S,
  //           paddingBottom: SPACING.S,
  //           display: "flex",
  //           alignItems: "center",
  //           justifyContent: "space-between",
  //           backgroundColor: COLORS.MIDNIGHT_ASH,
  //           color: COLORS.WHITE,
  //         }}
  //       >
  //         <div
  //           style={{
  //             display: "flex",
  //             alignItems: "center",
  //             gap: SPACING.M,
  //           }}
  //         >
  //           <svg
  //             style={{
  //               height: "20px",
  //               width: "20px",
  //             }}
  //             viewBox="0 0 24 24"
  //             fill="none"
  //             xmlns="http://www.w3.org/2000/svg"
  //           >
  //             <path
  //               d="M3 12h18"
  //               stroke="currentColor"
  //               strokeWidth="2"
  //               strokeLinecap="round"
  //             />
  //             <path
  //               d="M3 6h18"
  //               stroke="currentColor"
  //               strokeWidth="2"
  //               strokeLinecap="round"
  //               opacity="0.3"
  //             />
  //           </svg>
  //           <h4
  //             style={{
  //               fontSize: TYPOGRAPHY.SIZE_BODY,
  //               fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
  //             }}
  //           >
  //             Messages
  //           </h4>
  //         </div>
  //         <div style={{ display: "flex", gap: SPACING.S }}>
  //           <button
  //             onClick={onClose}
  //             aria-label="Minimize"
  //             style={{
  //               color: COLORS.WHITE,
  //               fontSize: TYPOGRAPHY.SIZE_LABEL,
  //               paddingLeft: SPACING.S,
  //               paddingRight: SPACING.S,
  //               paddingTop: "4px",
  //               paddingBottom: "4px",
  //               borderRadius: BORDER_RADIUS.SMALL,
  //               backgroundColor: "transparent",
  //               border: "none",
  //               cursor: "pointer",
  //               transition: "background-color 0.2s ease",
  //             }}
  //             className="hover:bg-midnight-ash-700"
  //           >
  //             _
  //           </button>
  //           <button
  //             onClick={onClose}
  //             aria-label="Close"
  //             style={{
  //               color: COLORS.WHITE,
  //               fontSize: TYPOGRAPHY.SIZE_LABEL,
  //               paddingLeft: SPACING.S,
  //               paddingRight: SPACING.S,
  //               paddingTop: "4px",
  //               paddingBottom: "4px",
  //               borderRadius: BORDER_RADIUS.SMALL,
  //               backgroundColor: "transparent",
  //               border: "none",
  //               cursor: "pointer",
  //               transition: "background-color 0.2s ease",
  //             }}
  //             className="hover:bg-midnight-ash-700"
  //           >
  //             ×
  //           </button>
  //         </div>
  //       </div>
  //       <div style={{ display: "flex", flex: 1 }}>
  //         {/* Left sidebar: 30% */}
  //         <div
  //           style={{
  //             width: "33.333%",
  //             borderRight: `1px solid ${COLORS.MORNING_MIST}20`,
  //             backgroundColor: COLORS.WHITE,
  //             display: "flex",
  //             flexDirection: "column",
  //           }}
  //         >
  //           <div style={{ padding: SPACING.M }}>
  //             <input
  //               placeholder="Search by name..."
  //               value={search}
  //               onChange={(e) => setSearch(e.target.value)}
  //               style={{
  //                 width: "100%",
  //                 borderRadius: BORDER_RADIUS.MEDIUM,
  //                 border: `1px solid ${COLORS.MORNING_MIST}`,
  //                 paddingLeft: SPACING.M,
  //                 paddingRight: SPACING.M,
  //                 paddingTop: "8px",
  //                 paddingBottom: "8px",
  //                 fontSize: TYPOGRAPHY.SIZE_BODY,
  //                 color: COLORS.MIDNIGHT_ASH,
  //                 backgroundColor: COLORS.WHITE,
  //                 transition: "border-color 0.2s ease",
  //               }}
  //               onFocus={(e) => {
  //                 e.target.style.borderColor = COLORS.MIDNIGHT_ASH;
  //               }}
  //               onBlur={(e) => {
  //                 e.target.style.borderColor = COLORS.MORNING_MIST;
  //               }}
  //             />
  //           </div>
  //           <div
  //             style={{
  //               flex: 1,
  //               overflowY: "auto",
  //             }}
  //           >
  //             <ul
  //               style={{
  //                 margin: 0,
  //                 padding: 0,
  //                 listStyle: "none",
  //                 borderTop: `1px solid ${COLORS.MORNING_MIST}20`,
  //               }}
  //             >
  //               {(filteredTx.length > 0 ? filteredTx : transactions).map(
  //                 (t) => (
  //                   <li
  //                     key={t.id}
  //                     onClick={() => setSelectedTxId(t.id)}
  //                     style={{
  //                       padding: SPACING.M,
  //                       cursor: "pointer",
  //                       backgroundColor:
  //                         selectedTxId === t.id
  //                           ? COLORS.SOFT_CLOUD
  //                           : COLORS.WHITE,
  //                       borderBottom: `1px solid ${COLORS.MORNING_MIST}20`,
  //                       transition: "background-color 0.2s ease",
  //                       display: "flex",
  //                       alignItems: "center",
  //                       gap: SPACING.M,
  //                     }}
  //                     onMouseEnter={(e) => {
  //                       if (selectedTxId !== t.id) {
  //                         e.currentTarget.style.backgroundColor =
  //                           COLORS.SOFT_CLOUD + "50";
  //                       }
  //                     }}
  //                     onMouseLeave={(e) => {
  //                       if (selectedTxId !== t.id) {
  //                         e.currentTarget.style.backgroundColor = COLORS.WHITE;
  //                       }
  //                     }}
  //                   >
  //                     <div
  //                       style={{
  //                         height: "40px",
  //                         width: "40px",
  //                         borderRadius: "50%",
  //                         backgroundColor: COLORS.MIDNIGHT_ASH,
  //                         display: "flex",
  //                         alignItems: "center",
  //                         justifyContent: "center",
  //                         fontSize: TYPOGRAPHY.SIZE_LABEL_LARGE,
  //                         fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
  //                         color: COLORS.WHITE,
  //                         flexShrink: 0,
  //                       }}
  //                     >
  //                       {initials(t.title || t.buyerId)}
  //                     </div>
  //                     <div style={{ flex: 1 }}>
  //                       <div
  //                         style={{
  //                           display: "flex",
  //                           alignItems: "center",
  //                           justifyContent: "space-between",
  //                           marginBottom: "4px",
  //                         }}
  //                       >
  //                         <div
  //                           style={{
  //                             fontSize: TYPOGRAPHY.SIZE_BODY,
  //                             fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
  //                             color: COLORS.MIDNIGHT_ASH,
  //                           }}
  //                         >
  //                           {t.title || `Tx #${t.id}`}
  //                         </div>
  //                         <div
  //                           style={{
  //                             fontSize: TYPOGRAPHY.SIZE_LABEL,
  //                             color: COLORS.PEBBLE,
  //                           }}
  //                         >
  //                           {t.unread || 0}
  //                         </div>
  //                       </div>
  //                       <div
  //                         style={{
  //                           fontSize: TYPOGRAPHY.SIZE_LABEL,
  //                           color: COLORS.PEBBLE,
  //                         }}
  //                       >
  //                         {t.title || `Order #${t.id?.slice(0, 8) || "N/A"}`}
  //                       </div>
  //                     </div>
  //                   </li>
  //                 )
  //               )}
  //             </ul>
  //           </div>
  //         </div>
  //         {/* Right chat area: 70% */}
  //         <div
  //           style={{
  //             flex: 1,
  //             display: "flex",
  //             flexDirection: "column",
  //             backgroundColor: COLORS.WHISPER,
  //           }}
  //         >
  //           {/* Product snippet banner if productContext */}
  //           {productContext && (
  //             <div
  //               style={{
  //                 display: "flex",
  //                 alignItems: "center",
  //                 gap: SPACING.M,
  //                 padding: SPACING.M,
  //                 backgroundColor: COLORS.WHITE,
  //                 borderBottom: `1px solid ${COLORS.MORNING_MIST}20`,
  //               }}
  //             >
  //               <img
  //                 src={productContext.image}
  //                 alt={productContext.name}
  //                 style={{
  //                   height: "48px",
  //                   width: "48px",
  //                   borderRadius: BORDER_RADIUS.SMALL,
  //                   objectFit: "cover",
  //                 }}
  //               />
  //               <div style={{ flex: 1 }}>
  //                 <div
  //                   style={{
  //                     fontSize: TYPOGRAPHY.SIZE_BODY,
  //                     fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
  //                     color: COLORS.MIDNIGHT_ASH,
  //                   }}
  //                 >
  //                   {productContext.name}
  //                 </div>
  //                 <div
  //                   style={{
  //                     fontSize: TYPOGRAPHY.SIZE_LABEL,
  //                     color: COLORS.PEBBLE,
  //                   }}
  //                 >
  //                   {productContext.price}
  //                 </div>
  //               </div>
  //               <div>
  //                 <button
  //                   style={{
  //                     display: "inline-flex",
  //                     alignItems: "center",
  //                     borderRadius: BORDER_RADIUS.FULL,
  //                     backgroundColor: COLORS.MIDNIGHT_ASH,
  //                     paddingLeft: SPACING.M,
  //                     paddingRight: SPACING.M,
  //                     paddingTop: "4px",
  //                     paddingBottom: "4px",
  //                     fontSize: TYPOGRAPHY.SIZE_BODY,
  //                     fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
  //                     color: COLORS.WHITE,
  //                     border: "none",
  //                     cursor: "pointer",
  //                     transition: "opacity 0.2s ease",
  //                   }}
  //                   className="hover:opacity-90"
  //                 >
  //                   Buy Now
  //                 </button>
  //               </div>
  //             </div>
  //           )}
  //           <div
  //             ref={listRef}
  //             style={{
  //               flex: 1,
  //               overflowY: "auto",
  //               padding: SPACING.M,
  //             }}
  //           >
  //             {!tx && (
  //               <div
  //                 style={{
  //                   fontSize: TYPOGRAPHY.SIZE_LABEL,
  //                   color: COLORS.PEBBLE,
  //                 }}
  //               >
  //                 Select a conversation on the left to view messages.
  //               </div>
  //             )}
  //             {tx && (
  //               <ul
  //                 style={{
  //                   margin: 0,
  //                   padding: 0,
  //                   listStyle: "none",
  //                   display: "flex",
  //                   flexDirection: "column",
  //                   gap: SPACING.M,
  //                 }}
  //               >
  //                 {tx.messages.map((m, idx) => {
  //                   const prev = tx.messages[idx - 1];
  //                   const showAvatar = !prev || prev.sender !== m.sender;
  //                   const mine = m.sender === userId;
  //                   return (
  //                     <li
  //                       key={m.id}
  //                       style={{
  //                         display: "flex",
  //                         alignItems: "flex-start",
  //                         gap: SPACING.M,
  //                         justifyContent: mine ? "flex-end" : "flex-start",
  //                       }}
  //                     >
  //                       {!mine &&
  //                         (showAvatar ? (
  //                           <div style={{ flexShrink: 0 }}>
  //                             <div
  //                               style={{
  //                                 height: "32px",
  //                                 width: "32px",
  //                                 borderRadius: "50%",
  //                                 backgroundColor: COLORS.MIDNIGHT_ASH,
  //                                 display: "flex",
  //                                 alignItems: "center",
  //                                 justifyContent: "center",
  //                                 fontSize: TYPOGRAPHY.SIZE_LABEL,
  //                                 fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
  //                                 color: COLORS.WHITE,
  //                               }}
  //                             >
  //                               {initials(m.sender)}
  //                             </div>
  //                           </div>
  //                         ) : (
  //                           <div style={{ width: "32px" }} />
  //                         ))}
  //                       <div
  //                         style={{
  //                           maxWidth: "75%",
  //                           textAlign: mine ? "right" : "left",
  //                         }}
  //                       >
  //                         <div
  //                           style={{
  //                             display: "inline-block",
  //                             paddingLeft: SPACING.M,
  //                             paddingRight: SPACING.M,
  //                             paddingTop: SPACING.S,
  //                             paddingBottom: SPACING.S,
  //                             borderRadius: BORDER_RADIUS.MEDIUM,
  //                             boxShadow: SHADOWS.SUBTLE,
  //                             backgroundColor: mine
  //                               ? COLORS.SOFT_CLOUD
  //                               : COLORS.WHITE,
  //                             borderBottomRightRadius: mine
  //                               ? BORDER_RADIUS.SMALL
  //                               : BORDER_RADIUS.MEDIUM,
  //                             borderBottomLeftRadius: mine
  //                               ? BORDER_RADIUS.MEDIUM
  //                               : BORDER_RADIUS.SMALL,
  //                           }}
  //                         >
  //                           <div
  //                             style={{
  //                               fontSize: TYPOGRAPHY.SIZE_LABEL,
  //                               color: COLORS.PEBBLE,
  //                             }}
  //                           >
  //                             {!mine && (
  //                               <span
  //                                 style={{
  //                                   fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
  //                                 }}
  //                               >
  //                                 {m.sender_name || m.sender}
  //                               </span>
  //                             )}
  //                             <span
  //                               style={{
  //                                 marginLeft: SPACING.S,
  //                                 fontSize: TYPOGRAPHY.SIZE_LABEL,
  //                                 color: COLORS.PEBBLE,
  //                               }}
  //                             >
  //                               {new Date(m.time).toLocaleString()}
  //                             </span>
  //                           </div>
  //                           <div
  //                             style={{
  //                               fontSize: TYPOGRAPHY.SIZE_BODY,
  //                               color: COLORS.MIDNIGHT_ASH,
  //                               marginTop: SPACING.S,
  //                             }}
  //                           >
  //                             {m.text}
  //                           </div>
  //                           {m.attachments && m.attachments.length > 0 && (
  //                             <div style={{ marginTop: SPACING.S }}>
  //                               {m.attachments.map((a, i) => (
  //                                 <a
  //                                   key={i}
  //                                   href={a.url}
  //                                   target="_blank"
  //                                   rel="noreferrer"
  //                                   style={{
  //                                     fontSize: TYPOGRAPHY.SIZE_LABEL,
  //                                     color: COLORS.MIDNIGHT_ASH,
  //                                     display: "block",
  //                                     textDecoration: "none",
  //                                     transition: "opacity 0.2s ease",
  //                                   }}
  //                                   className="hover:opacity-75"
  //                                 >
  //                                   {a.name}
  //                                 </a>
  //                               ))}
  //                             </div>
  //                           )}
  //                         </div>
  //                       </div>
  //                       {mine &&
  //                         (showAvatar ? (
  //                           <div style={{ flexShrink: 0 }}>
  //                             <div
  //                               style={{
  //                                 height: "32px",
  //                                 width: "32px",
  //                                 borderRadius: "50%",
  //                                 backgroundColor: COLORS.MIDNIGHT_ASH,
  //                                 display: "flex",
  //                                 alignItems: "center",
  //                                 justifyContent: "center",
  //                                 fontSize: TYPOGRAPHY.SIZE_LABEL,
  //                                 fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
  //                                 color: COLORS.WHITE,
  //                               }}
  //                             >
  //                               {initials(m.sender)}
  //                             </div>
  //                           </div>
  //                         ) : (
  //                           <div style={{ width: "32px" }} />
  //                         ))}
  //                     </li>
  //                   );
  //                 })}
  //               </ul>
  //             )}
  //           </div>
  //           <div
  //             style={{
  //               paddingLeft: SPACING.M,
  //               paddingRight: SPACING.M,
  //               paddingTop: SPACING.M,
  //               paddingBottom: SPACING.M,
  //               borderTop: `1px solid ${COLORS.MORNING_MIST}`,
  //               backgroundColor: COLORS.WHITE,
  //             }}
  //           >
  //             <div
  //               style={{
  //                 display: "flex",
  //                 gap: SPACING.S,
  //                 alignItems: "center",
  //               }}
  //             >
  //               <input
  //                 type="file"
  //                 multiple
  //                 onChange={handleFileChange}
  //                 style={{
  //                   fontSize: TYPOGRAPHY.SIZE_LABEL,
  //                   border: `1px solid ${COLORS.MORNING_MIST}`,
  //                   borderRadius: BORDER_RADIUS.SMALL,
  //                   paddingLeft: SPACING.S,
  //                   paddingRight: SPACING.S,
  //                   paddingTop: "6px",
  //                   paddingBottom: "6px",
  //                   backgroundColor: COLORS.SOFT_CLOUD,
  //                   color: COLORS.MIDNIGHT_ASH,
  //                 }}
  //               />
  //               <input
  //                 value={text}
  //                 onChange={(e) => setText(e.target.value)}
  //                 placeholder="Write a message..."
  //                 style={{
  //                   flex: 1,
  //                   borderRadius: BORDER_RADIUS.MEDIUM,
  //                   border: `1px solid ${COLORS.MORNING_MIST}`,
  //                   paddingLeft: SPACING.M,
  //                   paddingRight: SPACING.M,
  //                   paddingTop: "8px",
  //                   paddingBottom: "8px",
  //                   fontSize: TYPOGRAPHY.SIZE_BODY,
  //                   color: COLORS.MIDNIGHT_ASH,
  //                   backgroundColor: COLORS.WHITE,
  //                   transition: "border-color 0.2s ease",
  //                 }}
  //                 onFocus={(e) => {
  //                   e.target.style.borderColor = COLORS.MIDNIGHT_ASH;
  //                 }}
  //                 onBlur={(e) => {
  //                   e.target.style.borderColor = COLORS.MORNING_MIST;
  //                 }}
  //               />
  //               <button
  //                 onClick={handleSend}
  //                 style={{
  //                   display: "inline-flex",
  //                   alignItems: "center",
  //                   paddingLeft: SPACING.M,
  //                   paddingRight: SPACING.M,
  //                   paddingTop: "8px",
  //                   paddingBottom: "8px",
  //                   backgroundColor: COLORS.MIDNIGHT_ASH,
  //                   color: COLORS.WHITE,
  //                   borderRadius: BORDER_RADIUS.SMALL,
  //                   border: "none",
  //                   cursor: "pointer",
  //                   fontSize: TYPOGRAPHY.SIZE_BODY,
  //                   fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
  //                   transition: "opacity 0.2s ease",
  //                 }}
  //                 className="hover:opacity-90"
  //               >
  //                 Send
  //               </button>
  //             </div>
  //             {files.length > 0 && (
  //               <div
  //                 style={{
  //                   marginTop: SPACING.S,
  //                   fontSize: TYPOGRAPHY.SIZE_LABEL,
  //                   color: COLORS.PEBBLE,
  //                 }}
  //               >
  //                 Attachments: {files.map((f) => f.name).join(", ")}
  //               </div>
  //             )}
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
  return (
    <div
      ref={containerRef}
      className="fixed right-6 bottom-[calc(72px+1.5rem)] z-[9999] scale-100 origin-bottom-right transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] w-[800px] h-[600px] max-w-[calc(100vw-2rem)] max-h-[90vh] lg:w-[800px] lg:h-[600px]"
    >
      <div className="bg-white border border-[#B3BFB9]/50 rounded-t-lg shadow-2xl overflow-hidden flex flex-col h-full">
        {/* Header */}
        <div className="px-4 py-2 bg-[#1F1F1F] text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <svg
              className="h-5 w-5"
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
            <h4 className="text-base font-semibold">Messages</h4>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              aria-label="Minimize"
              className="text-white text-xs px-2 py-1 rounded-md bg-transparent border-none cursor-pointer hover:bg-white/20 transition-colors"
            >
              _
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-white text-xs px-2 py-1 rounded-md bg-transparent border-none cursor-pointer hover:bg-white/20 transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex h-full">
          {/* Sidebar - Transaction List (30%) */}
          <div className="w-80 lg:w-80 border-r border-[#B3BFB9]/20 bg-white flex flex-col">
            {/* Search */}
            <div className="p-4">
              <input
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-[#B3BFB9] px-4 py-2 text-sm text-[#1F1F1F] bg-white focus:outline-none focus:border-[#1F1F1F] focus:ring-1 focus:ring-[#1F1F1F]/10 transition-all"
              />
            </div>

            {/* Transactions List */}
            <div className="flex-1 overflow-y-auto">
              <ul className="m-0 p-0 list-none border-t border-[#B3BFB9]/20">
                {filteredTx.length === 0 ? (
                  <li className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-[#F0EEE6] rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-[#938A83]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <p className="text-xs text-[#938A83] font-medium">
                      No conversations found
                    </p>
                  </li>
                ) : (
                  filteredTx.map((t) => {
                    const initials =
                      t.title || (t.buyerId === userId ? "You" : "TX");
                    const isActive = selectedTxId === t.id;
                    const status = t.status || "Pending"; // Assuming status exists or derive from order
                    return (
                      <li
                        key={t.id}
                        onClick={() => setSelectedTxId(t.id)}
                        className={`p-4 cursor-pointer transition-all duration-200 border-b border-[#B3BFB9]/20 flex items-center gap-3 hover:bg-[#F0EEE6]/50 ${
                          isActive
                            ? "bg-[#F0EEE6] border-l-4 border-[#1F1F1F] shadow-sm"
                            : ""
                        }`}
                      >
                        {/* Product Image Placeholder - replace with actual product image when available */}
                        <div className="w-12 h-12 bg-[#F8F6F0] rounded-md flex items-center justify-center flex-shrink-0">
                          <div className="w-8 h-8 bg-[#938A83]/20 rounded flex items-center justify-center">
                            <span className="text-xs font-semibold text-[#938A83]">
                              {initials.charAt(0)}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="text-sm font-semibold text-[#1F1F1F] truncate max-w-[180px]">
                              {t.title || `Order ${t.id?.slice(0, 8)} || NA`}
                            </h5>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                status === "Shipped"
                                  ? "bg-green-100 text-green-800"
                                  : status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {status}
                            </span>
                          </div>
                          <p
                            className={`text-xs ${
                              t.unread > 0
                                ? "font-semibold text-[#1F1F1F]"
                                : "text-[#938A83]"
                            }`}
                          >
                            {t.unread > 0 && `${t.unread} new`}
                          </p>
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          </div>

          {/* Chat Area (70%) */}
          <div className="flex-1 flex flex-col bg-[#F8F6F0]">
            {/* Sticky Context Header */}
            {tx && (
              <div className="sticky top-0 z-10 bg-white border-b border-[#B3BFB9]/20 p-4 flex items-center gap-4">
                {/* Product Context */}
                <div className="w-12 h-12 bg-[#F8F6F0] rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {productContext?.image ? (
                    <img
                      src={productContext.image}
                      alt={productContext.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-[#938A83]">📦</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-semibold text-[#1F1F1F] truncate">
                    {productContext?.name || "Order Discussion"}
                  </h5>
                  <p className="text-xs text-[#938A83]">
                    {productContext?.price || "$0.00"}
                  </p>
                </div>
                <a
                  href={`/transactions/${tx.id}`}
                  className="text-xs font-semibold text-[#1F1F1F] hover:text-[#1F1F1F]/80 underline decoration-dotted transition-colors"
                >
                  View Order →
                </a>
              </div>
            )}

            {/* Messages Area */}
            <div ref={listRef} className="flex-1 overflow-y-auto p-6">
              {!tx ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 bg-white/50 rounded-2xl p-4 shadow-lg">
                    <svg
                      className="w-12 h-12 text-[#938A83]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-[#1F1F1F] mb-2">
                    Select a conversation
                  </h4>
                  <p className="text-sm text-[#938A83]">
                    Choose a chat from the left sidebar to start messaging
                  </p>
                </div>
              ) : loadingMessages ? (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F1F1F]"></div>
                  <p className="mt-2 text-sm text-[#938A83]">
                    Loading messages...
                  </p>
                </div>
              ) : (
                <ul className="m-0 p-0 list-none space-y-4">
                  {tx.messages.map((m, idx) => {
                    const prev = tx.messages[idx - 1];
                    const showAvatar = !prev || prev.sender !== m.sender;
                    const mine = m.sender === userId;
                    const timeStr = new Date(m.time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <li
                        key={m.id}
                        className={`flex ${
                          mine ? "justify-end" : "justify-start"
                        } items-start gap-3`}
                      >
                        {!mine && showAvatar && (
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-[#1F1F1F] flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-semibold text-white">
                                {initials(m.sendername || m.sender)}
                              </span>
                            </div>
                          </div>
                        )}

                        <div
                          className={`max-w-[75%] ${mine ? "text-right" : ""}`}
                        >
                          <div
                            className={`inline-block px-4 py-2 rounded-lg shadow-sm ${
                              mine
                                ? "bg-[#938A83] text-white rounded-br-none"
                                : "bg-white rounded-bl-none border border-[#B3BFB9]/30"
                            }`}
                          >
                            {!mine && (
                              <div className="flex items-baseline justify-between mb-1">
                                <span className="font-semibold text-sm">
                                  {m.sendername || m.sender}
                                </span>
                                <span className="ml-2 text-xs opacity-75">
                                  {timeStr}
                                </span>
                              </div>
                            )}
                            <div className="text-sm leading-relaxed whitespace-pre-wrap">
                              {m.text}
                            </div>
                            {mine && (
                              <div className="text-xs opacity-75 mt-1 text-right">
                                {timeStr}
                              </div>
                            )}
                          </div>

                          {m.attachments && m.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {m.attachments.map((a, i) => (
                                <a
                                  key={i}
                                  href={a.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block text-xs text-[#1F1F1F] hover:opacity-75 transition-opacity p-2 -m-2 rounded hover:bg-white"
                                >
                                  📎 {a.name}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>

                        {mine && showAvatar && (
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-[#1F1F1F] flex items-center justify-center">
                              <span className="text-xs font-semibold text-white">
                                {initials(m.sendername || m.sender)}
                              </span>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 pt-0 border-t border-[#B3BFB9]/20 bg-white">
              <div className="flex items-end gap-2">
                {/* File Attachment */}
                <label className="p-2 border border-[#B3BFB9]/50 rounded-full bg-[#F0EEE6] cursor-pointer hover:bg-[#F0EEE6]/75 transition-colors">
                  <svg
                    className="w-4 h-4 text-[#938A83]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>

                {/* Message Input */}
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write a message..."
                  className="flex-1 rounded-full border border-[#B3BFB9]/50 px-5 py-3 text-sm bg-white focus:outline-none focus:border-[#1F1F1F] focus:ring-1 focus:ring-[#1F1F1F]/10 transition-all resize-none"
                  disabled={!tx}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />

                {/* Send Button */}
                <button
                  onClick={handleSend}
                  disabled={!tx || !text.trim()}
                  className={`flex items-center gap-1 px-4 py-3 rounded-full font-semibold text-sm transition-all ${
                    !tx || !text.trim()
                      ? "text-[#938A83] bg-[#F8F6F0] cursor-not-allowed"
                      : "bg-[#1F1F1F] text-white hover:opacity-90"
                  }`}
                >
                  <svg
                    className={`w-4 h-4 ${
                      !tx || !text.trim() ? "opacity-50" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  Send
                </button>
              </div>

              {/* Files Preview */}
              {files.length > 0 && (
                <div className="mt-2 p-2 bg-[#F0EEE6]/50 rounded-md">
                  <p className="text-xs text-[#938A83]">
                    Attachments: {files.map((f) => f.name).join(", ")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
