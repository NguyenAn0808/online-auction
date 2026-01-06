import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Tabs from "../components/Tabs";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/designSystem";
import upgradeRequestService from "../services/upgradeRequestService";

export default function SellingRequestPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [errors, setErrors] = useState({
    reason: "",
  });

  useEffect(() => {
    fetchRequestStatus();
  }, []);

  async function fetchRequestStatus() {
    try {
      const res = await api.get("/api/upgrade-requests/my-status");

      // If a request exists, set the status
      if (res.data && res.data.status) {
        setRequestStatus(res.data.status);
      } else {
        setRequestStatus(null);
      }
    } catch (err) {
      // If 404 or error, assume no request exists
      setRequestStatus(null);
    } finally {
      setLoading(false);
    }
  }
  function validateForm(reason) {
    const newErrors = { reason: "" };
    let isValid = true;

    if (!reason || reason.length < 20) {
      newErrors.reason = "Reason must be at least 20 characters long.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const reason = form.reason.value.trim();
    if (!validateForm(reason)) {
      return;
    }

    const fd = new FormData();
    fd.append("reason", reason);

    try {
      setSubmitting(true);
      const res = await api.post(`/api/upgrade-requests`, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      form.reset();
      setShowSuccessDialog(true);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to submit request";
      setErrors((prev) => ({ ...prev, reason: errorMsg }));
    } finally {
      setSubmitting(false);
    }
  }

  function handleReapply() {
    setRequestStatus(null);
    setErrors({ reason: "" });
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: COLORS.WHISPER, minHeight: "100vh" }}>
        <Header />
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: SPACING.M,
            textAlign: "center",
            paddingTop: SPACING.XXL,
          }}
        >
          <p style={{ color: COLORS.PEBBLE, fontSize: TYPOGRAPHY.SIZE_BODY }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: COLORS.WHISPER, minHeight: "100vh" }}>
      <Header />

      <div
        style={{ maxWidth: "1400px", margin: "0 auto", padding: SPACING.M }}
        className="mx-auto px-4 sm:px-6 lg:px-8 mt-6 py-4"
      >
        <div className="lg:flex lg:space-x-6">
          {/* Sidebar */}
          <div className="hidden lg:block" style={{ width: "256px" }}>
            <Sidebar />
          </div>

          {/* Main area */}
          <div className="flex-1 min-w-0">
            <div style={{ marginBottom: SPACING.L }}>
              <Tabs />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: SPACING.XL,
              }}
            >
              {requestStatus === "pending" && (
                <div
                  style={{
                    backgroundColor: "#FEF3C7",
                    borderRadius: BORDER_RADIUS.MEDIUM,
                    boxShadow: SHADOWS.SUBTLE,
                    padding: SPACING.XL,
                    textAlign: "center",
                    border: "2px solid #FCD34D",
                  }}
                >
                  <svg
                    style={{
                      margin: "0 auto",
                      height: "64px",
                      width: "64px",
                      color: "#F59E0B",
                      marginBottom: SPACING.M,
                    }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h2
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_CATEGORY_TITLE,
                      fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                      color: "#92400E",
                      marginBottom: SPACING.S,
                    }}
                  >
                    Application Under Review
                  </h2>
                  <p
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_BODY,
                      color: "#78350F",
                    }}
                  >
                    We have received your request. Our team is currently
                    reviewing your request. This process usually takes 24-48
                    hours.
                  </p>
                </div>
              )}

              {requestStatus === "rejected" && (
                <div
                  style={{
                    backgroundColor: "#FEE2E2",
                    borderRadius: BORDER_RADIUS.MEDIUM,
                    boxShadow: SHADOWS.SUBTLE,
                    padding: SPACING.XL,
                    textAlign: "center",
                    border: "2px solid #FCA5A5",
                  }}
                >
                  <svg
                    style={{
                      margin: "0 auto",
                      height: "64px",
                      width: "64px",
                      color: "#DC2626",
                      marginBottom: SPACING.M,
                    }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h2
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_CATEGORY_TITLE,
                      fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                      color: "#991B1B",
                      marginBottom: SPACING.S,
                    }}
                  >
                    Application Not Approved
                  </h2>
                  <p
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_BODY,
                      color: "#7F1D1D",
                      marginBottom: SPACING.L,
                    }}
                  >
                    Unfortunately, your request was not approved at this time.
                  </p>
                  <button
                    onClick={handleReapply}
                    style={{
                      borderRadius: BORDER_RADIUS.FULL,
                      backgroundColor: "#DC2626",
                      padding: `${SPACING.S} ${SPACING.L}`,
                      fontSize: TYPOGRAPHY.SIZE_BODY,
                      fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                      color: COLORS.WHITE,
                      border: "none",
                      cursor: "pointer",
                      transition: "opacity 0.2s ease",
                    }}
                    className="hover:opacity-90"
                  >
                    Submit New Request
                  </button>
                </div>
              )}

              {requestStatus === "approved" && (
                <div
                  style={{
                    backgroundColor: "#D1FAE5",
                    borderRadius: BORDER_RADIUS.MEDIUM,
                    boxShadow: SHADOWS.SUBTLE,
                    padding: SPACING.XL,
                    textAlign: "center",
                    border: "2px solid #6EE7B7",
                  }}
                >
                  <svg
                    style={{
                      margin: "0 auto",
                      height: "64px",
                      width: "64px",
                      color: "#059669",
                      marginBottom: SPACING.M,
                    }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h2
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_CATEGORY_TITLE,
                      fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                      color: "#065F46",
                      marginBottom: SPACING.S,
                    }}
                  >
                    Congratulations!
                  </h2>
                  <p
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_BODY,
                      color: "#064E3B",
                      marginBottom: SPACING.L,
                    }}
                  >
                    You are already a seller. Start listing your products now!
                  </p>
                  <button
                    onClick={() => navigate("/seller/listing")}
                    style={{
                      borderRadius: BORDER_RADIUS.FULL,
                      backgroundColor: "#059669",
                      padding: `${SPACING.S} ${SPACING.L}`,
                      fontSize: TYPOGRAPHY.SIZE_BODY,
                      fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                      color: COLORS.WHITE,
                      border: "none",
                      cursor: "pointer",
                      transition: "opacity 0.2s ease",
                    }}
                    className="hover:opacity-90"
                  >
                    Go to Seller Dashboard
                  </button>
                </div>
              )}

              {requestStatus === null && (
                <section>
                  <div
                    style={{
                      backgroundColor: COLORS.WHITE,
                      borderRadius: BORDER_RADIUS.MEDIUM,
                      boxShadow: SHADOWS.SUBTLE,
                      padding: SPACING.L,
                    }}
                  >
                    <h2
                      style={{
                        fontSize: TYPOGRAPHY.SIZE_CATEGORY_TITLE,
                        fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                        color: COLORS.MIDNIGHT_ASH,
                        marginBottom: SPACING.S,
                      }}
                    >
                      Request to Sell
                    </h2>
                    <p
                      style={{
                        fontSize: TYPOGRAPHY.SIZE_BODY,
                        color: COLORS.PEBBLE,
                        marginBottom: SPACING.L,
                      }}
                    >
                      Fill this form to request an upgrade to seller. Admin will
                      review within 7 days.
                    </p>

                    <form
                      onSubmit={handleSubmit}
                      noValidate
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: SPACING.L,
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: TYPOGRAPHY.SIZE_LABEL_LARGE,
                            fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                            color: COLORS.MIDNIGHT_ASH,
                            marginBottom: SPACING.S,
                          }}
                        >
                          Reason <span style={{ color: "#DC2626" }}>*</span>
                        </label>
                        <textarea
                          name="reason"
                          style={{
                            display: "block",
                            width: "100%",
                            borderRadius: BORDER_RADIUS.MEDIUM,
                            backgroundColor: COLORS.WHITE,
                            padding: `${SPACING.S} ${SPACING.M}`,
                            color: COLORS.MIDNIGHT_ASH,
                            border: `1.5px solid ${
                              errors.reason ? "#DC2626" : COLORS.MORNING_MIST
                            }`,
                            fontSize: TYPOGRAPHY.SIZE_BODY,
                            fontFamily: "inherit",
                          }}
                          rows={4}
                          placeholder="Explain why you want to become a seller on our platform (minimum 20 characters)"
                          onChange={() =>
                            errors.reason &&
                            setErrors((prev) => ({ ...prev, reason: "" }))
                          }
                        />
                        {errors.reason && (
                          <p
                            style={{
                              color: "#DC2626",
                              fontSize: TYPOGRAPHY.SIZE_LABEL,
                              marginTop: SPACING.XS,
                            }}
                          >
                            {errors.reason}
                          </p>
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: SPACING.M,
                          paddingTop: SPACING.L,
                          borderTop: `1px solid ${COLORS.MORNING_MIST}`,
                        }}
                      >
                        <button
                          type="button"
                          style={{
                            fontSize: TYPOGRAPHY.SIZE_BODY,
                            fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                            color: COLORS.MIDNIGHT_ASH,
                            backgroundColor: "transparent",
                            border: "none",
                            cursor: "pointer",
                            borderRadius: BORDER_RADIUS.FULL,
                            padding: `${SPACING.S} ${SPACING.L}`,
                            transition: "opacity 0.2s ease",
                          }}
                          className="hover:opacity-70"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          style={{
                            borderRadius: BORDER_RADIUS.FULL,
                            backgroundColor: COLORS.MIDNIGHT_ASH,
                            padding: `${SPACING.S} ${SPACING.L}`,
                            fontSize: TYPOGRAPHY.SIZE_BODY,
                            fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                            color: COLORS.WHITE,
                            border: "none",
                            cursor: submitting ? "not-allowed" : "pointer",
                            opacity: submitting ? 0.6 : 1,
                            transition: "opacity 0.2s ease",
                          }}
                        >
                          {submitting ? "Submitting..." : "Submit request"}
                        </button>
                      </div>
                    </form>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>

      <Transition appear show={showSuccessDialog} as={React.Fragment}>
        <Dialog
          as="div"
          style={{ position: "relative", zIndex: 50 }}
          onClose={() => setShowSuccessDialog(false)}
        >
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }}
            />
          </Transition.Child>

          <div
            style={{
              position: "fixed",
              inset: 0,
              overflow: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                minHeight: "100%",
                alignItems: "center",
                justifyContent: "center",
                padding: SPACING.M,
                textAlign: "center",
              }}
            >
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  style={{
                    width: "100%",
                    maxWidth: "500px",
                    transform: "scale(1)",
                    borderRadius: BORDER_RADIUS.LARGE,
                    backgroundColor: COLORS.WHITE,
                    padding: SPACING.XL,
                    textAlign: "center",
                    boxShadow: SHADOWS.SUBTLE,
                  }}
                >
                  <div
                    style={{
                      margin: "0 auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "64px",
                      width: "64px",
                      borderRadius: "50%",
                      backgroundColor: "#D1FAE5",
                      marginBottom: SPACING.L,
                    }}
                  >
                    <svg
                      style={{
                        height: "32px",
                        width: "32px",
                        color: "#059669",
                      }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>

                  <Dialog.Title
                    as="h3"
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_CATEGORY_TITLE,
                      fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                      color: COLORS.MIDNIGHT_ASH,
                      marginBottom: SPACING.M,
                    }}
                  >
                    Request Submitted Successfully
                  </Dialog.Title>

                  <div style={{ marginTop: SPACING.M }}>
                    <p
                      style={{
                        fontSize: TYPOGRAPHY.SIZE_BODY,
                        color: COLORS.PEBBLE,
                        marginBottom: SPACING.L,
                      }}
                    >
                      Our admin team will review your documents and credentials.
                      You will be notified once your application has been
                      processed. This typically takes 3-7 business days.
                    </p>
                  </div>

                  <div style={{ marginTop: SPACING.L }}>
                    <button
                      type="button"
                      onClick={() => navigate("/summary/" + user.id)}
                      style={{
                        width: "100%",
                        borderRadius: BORDER_RADIUS.FULL,
                        backgroundColor: COLORS.MIDNIGHT_ASH,
                        padding: `${SPACING.S} ${SPACING.L}`,
                        fontSize: TYPOGRAPHY.SIZE_BODY,
                        fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                        color: COLORS.WHITE,
                        border: "none",
                        cursor: "pointer",
                        transition: "opacity 0.2s ease",
                      }}
                      className="hover:opacity-90"
                    >
                      Return to Profile
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
