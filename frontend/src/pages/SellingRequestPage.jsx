import React, { useState } from "react";
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

export default function SellingRequestPage() {
  const [submitting, setSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const reason = form.reason.value.trim();
    const contact = form.contact.value.trim();
    const files = form["documents"].files;
    if (!reason) return alert("Please provide a reason for selling request");

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
      alert("Request submitted successfully. Admin will review it.");
      form.reset();
      setSelectedFiles([]); // Clear selected files
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
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
                        Reason
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
                          border: `1.5px solid ${COLORS.MORNING_MIST}`,
                          fontSize: TYPOGRAPHY.SIZE_BODY,
                          fontFamily: "inherit",
                        }}
                        rows={4}
                        placeholder="Explain why you want to become a seller on our platform"
                      />
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
                        Contact Info
                      </label>
                      <input
                        name="contact"
                        type="email"
                        style={{
                          display: "block",
                          width: "100%",
                          borderRadius: BORDER_RADIUS.MEDIUM,
                          backgroundColor: COLORS.WHITE,
                          padding: `${SPACING.S} ${SPACING.M}`,
                          color: COLORS.MIDNIGHT_ASH,
                          border: `1.5px solid ${COLORS.MORNING_MIST}`,
                          fontSize: TYPOGRAPHY.SIZE_BODY,
                          fontFamily: "inherit",
                        }}
                        placeholder="your.email@example.com"
                      />
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
                        Supporting documents (ID, samples)
                      </label>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          borderRadius: BORDER_RADIUS.MEDIUM,
                          border: `2px dashed ${COLORS.MORNING_MIST}`,
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
                            PNG, JPG, PDF up to 10MB each
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
                                    {file.name} ({Math.round(file.size / 1024)}{" "}
                                    KB)
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
