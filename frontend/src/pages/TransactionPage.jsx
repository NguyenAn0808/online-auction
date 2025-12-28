import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import TransactionStepper from "../components/TransactionStepper";
import TransactionSummary from "../components/TransactionSummary";
import ShippingInvoiceForm from "../components/ShippingInvoiceForm";
import { Radio, RadioGroup } from "@headlessui/react";
import { HandThumbUpIcon, HandThumbDownIcon } from "@heroicons/react/24/solid";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/designSystem";
import { useAuth } from "../context/AuthContext";
import * as TransactionService from "../services/transactionService"; // Legacy service (deprecated)
import { STATUS } from "../services/transactionService"; // Legacy status constants (deprecated)
import orderService, { ORDER_STATUS } from "../services/orderService"; // Use OpenAPI service
import CancelOrderModal from "../components/CancelOrderModal";
const DELIVERY_METHODS = [
  {
    id: 1,
    title: "Standard",
    turnaround: "4–10 business days",
    price: "$5.00",
  },
  { id: 2, title: "Express", turnaround: "2–5 business days", price: "$16.00" },
];
const deliveryMethods = [
  {
    id: 1,
    title: "Standard",
    turnaround: "4–10 business days",
    price: "$5.00",
  },
  { id: 2, title: "Express", turnaround: "2–5 business days", price: "$16.00" },
];

// Mock auth hook - replace with real auth later
function useMockAuth() {
  const [role, setRole] = useState("buyer");
  return {
    role,
    setRole,
    userId: role === "buyer" ? "buyer-1" : "seller-1",
    userName: role === "buyer" ? "You" : "Seller",
  };
}

export default function TransactionPage() {
  const { transactionId } = useParams(); // The Order ID (if exists)
  const [searchParams] = useSearchParams();
  const productIdParam = searchParams.get("productId"); // If creating new order
  const [ratingComment, setRatingComment] = useState("");
  const [selectedRating, setSelectedRating] = useState(null);
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- STATE ---
  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [isCancelModalOpen, setCancelModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  // Step 1 Form State (Buyer Creating Order)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    phone: "",
    region: "",
    postalCode: "",
    company: "",
    country: "United States",
  });
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState(
    DELIVERY_METHODS[0]
  );
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentProofFile, setPaymentProofFile] = useState(null);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  const handleCancelSubmit = async (reason) => {
    try {
      // Use OpenAPI endpoint: POST /orders/{order_id}/cancel
      const orderId = transactionId; // Assuming transactionId is orderId
      await orderService.cancelOrder(orderId, reason);

      setCancelModalOpen(false);

      // Hiển thị thông báo thành công màu xanh
      setNotification({
        type: "success",
        message: "Order has been cancelled & Buyer rated -1 successfully!",
      });

      // Đợi 2 giây cho người dùng đọc thông báo rồi mới tải lại trang
      setTimeout(() => {
        window.location.reload();
      }, 5000);

      // Refresh page to show the new 'Cancelled' status
      window.location.reload();
    } catch (error) {
      console.error("Cancellation failed:", error);
      setNotification({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to cancel order. Please try again.",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Load transaction
  useEffect(() => {
    async function loadData() {
      // If no ID, we are likely creating a new order (Step 1)
      if (!transactionId) {
        setLoading(false);
        navigate("/", { replace: true });
        return;
      }

      try {
        setLoading(true);
        // Use OpenAPI endpoint: GET /products/{product_id}/order
        // Note: transactionId should be productId to get the order
        const apiResponse = await orderService.getOrder(transactionId);
        if (apiResponse) {
          setTx(apiResponse);
        } else {
          // Handle case where API returns success but no data (rare)
          throw new Error("Order not found");
        }
      } catch (err) {
        console.error("Failed to load transaction", err);
        // Security Redirect
        if (
          err.response &&
          (err.response.status === 403 || err.response.status === 404)
        ) {
          alert(
            "You do not have permission to view this transaction or it does not exist."
          );
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [transactionId, navigate]);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  const isBuyer = !tx || (user && user.id === tx.buyer_id);
  const isSeller = tx && user && user.id === tx.seller_id;
  const userRole = isSeller ? "seller" : "buyer";
  // Use OpenAPI status enums instead of database status strings
  const isCompleted = tx?.status === ORDER_STATUS.COMPLETED;
  const isCancelled = tx?.status === ORDER_STATUS.CANCELLED;

  const isFormValid =
    formData.firstName && formData.address && formData.city && formData.phone;
  // STEP 1: CREATE ORDER (Buyer) - Submit Payment Proof
  // NOTE: OpenAPI spec expects paymentProofUrl as URL string, not File.
  // For now, converting File to data URL. Backend may need separate file upload endpoint.
  async function handleCreateOrder() {
    if (!paymentProofFile)
      return showToast("Please upload payment proof image.");

    // Simple validation
    if (!formData.address || !formData.city || !formData.phone) {
      return showToast("Please fill in Address, City and Phone.");
    }

    try {
      // Logic: Extract product ID from order (OpenAPI Order schema has product object, not product_id)
      // Handle both OpenAPI format (product._id) and legacy format (product_id)
      const pid =
        tx?.product?._id ||
        tx?.product?.id ||
        tx?.product_id ||
        productIdParam ||
        transactionId;
      if (!pid) return showToast("Product ID missing.");

      // Get order first to get order_id (OpenAPI: GET /products/{product_id}/order)
      const order = await orderService.getOrder(pid);
      const orderId = order?._id || order?.id;

      if (!orderId) {
        return showToast("Order not found. Please create order first.");
      }

      // Convert File to data URL (temporary solution - backend should accept file uploads separately)
      const paymentProofUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(paymentProofFile);
      });

      // Combine address into single string for Backend
      const fullAddress = `${formData.address}, ${formData.city}, ${formData.region}, ${formData.country}. Phone: ${formData.phone}`;

      // Submit payment proof using OpenAPI endpoint
      const res = await orderService.submitPayment(orderId, {
        shippingAddress: fullAddress,
        paymentProofUrl: paymentProofUrl, // Data URL - backend may need to handle this or provide separate upload endpoint
      });

      if (res) {
        setTx(res);
        showToast("Payment proof submitted! Waiting for seller confirmation.");
        navigate(`/transactions/${res._id || res.id}`, { replace: true });
      }
    } catch (err) {
      console.error(err);
      showToast(
        err.response?.data?.message || "Failed to submit payment proof"
      );
    }
  }

  // STEP 2: CONFIRM SHIPPING (Seller)
  // Use OpenAPI endpoint: POST /orders/{order_id}/shipment-proof
  async function handleSellerConfirm(shippingData) {
    // shippingData comes from ShippingInvoiceForm ({ shippingCode, file })
    if (!tx) return;
    const orderId = tx._id || tx.id;
    if (!orderId) return showToast("Order ID missing.");

    if (!tx.paymentProofUrl && !tx.payment_proof_image) {
      return showToast(
        "Cannot ship: Buyer has not uploaded payment proof yet."
      );
    }
    try {
      // Convert File to data URL (temporary solution - backend should accept file uploads separately)
      const shippingProofUrl = await new Promise((resolve, reject) => {
        if (!shippingData.file) {
          reject(new Error("Shipping proof file required"));
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(shippingData.file);
      });

      // Submit shipment proof using OpenAPI endpoint
      const res = await orderService.submitShipment(orderId, {
        shippingProofUrl: shippingProofUrl, // Data URL - backend may need to handle this
      });

      if (res) {
        setTx(res);
        showToast("Shipping confirmed! Order is now in transit.");
      }
    } catch (err) {
      console.error("Shipment submission error:", err);
      showToast(err.response?.data?.message || "Failed to confirm shipping");
    }
  }

  // STEP 2 (Alt): REJECT / CANCEL (Seller)
  // Use OpenAPI endpoint: POST /orders/{order_id}/cancel
  async function handleSellerCancel() {
    if (!tx) return;
    const orderId = tx._id || tx.id;
    if (!orderId) return showToast("Order ID missing.");

    const reason = prompt("Enter reason for cancellation:");
    if (!reason) return;

    try {
      const res = await orderService.cancelOrder(orderId, reason);
      if (res) {
        setTx(res);
        showToast("Order cancelled.");
      }
    } catch (err) {
      console.error("Cancel order error:", err);
      showToast(err.response?.data?.message || "Failed to cancel order");
    }
  }

  // STEP 3: CONFIRM RECEIPT (Buyer)
  // Use OpenAPI endpoint: POST /orders/{order_id}/delivery-confirmation
  async function handleBuyerConfirmReceipt() {
    if (!tx) return;
    const orderId = tx._id || tx.id;
    if (!orderId) return showToast("Order ID missing.");

    try {
      const res = await orderService.confirmDelivery(orderId);
      if (res) {
        setTx(res);
        showToast("Receipt confirmed! Please rate the seller.");
      }
    } catch (err) {
      console.error("Delivery confirmation error:", err);
      showToast(err.response?.data?.message || "Failed to confirm receipt");
    }
  }

  // STEP 4: SUBMIT RATING
  async function handleRatingSubmit() {
    if (!tx || !selectedRating) return;
    try {
      await TransactionService.rateTransaction(
        tx.id,
        selectedRating,
        ratingComment
      );
      setIsRatingSubmitted(true);
      showToast("Rating submitted successfully! Transaction finalizing.");
      // Refresh data to show "You rated" UI
      // navigate("/transactions");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to submit rating");
    }
  }

  const currentStep = useMemo(() => {
    if (!tx) return 1; // Step 1: Creating Order

    // Use OpenAPI status enums (source of truth: openapi.yaml)
    switch (tx.status) {
      case ORDER_STATUS.PENDING_BIDDER_PAYMENT:
        return 1; // Step 1: Buyer needs to submit payment

      case ORDER_STATUS.PENDING_SELLER_CONFIRMATION:
        return 2; // Step 2: Seller needs to confirm payment and ship

      case ORDER_STATUS.PENDING_DELIVERY:
        return 3; // Step 3: Product in transit, buyer waiting for delivery

      case ORDER_STATUS.PENDING_RATING:
        return 4; // Step 4: Awaiting ratings from buyer/seller

      case ORDER_STATUS.COMPLETED:
        return 5; // Step 5: Transaction complete

      case ORDER_STATUS.CANCELLED:
        return 0; // Cancelled transaction

      default:
        // Fallback for legacy status values (if backend still returns DB strings)
        if (
          tx.status === "pending_verification" ||
          tx.status === "delivering" ||
          tx.status === "await_rating"
        ) {
          console.warn(
            "Received legacy DB status value:",
            tx.status,
            "- Backend should return OpenAPI enum"
          );
        }
        return 1;
    }
  }, [tx]);

  const hasUserRated = tx?.ratings?.[userRole];

  const shouldShowFinalReceipt = useMemo(() => {
    // Case 1: The transaction status is globally final (Step 5)
    if (currentStep === 5) return true;

    // Case 2: The user just submitted their rating in this session (Step 4)
    if (currentStep === 4 && isRatingSubmitted) return true;

    // Case 3: The user returns later, and their rating is present (but not yet Step 5)
    // This handles page refresh if the rating wasn't yet finalized by the backend.
    if (currentStep === 4 && hasUserRated) return true;

    return false;
  }, [currentStep, isRatingSubmitted, hasUserRated]);

  if (loading)
    return <div className="p-10 text-center">Loading transaction...</div>;
  return (
    <div style={{ minHeight: "100vh", backgroundColor: COLORS.SOFT_CLOUD }}>
      <style>
        {`
          @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
      <Header />
      {notification && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 transition-all duration-500 animate-fade-in-down ${
            notification.type === "success"
              ? "bg-green-100 border border-green-200 text-green-800"
              : "bg-red-100 border border-red-200 text-red-800"
          }`}
        >
          {notification.type === "success" ? (
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          <span className="font-medium text-sm">{notification.message}</span>
        </div>
      )}
      <div style={{ display: "flex", height: "calc(100vh - 64px)" }}>
        {/* LEFT: Main Wizard Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: SPACING.L }}>
          <div style={{ maxWidth: "896px", margin: "0 auto" }}>
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: SPACING.L,
                gap: SPACING.M,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: SPACING.M,
                }}
              >
                {tx?.productImage && (
                  <img
                    src={tx.productImage}
                    alt="Product"
                    style={{
                      width: "64px",
                      height: "64px",
                      objectFit: "cover",
                      borderRadius: BORDER_RADIUS.MEDIUM,
                      boxShadow: SHADOWS.SUBTLE,
                    }}
                  />
                )}
                <div>
                  <h1
                    style={{
                      fontSize: "24px",
                      fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                      color: COLORS.MIDNIGHT_ASH,
                      marginBottom: SPACING.S,
                    }}
                  >
                    {tx?.productName ||
                      `Transaction #${tx?.id ? tx.id.slice(0, 8) : "..."}`}
                  </h1>
                  <p
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_LABEL,
                      color: COLORS.PEBBLE,
                    }}
                  >
                    Viewing as{" "}
                    <span
                      style={{
                        fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                        color: COLORS.MIDNIGHT_ASH,
                      }}
                    >
                      {userRole === "buyer" ? "Bidder" : "Seller"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Seller Cancel Button */}
              {isSeller && !isCompleted && !isCancelled && (
                <button
                  onClick={() => setCancelModalOpen(true)}
                  className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-100 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Cancel Transaction & Rate -1
                </button>
              )}
            </div>

            {/* Stepper */}
            <div
              style={{
                backgroundColor: COLORS.WHITE,
                padding: SPACING.L,
                borderRadius: BORDER_RADIUS.MEDIUM,
                boxShadow: SHADOWS.SUBTLE,
                marginBottom: SPACING.L,
              }}
            >
              <TransactionStepper current={isCancelled ? -1 : currentStep} />
            </div>

            {/* Step Content */}
            <div
              style={{
                backgroundColor: COLORS.WHITE,
                padding: SPACING.L,
                borderRadius: BORDER_RADIUS.MEDIUM,
                boxShadow: SHADOWS.SUBTLE,
                transition: "all 0.4s ease-in-out",
                opacity: tx ? 1 : 0.95,
              }}
            >
              {/* STEP 1: CREATE (Buyer View) */}
              {currentStep === 1 && isBuyer && (
                <div style={{ animation: "fadeSlideIn 0.4s ease-out" }}>
                  {tx?.status === ORDER_STATUS.PENDING_SELLER_CONFIRMATION ? (
                    /* Waiting State */
                    <div
                      style={{
                        backgroundColor: "#F0FDF4",
                        padding: SPACING.L,
                        borderRadius: BORDER_RADIUS.MEDIUM,
                        border: `1px solid #BBF7D0`,
                      }}
                    >
                      <h3
                        style={{
                          fontSize: TYPOGRAPHY.SIZE_HEADING_SM,
                          fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                          color: "#16A34A",
                        }}
                      >
                        ✓ Order Submitted
                      </h3>
                      <p style={{ color: "#16A34A" }}>
                        Waiting for seller to confirm payment.
                      </p>
                    </div>
                  ) : (
                    /* Form State */
                    <div>
                      <h3
                        style={{
                          fontSize: TYPOGRAPHY.SIZE_HEADING_SM,
                          fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                          color: COLORS.MIDNIGHT_ASH,
                          marginBottom: SPACING.S,
                        }}
                      >
                        Step 1 — Provide Payment & Delivery Address
                      </h3>

                      {/* Form Inputs */}
                      <div
                        style={{
                          backgroundColor: COLORS.SOFT_CLOUD,
                          padding: SPACING.L,
                          borderRadius: BORDER_RADIUS.MEDIUM,
                          marginBottom: SPACING.L,
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: SPACING.M,
                          }}
                        >
                          <input
                            name="firstName"
                            placeholder="First Name"
                            onChange={handleInputChange}
                            style={{
                              padding: SPACING.M,
                              border: "1px solid #ddd",
                              borderRadius: BORDER_RADIUS.MEDIUM,
                            }}
                          />
                          <input
                            name="lastName"
                            placeholder="Last Name"
                            onChange={handleInputChange}
                            style={{
                              padding: SPACING.M,
                              border: "1px solid #ddd",
                              borderRadius: BORDER_RADIUS.MEDIUM,
                            }}
                          />
                          <input
                            name="address"
                            placeholder="Address"
                            onChange={handleInputChange}
                            style={{
                              padding: SPACING.M,
                              border: "1px solid #ddd",
                              borderRadius: BORDER_RADIUS.MEDIUM,
                              gridColumn: "1 / -1",
                            }}
                          />
                          <input
                            name="city"
                            placeholder="City"
                            onChange={handleInputChange}
                            style={{
                              padding: SPACING.M,
                              border: "1px solid #ddd",
                              borderRadius: BORDER_RADIUS.MEDIUM,
                            }}
                          />
                          <input
                            name="phone"
                            placeholder="Phone"
                            onChange={handleInputChange}
                            style={{
                              padding: SPACING.M,
                              border: "1px solid #ddd",
                              borderRadius: BORDER_RADIUS.MEDIUM,
                            }}
                          />
                        </div>
                      </div>

                      {/* Payment Proof */}
                      <div style={{ marginBottom: SPACING.L }}>
                        <label
                          style={{
                            display: "block",
                            marginBottom: SPACING.S,
                            fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                          }}
                        >
                          Upload Payment Proof
                        </label>
                        <div
                          style={{
                            padding: SPACING.L,
                            border: "2px dashed #ccc",
                            borderRadius: BORDER_RADIUS.MEDIUM,
                            textAlign: "center",
                          }}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              setPaymentProofFile(e.target.files?.[0])
                            }
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleCreateOrder}
                        disabled={!isFormValid}
                        style={{
                          width: "100%",
                          backgroundColor: isFormValid
                            ? COLORS.MIDNIGHT_ASH
                            : COLORS.PEBBLE,
                          color: COLORS.WHITE,
                          padding: SPACING.M,
                          borderRadius: BORDER_RADIUS.MEDIUM,
                          border: "none",
                          cursor: isFormValid ? "pointer" : "not-allowed",
                        }}
                      >
                        Submit Payment & Address
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 1: SELLER WAITING */}
              {currentStep === 1 && isSeller && (
                <div style={{ textAlign: "center", padding: SPACING.XXL }}>
                  <div style={{ fontSize: "40px", marginBottom: SPACING.M }}>
                    ⏳
                  </div>
                  <h3 style={{ fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD }}>
                    Waiting for Buyer
                  </h3>
                  <p style={{ color: COLORS.PEBBLE }}>
                    The buyer is creating the order.
                  </p>
                </div>
              )}

              {/* STEP 2: SELLER SHIP */}
              {currentStep === 2 && isSeller && (
                <div style={{ animation: "fadeSlideIn 0.4s ease-out" }}>
                  <h3
                    style={{
                      fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                      marginBottom: SPACING.L,
                    }}
                  >
                    Step 2 — Verify Payment & Ship
                  </h3>

                  {/* Proof Display */}
                  <div
                    style={{
                      backgroundColor: COLORS.SOFT_CLOUD,
                      padding: SPACING.M,
                      borderRadius: BORDER_RADIUS.MEDIUM,
                      marginBottom: SPACING.L,
                    }}
                  >
                    <p>
                      <strong>Ship To:</strong> {tx.shipping_address}
                    </p>
                    <p>
                      <strong>Payment Proof:</strong>
                    </p>
                    {tx.payment_proof_image ? (
                      <a
                        href={tx.payment_proof_image}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: "#2563EB",
                          textDecoration: "underline",
                        }}
                      >
                        View Proof Image
                      </a>
                    ) : (
                      <span style={{ color: "#DC2626", fontWeight: "bold" }}>
                        Not Uploaded
                      </span>
                    )}
                  </div>

                  <ShippingInvoiceForm onSubmit={handleSellerConfirm} />
                </div>
              )}

              {/* STEP 2: BUYER WAITING */}
              {currentStep === 2 && isBuyer && (
                <div style={{ textAlign: "center", padding: SPACING.XXL }}>
                  <div style={{ fontSize: "40px", marginBottom: SPACING.M }}>
                    📦
                  </div>
                  <h3 style={{ fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD }}>
                    Processing
                  </h3>
                  <p style={{ color: COLORS.PEBBLE }}>
                    Seller is verifying your payment.
                  </p>
                </div>
              )}

              {/* STEP 3: BUYER CONFIRM RECEIPT */}
              {currentStep === 3 && isBuyer && (
                <div style={{ animation: "fadeSlideIn 0.4s ease-out" }}>
                  <h3
                    style={{
                      fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                      marginBottom: SPACING.L,
                    }}
                  >
                    Step 3 — Confirm Receipt
                  </h3>
                  <div
                    style={{
                      backgroundColor: COLORS.SOFT_CLOUD,
                      padding: SPACING.M,
                      borderRadius: BORDER_RADIUS.MEDIUM,
                      marginBottom: SPACING.L,
                    }}
                  >
                    <p>
                      <strong>Tracking Code:</strong> {tx.shipping_code}
                    </p>
                  </div>
                  <button
                    onClick={handleBuyerConfirmReceipt}
                    style={{
                      width: "100%",
                      backgroundColor: COLORS.MIDNIGHT_ASH,
                      color: COLORS.WHITE,
                      padding: SPACING.M,
                      borderRadius: BORDER_RADIUS.MEDIUM,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    I Have Received the Product
                  </button>
                </div>
              )}

              {/* STEP 3: SELLER WAITING */}
              {currentStep === 3 && isSeller && (
                <div style={{ textAlign: "center", padding: SPACING.XXL }}>
                  <div style={{ fontSize: "40px", marginBottom: SPACING.M }}>
                    🚚
                  </div>
                  <h3 style={{ fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD }}>
                    In Transit
                  </h3>
                  <p style={{ color: COLORS.PEBBLE }}>
                    Waiting for buyer to receive package.
                  </p>
                </div>
              )}

              {(currentStep === 4 || currentStep === 5) && (
                <div
                  style={{
                    animation: "fadeSlideIn 0.4s ease-out",
                    textAlign: "center",
                  }}
                >
                  <h3
                    style={{
                      fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                      marginBottom: SPACING.L,
                    }}
                  >
                    Step {currentStep} —{" "}
                    {currentStep === 4 ? "Rate Experience" : "Finalized"}
                  </h3>

                  {shouldShowFinalReceipt ? (
                    /* CONDITION 1: FINAL RECEIPT (Triggers if Step 5 OR if rating was just submitted/exists) */
                    <div
                      style={{
                        padding: SPACING.XXL,
                        backgroundColor: "#E0F2F1", // Light Cyan/Teal
                        borderRadius: BORDER_RADIUS.MEDIUM,
                        border: "1px solid #2DD4BF", // Teal border
                        color: "#0D9488", // Dark Teal text
                      }}
                    >
                      <CheckCircleIcon
                        style={{
                          width: "40px",
                          margin: "0 auto",
                          marginBottom: SPACING.M,
                        }}
                      />
                      <h4
                        style={{
                          fontWeight: TYPOGRAPHY.WEIGHT_BOLD,
                          fontSize: TYPOGRAPHY.SIZE_HEADING_SM,
                        }}
                      >
                        Transaction Complete!
                      </h4>
                      <p style={{ marginTop: SPACING.S }}>
                        Thank you for using eBid. All steps are finalized.
                        {currentStep === 4 &&
                          " (Waiting for counterparty rating to move to Step 5)"}{" "}
                        {/* Helpful message */}
                      </p>
                    </div>
                  ) : (
                    /* CONDITION 2: ACTIVE RATING FORM */
                    <div>
                      {/* Your active Rating Buttons, Textarea, and Submit Button JSX go here */}
                      {/* ... (Copy the full rating form block from your Step 4 logic) ... */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: SPACING.L,
                          marginBottom: SPACING.L,
                        }}
                      >
                        {/* ... Thumb Up/Down Buttons ... */}
                        <button
                          onClick={() => setSelectedRating(1)}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: SPACING.S,
                            padding: SPACING.L,
                            backgroundColor:
                              selectedRating === 1
                                ? "#F0FDF4"
                                : COLORS.SOFT_CLOUD,
                            border:
                              selectedRating === 1
                                ? `2px solid #16A34A`
                                : `2px solid transparent`,
                            borderRadius: BORDER_RADIUS.MEDIUM,
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            minWidth: "100px",
                            transform:
                              selectedRating === 1 ? "scale(1.05)" : "scale(1)",
                          }}
                        >
                          <HandThumbUpIcon
                            style={{ width: "30px", color: "#16A34A" }}
                          />{" "}
                          +1
                        </button>
                        <button
                          onClick={() => setSelectedRating(-1)}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: SPACING.S,
                            padding: SPACING.L,
                            backgroundColor:
                              selectedRating === -1
                                ? "#FEF2F2"
                                : COLORS.SOFT_CLOUD,
                            border:
                              selectedRating === -1
                                ? `2px solid #DC2626`
                                : `2px solid transparent`,
                            borderRadius: BORDER_RADIUS.MEDIUM,
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            minWidth: "100px",
                            transform:
                              selectedRating === -1
                                ? "scale(1.05)"
                                : "scale(1)",
                          }}
                        >
                          <HandThumbDownIcon
                            style={{ width: "30px", color: "#DC2626" }}
                          />{" "}
                          -1
                        </button>
                      </div>
                      <textarea
                        value={ratingComment}
                        onChange={(e) => setRatingComment(e.target.value)}
                        placeholder="Comment..."
                        style={{
                          width: "100%",
                          padding: SPACING.M,
                          border: "1px solid #ccc",
                          borderRadius: BORDER_RADIUS.MEDIUM,
                          marginBottom: SPACING.M,
                        }}
                      />
                      <button
                        onClick={handleRatingSubmit}
                        disabled={!selectedRating}
                        style={{
                          width: "100%",
                          padding: `${SPACING.M} ${SPACING.L}`,
                          backgroundColor: selectedRating
                            ? COLORS.MIDNIGHT_ASH
                            : COLORS.PEBBLE,
                          color: COLORS.WHITE,
                          border: "none",
                          borderRadius: BORDER_RADIUS.MEDIUM,
                          fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                          fontSize: TYPOGRAPHY.SIZE_BODY,
                          cursor: selectedRating ? "pointer" : "not-allowed",
                          transition: "all 0.3s ease",
                        }}
                      >
                        Submit Rating
                      </button>
                    </div>
                  )}
                </div>
              )}
              {currentStep === 5 && (
                <button
                  onClick={() => navigate("/transactions")} // Navigate to the history list
                  style={{
                    backgroundColor: COLORS.MIDNIGHT_ASH,
                    color: COLORS.WHITE,
                    padding: `${SPACING.S} ${SPACING.M}`,
                    borderRadius: BORDER_RADIUS.MEDIUM,
                    border: "none",
                    fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,

                    cursor: "pointer",
                    marginTop: SPACING.M, // Give it some space
                    transition: "background-color 0.2s",
                    // Adding hover effect (Requires styling solution to handle :hover)
                    // ':hover': { backgroundColor: '#334155' }
                  }}
                >
                  View Transaction History
                </button>
              )}
              {isCancelled && (
                <div
                  style={{
                    textAlign: "center",
                    color: "#DC2626",
                    fontWeight: "bold",
                    padding: SPACING.L,
                  }}
                >
                  Transaction Cancelled
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div
          style={{
            position: "fixed",
            top: "24px", // Move to TOP
            left: "50%", // Center horizontally
            transform: "translateX(-50%)",
            zIndex: 9999, // Ensure it is above everything
            backgroundColor: "#1F2937", // Dark Gray (Tailwind gray-800)
            color: "#FFFFFF",
            padding: "12px 24px",
            borderRadius: "9999px", // Capsule shape
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            minWidth: "300px",
            justifyContent: "center",
            animation: "slideDown 0.3s ease-out forwards", // Add animation
          }}
        >
          {/* Optional Icon based on success/error */}
          <span style={{ fontSize: "18px" }}>🔔</span>

          <span style={{ fontWeight: 500, fontSize: "14px" }}>{toast}</span>
        </div>
      )}

      {/* Add this Animation Style tag just before the closing div if you don't have it in CSS */}
      <style>
        {`
          @keyframes slideDown {
            from { transform: translate(-50%, -20px); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
          }
        `}
      </style>
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onSubmit={handleCancelSubmit}
      />
    </div>
  );
}
