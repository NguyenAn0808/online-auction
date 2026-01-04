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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [requestStatus, setRequestStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [errors, setErrors] = useState({
    reason: "",
    contact: "",
    documents: "",
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
      console.error("Error fetching status:", err);
      // If 404 or error, assume no request exists
      setRequestStatus(null);
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    if (errors.documents) {
      setErrors((prev) => ({ ...prev, documents: "" }));
    }
  }

  function validateForm(reason, contact, files) {
    const newErrors = { reason: "", contact: "", documents: "" };
    let isValid = true;

    if (!reason || reason.length < 20) {
      newErrors.reason = "Reason must be at least 20 characters long.";
      isValid = false;
    }

    if (!contact) {
      newErrors.contact = "Contact information is required.";
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[\d\s()+-]{10,}$/;
      if (!emailRegex.test(contact) && !phoneRegex.test(contact)) {
        newErrors.contact = "Please enter a valid email or phone number.";
        isValid = false;
      }
    }

    if (files.length === 0) {
      newErrors.documents = "At least one document is required.";
      isValid = false;
    } else {
      const maxSize = 5 * 1024 * 1024;
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];

      for (const file of files) {
        if (file.size > maxSize) {
          newErrors.documents = `File "${file.name}" exceeds 5MB limit.`;
          isValid = false;
          break;
        }
        if (!allowedTypes.includes(file.type)) {
          newErrors.documents = `File "${file.name}" is not a valid type. Only PDF, JPEG, and PNG are allowed.`;
          isValid = false;
          break;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const reason = form.reason.value.trim();
    const contact = form.contact.value.trim();
    const files = Array.from(form["documents"].files || []);

    if (!validateForm(reason, contact, files)) {
      return;
    }

    const fd = new FormData();
    fd.append("reason", reason);
    fd.append("contact", contact);
    for (const f of files) fd.append("documents", f);

    try {
      setSubmitting(true);
      const res = await api.post(`/api/upgrade-requests`, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      form.reset();
      setSelectedFiles([]);
      setShowSuccessDialog(true);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to submit request";
      setErrors((prev) => ({ ...prev, documents: errorMsg }));
    } finally {
      setSubmitting(false);
    }
  }

  function handleReapply() {
    setRequestStatus(null);
    setSelectedFiles([]);
    setErrors({ reason: "", contact: "", documents: "" });
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
        className="mx-auto px-4 sm:px-6 lg:px-8 mt-6"
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
                    reviewing your documents. This process usually takes 24-48
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
                          Contact Info{" "}
                          <span style={{ color: "#DC2626" }}>*</span>
                        </label>
                        <input
                          name="contact"
                          type="text"
                          style={{
                            display: "block",
                            width: "100%",
                            borderRadius: BORDER_RADIUS.MEDIUM,
                            backgroundColor: COLORS.WHITE,
                            padding: `${SPACING.S} ${SPACING.M}`,
                            color: COLORS.MIDNIGHT_ASH,
                            border: `1.5px solid ${
                              errors.contact ? "#DC2626" : COLORS.MORNING_MIST
                            }`,
                            fontSize: TYPOGRAPHY.SIZE_BODY,
                            fontFamily: "inherit",
                          }}
                          placeholder="your.email@example.com or phone number"
                          onChange={() =>
                            errors.contact &&
                            setErrors((prev) => ({ ...prev, contact: "" }))
                          }
                        />
                        {errors.contact && (
                          <p
                            style={{
                              color: "#DC2626",
                              fontSize: TYPOGRAPHY.SIZE_LABEL,
                              marginTop: SPACING.XS,
                            }}
                          >
                            {errors.contact}
                          </p>
                        )}
                      </div>

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
                          Supporting documents (ID, samples){" "}
                          <span style={{ color: "#DC2626" }}>*</span>
                        </label>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            borderRadius: BORDER_RADIUS.MEDIUM,
                            border: `2px dashed ${
                              errors.documents ? "#DC2626" : COLORS.MORNING_MIST
                            }`,
                            padding: SPACING.XL,
                            backgroundColor: COLORS.WHITE,
                          }}
                        >
                          <div style={{ textAlign: "center" }}>
                            <svg
                              style={{
                                margin: "0 auto",
                                height: "48px",
                                width: "48px",
                                color: COLORS.PEBBLE,
                              }}
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                              aria-hidden="true"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-8-12v12m0 0l-3-3m3 3l3-3"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div
                              style={{
                                marginTop: SPACING.M,
                                display: "flex",
                                fontSize: TYPOGRAPHY.SIZE_BODY,
                                color: COLORS.PEBBLE,
                                justifyContent: "center",
                              }}
                            >
                              <label
                                htmlFor="documents-upload"
                                style={{
                                  position: "relative",
                                  cursor: "pointer",
                                  borderRadius: BORDER_RADIUS.MEDIUM,
                                  backgroundColor: COLORS.WHITE,
                                  fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                                  color: COLORS.MIDNIGHT_ASH,
                                }}
                                className="hover:text-blue-600"
                              >
                                <span>Upload files</span>
                                <input
                                  id="documents-upload"
                                  name="documents"
                                  type="file"
                                  multiple
                                  accept="image/*,.pdf"
                                  onChange={handleFileChange}
                                  style={{ display: "none" }}
                                />
                              </label>
                              <p style={{ paddingLeft: SPACING.S }}>
                                or drag and drop
                              </p>
                            </div>
                            <p
                              style={{
                                fontSize: TYPOGRAPHY.SIZE_LABEL,
                                color: COLORS.PEBBLE,
                                marginTop: SPACING.S,
                              }}
                            >
                              PNG, JPG, PDF up to 5MB each
                            </p>
                            {selectedFiles.length > 0 && (
                              <div
                                style={{
                                  marginTop: SPACING.M,
                                  fontSize: TYPOGRAPHY.SIZE_LABEL_LARGE,
                                  color: COLORS.MIDNIGHT_ASH,
                                  fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                                }}
                              >
                                {selectedFiles.length} file(s) selected:
                                <ul
                                  style={{
                                    marginTop: SPACING.S,
                                    fontSize: TYPOGRAPHY.SIZE_LABEL,
                                    color: COLORS.PEBBLE,
                                    listStyle: "none",
                                    padding: 0,
                                  }}
                                >
                                  {selectedFiles.map((file, idx) => (
                                    <li key={idx}>
                                      {file.name} (
                                      {Math.round(file.size / 1024)} KB)
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                        {errors.documents && (
                          <p
                            style={{
                              color: "#DC2626",
                              fontSize: TYPOGRAPHY.SIZE_LABEL,
                              marginTop: SPACING.XS,
                            }}
                          >
                            {errors.documents}
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
