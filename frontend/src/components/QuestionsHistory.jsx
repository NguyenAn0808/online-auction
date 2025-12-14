import { useEffect, useState } from "react";
import productService from "../services/productService";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/designSystem";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function QuestionsHistory() {
  const [qa, setQa] = useState([]);
  const [questionText, setQuestionText] = useState("");
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setQa(productService.getQuestions());
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/auth/signin", { state: { from: location } });
      return;
    }

    if (!questionText.trim()) return;
    setSending(true);
    const currentUser = localStorage.getItem("userName") || "Anonymous";
    // Todo Q&A integrate service
    // Add to demo store immediately
    const added = productService.addQuestion({
      question: questionText.trim(),
      questionBy: currentUser,
    });
    setQa(productService.getQuestions());
    try {
      // Try to notify backend (email to seller) - best-effort
      await fetch(`/api/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: productService.getProduct().id,
          question: questionText.trim(),
          user: currentUser,
        }),
      });
      // backend should send email to seller with link to product details
    } catch (err) {
      // backend may not exist in demo — that's okay
      console.warn("Failed to post question to backend (demo):", err);
    }
    setQuestionText("");
    setSending(false);
    alert(
      "Your question was submitted. The seller will receive a notification to respond."
    );
  };

  return (
    <>
      <h2
        style={{
          fontSize: TYPOGRAPHY.SIZE_HEADING_SM,
          fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
          color: COLORS.MIDNIGHT_ASH,
          trackingTight: true,
        }}
      >
        Questions & Answers
      </h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: SPACING.L }}>
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
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              borderRadius: BORDER_RADIUS.MEDIUM,
              border: `1px solid ${COLORS.MORNING_MIST}`,
              paddingLeft: SPACING.M,
              paddingRight: SPACING.M,
              paddingTop: SPACING.S,
              paddingBottom: SPACING.S,
              fontSize: TYPOGRAPHY.SIZE_BODY,
              color: COLORS.MIDNIGHT_ASH,
              fontFamily: "inherit",
              transition: "border-color 0.2s ease",
              backgroundColor: COLORS.WHITE,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = COLORS.MIDNIGHT_ASH;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = COLORS.MORNING_MIST;
            }}
            placeholder="Ask the seller about condition, shipping, or other details"
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: SPACING.S,
            }}
          >
            <button
              type="submit"
              disabled={user ? sending || !questionText.trim() : false}
              style={{
                borderRadius: BORDER_RADIUS.FULL,
                backgroundColor: COLORS.MIDNIGHT_ASH,
                paddingLeft: SPACING.M,
                paddingRight: SPACING.M,
                paddingTop: "4px",
                paddingBottom: "4px",
                fontSize: TYPOGRAPHY.SIZE_LABEL,
                color: COLORS.WHITE,
                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                border: "none",
                cursor:
                  sending || !questionText.trim() ? "not-allowed" : "pointer",
                opacity: sending || !questionText.trim() ? 0.5 : 1,
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!sending && questionText.trim())
                  e.target.style.opacity = "0.9";
              }}
              onMouseLeave={(e) => {
                if (!sending && questionText.trim())
                  e.target.style.opacity = "1";
              }}
            >
              {sending ? "Sending..." : "Submit question"}
            </button>
          </div>
        </div>
      </form>

      <div
        style={{
          marginTop: SPACING.L,
          borderTop: `1px solid ${COLORS.MORNING_MIST}`,
        }}
      >
        {qa.map((item) => (
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
              <div style={{ shrinkFlex: 0 }}>
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
                  {item.role === "seller" ? "S" : "B"}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: TYPOGRAPHY.SIZE_LABEL,
                        fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                        color: COLORS.MIDNIGHT_ASH,
                      }}
                    >
                      {item.questionBy}{" "}
                      <span
                        style={{
                          marginLeft: SPACING.S,
                          fontSize: TYPOGRAPHY.SIZE_LABEL,
                          color: COLORS.PEBBLE,
                        }}
                      >
                        {new Date(item.questionAt).toLocaleString()}
                      </span>
                    </div>
                    <div
                      style={{
                        marginTop: SPACING.S,
                        fontSize: TYPOGRAPHY.SIZE_BODY,
                        color: COLORS.MIDNIGHT_ASH,
                      }}
                    >
                      {item.question}
                    </div>
                  </div>
                </div>

                {item.answer && (
                  <div style={{ marginTop: SPACING.M, marginLeft: "48px" }}>
                    <div
                      style={{
                        fontSize: TYPOGRAPHY.SIZE_LABEL,
                        fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                        color: COLORS.MIDNIGHT_ASH,
                      }}
                    >
                      {item.answerBy}{" "}
                      <span
                        style={{
                          marginLeft: SPACING.S,
                          fontSize: TYPOGRAPHY.SIZE_LABEL,
                          color: COLORS.PEBBLE,
                        }}
                      >
                        {new Date(item.answerAt).toLocaleString()}
                      </span>
                    </div>
                    <div
                      style={{
                        marginTop: SPACING.S,
                        fontSize: TYPOGRAPHY.SIZE_BODY,
                        color: COLORS.MIDNIGHT_ASH,
                      }}
                    >
                      {item.answer}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
