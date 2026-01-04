import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import productService from "../services/productService";
import userService from "../services/userService";
import { Pencil, Trash2, Check, X } from "lucide-react";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/designSystem";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import QA_API from "../services/qaService";
import { useToast } from "../context/ToastContext";

// Fallback for demo/dev: provide current user name from localStorage
const CURRENT_USER_NAME = (() => {
  try {
    return localStorage.getItem("userName") || null;
  } catch (e) {
    return null;
  }
})();

function maskName(fullName, userId, userData) {
  const nameToMask = userData?.fullName || userData?.full_name || fullName;
  if (!nameToMask) return "-";
  if (CURRENT_USER_NAME && nameToMask === CURRENT_USER_NAME) return "You";

  const nameWithoutSpaces = nameToMask.trim().replace(/\s+/g, "");
  if (nameWithoutSpaces.length < 3) {
    return "*".repeat(nameWithoutSpaces.length);
  }
  const last3 = nameWithoutSpaces.slice(-3);
  return "****" + last3;
}

export default function QuestionsHistory({ productId, product }) {
  const { user } = useAuth();
  const toast = useToast();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfoById, setUserInfoById] = useState({});

  // State for Asking
  const [questionText, setQuestionText] = useState("");
  const [sending, setSending] = useState(false);

  // State for Replying (Seller only)
  const [replyText, setReplyText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState(null); // Which question is being answered
  const [replying, setReplying] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [editText, setEditText] = useState("");

  // Permissions
  const isSeller = user && product && user.id === product.seller_id;

  useEffect(() => {
    fetchQuestions();
  }, [productId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await QA_API.getQuestions(productId);
      if (response.data.success) {
        const list = response.data.data;
        setQuestions(list);

        // Collect unique user IDs from questions and answers
        const ids = new Set();
        list.forEach((q) => {
          if (q.userId) ids.add(q.userId);
          if (Array.isArray(q.answers)) {
            q.answers.forEach((a) => {
              if (a.userId) ids.add(a.userId);
            });
          }
        });

        const infoMap = {};
        await Promise.all(
          Array.from(ids).map(async (id) => {
            try {
              const info = await userService.getUserById(id);
              infoMap[id] = info;
            } catch (err) {
              console.error("Failed to load user info", id, err);
              infoMap[id] = null;
            }
          })
        );
        setUserInfoById(infoMap);
      }
    } catch (err) {
      console.error("Failed to load questions", err);
    } finally {
      setLoading(false);
    }
  };

  // Ask question (Bidder)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    try {
      setSending(true);
      const response = await QA_API.askQuestion(productId, questionText);
      if (response.data.success) {
        setQuestionText("");
        fetchQuestions(); // Refresh list
      }
    } catch (err) {
      console.error("Failed to post question", err);
      if (err.response && err.response.status === 403) {
        toast.warning(
          "Permission Denied: You are using a Seller account. Only Bidders are allowed to ask questions."
        );
      } else {
        toast.error("Failed to post question. Please try again.");
      }
    } finally {
      setSending(false);
    }
  };

  // Answer question (Seller)
  const handleReplySubmit = async (questionId) => {
    if (!replyText.trim()) return;

    try {
      setReplying(true);
      const response = await QA_API.replyToQuestion(questionId, replyText);
      if (response.data.success) {
        setReplyText("");
        setActiveReplyId(null);
        fetchQuestions();
      }
    } catch (err) {
      console.error("Failed to post reply", err);
      toast.error("Failed to post reply.");
    } finally {
      setReplying(false);
    }
  };

  // --- DELETE ACTIONS ---
  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`))
      return;
    try {
      if (type === "question") {
        await QA_API.deleteQuestion(id);
      } else {
        await QA_API.deleteAnswer(id);
      }
      fetchQuestions();
    } catch (err) {
      toast.error(`Failed to delete ${type}.`);
    }
  };

  // --- EDIT ACTIONS ---
  const startEditing = (type, id, currentText) => {
    setEditingItem({ type, id });
    setEditText(currentText);
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditText("");
  };

  const saveEdit = async () => {
    if (!editText.trim()) return;
    try {
      if (editingItem.type === "question") {
        await QA_API.updateQuestion(editingItem.id, editText);
      } else {
        await QA_API.updateAnswer(editingItem.id, editText);
      }
      setEditingItem(null);
      setEditText("");
      fetchQuestions();
    } catch (err) {
      toast.error("Failed to update.");
    }
  };
  const isMyContent = (ownerId) => user && user.id === ownerId;
  if (loading) return <div style={{ padding: SPACING.L }}>Loading Q&A...</div>;
  return (
    <>
      <h2
        style={{
          fontSize: TYPOGRAPHY.SIZE_HEADING_SM,
          fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
          color: COLORS.MIDNIGHT_ASH,
          letterSpacing: "-0.02em",
        }}
      >
        Questions & Answers
      </h2>

      {/* ASK FORM */}
      {!isSeller && (
        <form
          onSubmit={handleSubmit}
          style={{ marginBottom: SPACING.L }}
          noValidate
        >
          <label
            style={{
              fontSize: TYPOGRAPHY.SIZE_LABEL,
              fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
              color: COLORS.MIDNIGHT_ASH,
            }}
          >
            Ask a question
          </label>
          <div
            style={{
              marginTop: SPACING.S,
              display: "flex",
              flexDirection: "column",
              gap: SPACING.S,
            }}
          >
            {user ? (
              <>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%",
                    borderRadius: BORDER_RADIUS.MEDIUM,
                    border: `1px solid ${COLORS.MORNING_MIST}`,
                    padding: SPACING.M,
                    fontSize: TYPOGRAPHY.SIZE_BODY,
                    color: COLORS.MIDNIGHT_ASH,
                    fontFamily: "inherit",
                    backgroundColor: COLORS.WHITE,
                    outline: "none",
                  }}
                  placeholder="Ask the seller about condition, shipping, or other details"
                />
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="submit"
                    disabled={sending || !questionText.trim()}
                    style={{
                      borderRadius: BORDER_RADIUS.FULL,
                      backgroundColor: COLORS.MIDNIGHT_ASH,
                      padding: `${SPACING.XS} ${SPACING.M}`,
                      fontSize: TYPOGRAPHY.SIZE_LABEL,
                      color: COLORS.WHITE,
                      fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                      border: "none",
                      cursor:
                        sending || !questionText.trim()
                          ? "not-allowed"
                          : "pointer",
                      opacity: sending || !questionText.trim() ? 0.5 : 1,
                    }}
                  >
                    {sending ? "Sending..." : "Submit question"}
                  </button>
                </div>
              </>
            ) : (
              <div
                style={{
                  padding: SPACING.M,
                  backgroundColor: COLORS.SOFT_CLOUD,
                  borderRadius: BORDER_RADIUS.MEDIUM,
                  color: COLORS.MIDNIGHT_ASH,
                }}
              >
                Please{" "}
                <Link to="/auth/signin" style={{ color: COLORS.PRIMARY }}>
                  Sign In
                </Link>{" "}
                to ask questions.
              </div>
            )}
          </div>
        </form>
      )}

      {/* QUESTIONS LIST */}
      <div
        style={{
          marginTop: SPACING.L,
          borderTop: `1px solid ${COLORS.MORNING_MIST}`,
        }}
      >
        {questions.length === 0 ? (
          <p style={{ padding: SPACING.L, color: COLORS.PEBBLE }}>
            No questions yet.
          </p>
        ) : (
          questions.map((item) => (
            <div
              key={item.id}
              style={{ paddingTop: SPACING.L, paddingBottom: SPACING.L }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: SPACING.M,
                }}
              >
                {/* Avatar */}
                <div style={{ flexShrink: 0 }}>
                  <div
                    style={{
                      height: "32px",
                      width: "32px",
                      borderRadius: "50%",
                      backgroundColor: COLORS.SOFT_CLOUD,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: TYPOGRAPHY.SIZE_LABEL,
                      fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                      color: COLORS.MIDNIGHT_ASH,
                    }}
                  >
                    B
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  {/* QUESTION HEADER */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center", // Canh giữa theo chiều dọc
                      flexWrap: "wrap", // Cho phép xuống dòng nếu màn hình nhỏ
                      gap: SPACING.S, // Khoảng cách giữa các phần tử
                    }}
                  >
                    <span
                      style={{
                        fontSize: TYPOGRAPHY.SIZE_LABEL,
                        fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                        color: COLORS.MIDNIGHT_ASH,
                      }}
                    >
                      {item.userId === product?.seller_id
                        ? userInfoById[item.userId]?.fullName ||
                          userInfoById[item.userId]?.full_name ||
                          item.askerName ||
                          "Seller"
                        : maskName(
                            item.askerName || "Bidder",
                            item.userId,
                            userInfoById[item.userId]
                          )}
                    </span>

                    <span
                      style={{
                        fontSize: TYPOGRAPHY.SIZE_LABEL,
                        color: COLORS.PEBBLE,
                        fontWeight: "normal",
                      }}
                    >
                      • {new Date(item.createdAt).toLocaleString()}
                    </span>

                    {/* EDIT / DELETE ICONS (Moved here) */}
                    {isMyContent(item.userId) &&
                      editingItem?.id !== item.id && (
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            marginLeft: "4px",
                          }}
                        >
                          <button
                            onClick={() =>
                              startEditing(
                                "question",
                                item.id,
                                item.questionText
                              )
                            }
                            title="Edit"
                            style={{
                              color: COLORS.PEBBLE,
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: "2px",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete("question", item.id)}
                            title="Delete"
                            style={{
                              color: COLORS.PEBBLE,
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: "2px",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                  </div>

                  {/* QUESTION BODY (EDIT MODE) */}
                  {editingItem?.type === "question" &&
                  editingItem.id === item.id ? (
                    <div style={{ marginTop: SPACING.S }}>
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        style={{
                          width: "100%",
                          padding: SPACING.S,
                          border: `1px solid ${COLORS.MIDNIGHT_ASH}`,
                          borderRadius: BORDER_RADIUS.S,
                          fontFamily: "inherit",
                          fontSize: TYPOGRAPHY.SIZE_BODY,
                          outline: "none",
                        }}
                        rows={3}
                      />
                      <div
                        style={{
                          marginTop: SPACING.S,
                          display: "flex",
                          gap: SPACING.S,
                          alignItems: "center",
                        }}
                      >
                        <button
                          onClick={saveEdit}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: TYPOGRAPHY.SIZE_XS,
                            padding: "6px 12px",
                            backgroundColor: COLORS.MIDNIGHT_ASH,
                            color: "white",
                            border: "none",
                            borderRadius: BORDER_RADIUS.FULL,
                            cursor: "pointer",
                            fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                          }}
                        >
                          <Check size={14} /> Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: TYPOGRAPHY.SIZE_XS,
                            padding: "6px 12px",
                            background: "transparent",
                            color: COLORS.MIDNIGHT_ASH,
                            border: `1px solid ${COLORS.MORNING_MIST}`,
                            borderRadius: BORDER_RADIUS.FULL,
                            cursor: "pointer",
                            fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                          }}
                        >
                          <X size={14} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        marginTop: SPACING.S,
                        fontSize: TYPOGRAPHY.SIZE_BODY,
                        color: COLORS.MIDNIGHT_ASH,
                      }}
                    >
                      {item.questionText}
                    </div>
                  )}

                  {/* ANSWERS */}
                  {item.answers &&
                    item.answers.map((answer) => (
                      <div
                        key={answer.id}
                        style={{
                          marginTop: SPACING.M,
                          marginLeft: "4px",
                          paddingLeft: SPACING.L,
                          borderLeft: `2px solid ${COLORS.MORNING_MIST}`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: SPACING.S,
                          }}
                        >
                          <span
                            style={{
                              fontSize: TYPOGRAPHY.SIZE_LABEL,
                              fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                              color: COLORS.MIDNIGHT_ASH,
                            }}
                          >
                            {answer.userId === product?.seller_id
                              ? userInfoById[answer.userId]?.fullName ||
                                userInfoById[answer.userId]?.full_name ||
                                "Seller"
                              : maskName(
                                  null,
                                  answer.userId,
                                  userInfoById[answer.userId]
                                )}
                          </span>

                          <span
                            style={{
                              fontSize: TYPOGRAPHY.SIZE_LABEL,
                              color: COLORS.PEBBLE,
                              fontWeight: "normal",
                            }}
                          >
                            • {new Date(answer.createdAt).toLocaleString()}
                          </span>

                          {/* EDIT / DELETE ICONS FOR ANSWER (Moved here) */}
                          {isMyContent(answer.userId) &&
                            editingItem?.id !== answer.id && (
                              <div
                                style={{
                                  display: "flex",
                                  gap: "8px",
                                  marginLeft: "4px",
                                }}
                              >
                                <button
                                  onClick={() =>
                                    startEditing(
                                      "answer",
                                      answer.id,
                                      answer.answerText
                                    )
                                  }
                                  title="Edit Answer"
                                  style={{
                                    color: COLORS.PEBBLE,
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: "2px",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDelete("answer", answer.id)
                                  }
                                  title="Delete Answer"
                                  style={{
                                    color: COLORS.PEBBLE,
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: "2px",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                        </div>

                        {/* ANSWER BODY (EDIT MODE) */}
                        {editingItem?.type === "answer" &&
                        editingItem.id === answer.id ? (
                          <div style={{ marginTop: SPACING.S }}>
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              style={{
                                width: "100%",
                                padding: SPACING.S,
                                border: `1px solid ${COLORS.MIDNIGHT_ASH}`,
                                borderRadius: BORDER_RADIUS.S,
                                fontFamily: "inherit",
                                fontSize: TYPOGRAPHY.SIZE_BODY,
                                outline: "none",
                              }}
                              rows={2}
                            />
                            <div
                              style={{
                                marginTop: SPACING.S,
                                display: "flex",
                                gap: SPACING.S,
                                alignItems: "center",
                              }}
                            >
                              <button
                                onClick={saveEdit}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  fontSize: TYPOGRAPHY.SIZE_XS,
                                  padding: "6px 12px",
                                  backgroundColor: COLORS.MIDNIGHT_ASH,
                                  color: "white",
                                  border: "none",
                                  borderRadius: BORDER_RADIUS.FULL,
                                  cursor: "pointer",
                                  fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                                }}
                              >
                                <Check size={14} /> Save
                              </button>
                              <button
                                onClick={cancelEditing}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  fontSize: TYPOGRAPHY.SIZE_XS,
                                  padding: "6px 12px",
                                  background: "transparent",
                                  color: COLORS.MIDNIGHT_ASH,
                                  border: `1px solid ${COLORS.MORNING_MIST}`,
                                  borderRadius: BORDER_RADIUS.FULL,
                                  cursor: "pointer",
                                  fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                                }}
                              >
                                <X size={14} /> Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{
                              marginTop: SPACING.S,
                              fontSize: TYPOGRAPHY.SIZE_BODY,
                              color: COLORS.MIDNIGHT_ASH,
                            }}
                          >
                            {answer.answerText}
                          </div>
                        )}
                      </div>
                    ))}

                  {/* SELLER REPLY INPUT */}
                  {isSeller && (
                    <div style={{ marginTop: SPACING.M }}>
                      {activeReplyId === item.id ? (
                        <div
                          style={{
                            backgroundColor: COLORS.SOFT_CLOUD,
                            padding: SPACING.M,
                            borderRadius: BORDER_RADIUS.MEDIUM,
                          }}
                        >
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write your answer..."
                            rows={2}
                            style={{
                              width: "100%",
                              padding: SPACING.S,
                              marginBottom: SPACING.S,
                              borderRadius: BORDER_RADIUS.MEDIUM,
                              border: `1px solid ${COLORS.MORNING_MIST}`,
                            }}
                          />
                          <div style={{ display: "flex", gap: SPACING.S }}>
                            <button
                              onClick={() => handleReplySubmit(item.id)}
                              disabled={replying}
                              style={{
                                padding: `${SPACING.XS} ${SPACING.M}`,
                                backgroundColor: COLORS.MIDNIGHT_ASH,
                                color: COLORS.WHITE,
                                border: "none",
                                borderRadius: BORDER_RADIUS.FULL,
                                cursor: "pointer",
                                fontSize: TYPOGRAPHY.SIZE_LABEL,
                                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                              }}
                            >
                              {replying ? "Sending..." : "Reply"}
                            </button>
                            <button
                              onClick={() => {
                                setActiveReplyId(null);
                                setReplyText("");
                              }}
                              style={{
                                padding: `${SPACING.XS} ${SPACING.M}`,
                                backgroundColor: "transparent",
                                color: COLORS.MIDNIGHT_ASH,
                                border: `1px solid ${COLORS.MIDNIGHT_ASH}`,
                                borderRadius: BORDER_RADIUS.FULL,
                                cursor: "pointer",
                                fontSize: TYPOGRAPHY.SIZE_LABEL,
                                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveReplyId(item.id)}
                          style={{
                            fontSize: TYPOGRAPHY.SIZE_LABEL,
                            color: COLORS.PRIMARY,
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                            textDecoration: "underline",
                          }}
                        >
                          Reply to this question
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
