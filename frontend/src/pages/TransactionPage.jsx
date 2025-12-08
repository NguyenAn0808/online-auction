import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import TransactionStepper from "../components/TransactionStepper";
import TransactionSummary from "../components/TransactionSummary";
import PaymentInvoiceForm from "../components/PaymentInvoiceForm";
import ShippingInvoiceForm from "../components/ShippingInvoiceForm";
import { Radio, RadioGroup } from "@headlessui/react";
import { HandThumbUpIcon, HandThumbDownIcon } from "@heroicons/react/24/solid";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import {
  getTransaction,
  updateTransaction,
  listTransactions,
  STATUS,
} from "../services/transactionService";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/designSystem";

const deliveryMethods = [
  {
    id: 1,
    title: "Standard",
    turnaround: "4–10 business days",
    price: "$5.00",
  },
  { id: 2, title: "Express", turnaround: "2–5 business days", price: "$16.00" },
];

const paymentMethods = [
  { id: "bank", title: "Bank Transfer", description: "Direct bank transfer" },
  { id: "paypal", title: "PayPal", description: "Pay with PayPal account" },
  { id: "card", title: "Credit Card", description: "Visa, Mastercard, etc." },
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
  const { transactionId } = useParams();
  const auth = useMockAuth();
  const [tx, setTx] = useState(null);
  const [toast, setToast] = useState(null);

  // Step 1 Form State (Checkout-style)
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    company: "",
    address: "",
    apartment: "",
    city: "",
    country: "United States",
    region: "",
    postalCode: "",
    phone: "",
  });
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState(
    deliveryMethods[0]
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    paymentMethods[0]
  );
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentProofFile, setPaymentProofFile] = useState(null);

  // Step 4: Rating state
  const [ratingComment, setRatingComment] = useState("");
  const [selectedRating, setSelectedRating] = useState(null); // 1 or -1

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  const isFormValid =
    formData.firstName &&
    formData.lastName &&
    formData.address &&
    formData.city &&
    formData.phone;

  // Load transaction
  useEffect(() => {
    if (transactionId) {
      const t = getTransaction(transactionId);
      if (t) {
        setTx(t);
        return;
      }
    }
    // Fallback: find existing transaction for user
    const existing = listTransactions(
      (t) => t.buyerId === auth.userId || t.sellerId === auth.userId
    )[0];
    if (existing) setTx(existing);
  }, [transactionId, auth.userId]);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  // Step 1: Buyer submits payment + address
  function handleSubmitPaymentAndAddress() {
    if (!tx || !isFormValid) return;

    const deliveryAddress = {
      ...formData,
      deliveryMethod: selectedDeliveryMethod,
    };

    const paymentInvoice = {
      method: selectedPaymentMethod.title,
      reference: paymentReference,
      proofFile: paymentProofFile?.name || null,
      submittedAt: new Date().toISOString(),
    };

    updateTransaction(tx.id, {
      deliveryAddress,
      paymentInvoice,
      status: STATUS.WAITING_SELLER_CONFIRMATION,
    });
    setTx(getTransaction(tx.id));
    showToast("Payment & address submitted — waiting for seller confirmation");
  }

  // Step 2: Seller confirms payment and sends shipping
  function handleSellerConfirm(shippingData) {
    if (!tx) return;
    updateTransaction(tx.id, {
      shippingInvoice: shippingData,
      status: STATUS.IN_TRANSIT,
    });
    setTx(getTransaction(tx.id));
    showToast("Shipping invoice sent — transaction is now IN_TRANSIT");
  }

  function handleSellerReject(reason) {
    if (!tx) return;
    updateTransaction(tx.id, {
      status: STATUS.PAYMENT_REJECTED,
      rejectionReason: reason || "Payment rejected by seller",
    });
    setTx(getTransaction(tx.id));
    showToast("Payment rejected — buyer notified");
  }

  // Seller cancel transaction (applies -1 rating)
  function handleSellerCancel() {
    if (!tx) return;
    const confirmed = window.confirm(
      "Are you sure you want to cancel this transaction? This will apply a -1 rating to the buyer."
    );
    if (!confirmed) return;

    updateTransaction(tx.id, {
      status: STATUS.COMPLETED,
      cancelledBy: "seller",
      ratings: {
        ...tx.ratings,
        seller: { score: -1, comment: "Transaction cancelled by seller" },
      },
    });
    setTx(getTransaction(tx.id));
    showToast("Transaction cancelled — -1 rating applied");
  }

  // Step 3: Buyer confirms receipt
  function handleBuyerConfirmReceipt() {
    if (!tx) return;
    updateTransaction(tx.id, { status: STATUS.COMPLETED_AWAITING_RATING });
    setTx(getTransaction(tx.id));
    showToast("Confirmed receipt — please leave a rating");
  }

  // Step 4: Rating submission
  function handleRatingSubmit(side, payload) {
    if (!tx) return;
    const ratings = { ...(tx.ratings || {}), [side]: payload };
    const completed = ratings.buyer && ratings.seller;
    updateTransaction(tx.id, {
      ratings,
      status: completed ? STATUS.COMPLETED : tx.status,
    });
    setTx(getTransaction(tx.id));
    showToast("Rating submitted");
  }

  // Determine current step based on status
  const currentStep = useMemo(() => {
    if (!tx) return 1;
    switch (tx.status) {
      case STATUS.PENDING_BUYER:
        return 1;
      case STATUS.WAITING_SELLER_CONFIRMATION:
        return auth.role === "buyer" ? 1 : 2;
      case STATUS.PAYMENT_REJECTED:
        return 1;
      case STATUS.IN_TRANSIT:
        return 3;
      case STATUS.COMPLETED_AWAITING_RATING:
        return 4; // Both buyer and seller go to step 4
      case STATUS.COMPLETED:
        return 4;
      default:
        return 1;
    }
  }, [tx, auth.role]);

  const isCompleted = tx?.status === STATUS.COMPLETED;
  const isCancelled = tx?.cancelledBy === "seller";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: COLORS.SOFT_CLOUD }}>
      {/* CSS Keyframes for smooth transitions */}
      <style>
        {`
          @keyframes fadeSlideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
        `}
      </style>
      <Header />

      <div style={{ display: "flex", height: "calc(100vh - 64px)" }}>
        {/* LEFT: Main Wizard Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: SPACING.L,
          }}
        >
          <div style={{ maxWidth: "896px", margin: "0 auto" }}>
            {/* Header with Product Info and Cancel Button */}
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
                    alt={tx.productName || "Product"}
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
                    {tx?.productName || `Transaction #${tx?.id || "..."}`}
                  </h1>
                  <p
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_LABEL,
                      color: COLORS.PEBBLE,
                    }}
                  >
                    Transaction #{tx?.id} • Viewing as{" "}
                    <span
                      style={{
                        fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                        color: COLORS.MIDNIGHT_ASH,
                      }}
                    >
                      {auth.role === "buyer" ? "Buyer" : "Seller"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Global Seller Cancel Button */}
              {auth.role === "seller" && !isCompleted && !isCancelled && (
                <button
                  onClick={handleSellerCancel}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#DC2626",
                    textDecoration: "underline",
                    fontSize: TYPOGRAPHY.SIZE_LABEL,
                    fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                    cursor: "pointer",
                  }}
                >
                  Cancel Transaction & Rate -1
                </button>
              )}
            </div>

            {/* Progress Stepper */}
            <div
              style={{
                backgroundColor: COLORS.WHITE,
                padding: SPACING.L,
                borderRadius: BORDER_RADIUS.MEDIUM,
                boxShadow: SHADOWS.SUBTLE,
                marginBottom: SPACING.L,
              }}
            >
              <TransactionStepper current={currentStep} />
            </div>

            {/* Step Content */}
            <div
              style={{
                backgroundColor: COLORS.WHITE,
                padding: SPACING.L,
                borderRadius: BORDER_RADIUS.MEDIUM,
                boxShadow: SHADOWS.SUBTLE,
                transition: "all 0.4s ease-in-out",
                opacity: tx ? 1 : 0.7,
                transform: tx ? "translateY(0)" : "translateY(10px)",
              }}
            >
              {/* STEP 1: Buyer provides payment & address */}
              {currentStep === 1 && auth.role === "buyer" && (
                <div
                  style={{
                    animation: "fadeSlideIn 0.4s ease-out",
                  }}
                >
                  {/* After submission - Show Order Summary */}
                  {tx?.status === STATUS.WAITING_SELLER_CONFIRMATION ? (
                    <div
                      style={{
                        animation: "fadeSlideIn 0.4s ease-out",
                      }}
                    >
                      {/* Success Header */}
                      <div
                        style={{
                          backgroundColor: "#F0FDF4",
                          padding: SPACING.L,
                          borderRadius: BORDER_RADIUS.MEDIUM,
                          marginBottom: SPACING.L,
                          border: `1px solid #BBF7D0`,
                        }}
                      >
                        <h3
                          style={{
                            fontSize: TYPOGRAPHY.SIZE_HEADING_SM,
                            fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                            color: "#16A34A",
                            marginBottom: SPACING.S,
                          }}
                        >
                          ✓ Payment & Address Submitted
                        </h3>
                        <p
                          style={{
                            fontSize: TYPOGRAPHY.SIZE_BODY,
                            color: "#16A34A",
                          }}
                        >
                          Your payment details and delivery address have been
                          sent to the seller. Waiting for confirmation.
                        </p>
                      </div>

                      {/* Order Summary */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: SPACING.L,
                        }}
                      >
                        {/* Shipping Address */}
                        <div
                          style={{
                            backgroundColor: COLORS.SOFT_CLOUD,
                            padding: SPACING.L,
                            borderRadius: BORDER_RADIUS.MEDIUM,
                          }}
                        >
                          <h4
                            style={{
                              fontSize: TYPOGRAPHY.SIZE_BODY,
                              fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                              color: COLORS.MIDNIGHT_ASH,
                              marginBottom: SPACING.M,
                            }}
                          >
                            Shipping Address
                          </h4>
                          <div
                            style={{
                              fontSize: TYPOGRAPHY.SIZE_BODY,
                              color: COLORS.MIDNIGHT_ASH,
                              lineHeight: 1.6,
                            }}
                          >
                            <p
                              style={{
                                margin: 0,
                                fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                              }}
                            >
                              {tx.deliveryAddress?.firstName}{" "}
                              {tx.deliveryAddress?.lastName}
                            </p>
                            {tx.deliveryAddress?.company && (
                              <p style={{ margin: 0 }}>
                                {tx.deliveryAddress.company}
                              </p>
                            )}
                            <p style={{ margin: 0 }}>
                              {tx.deliveryAddress?.address}
                            </p>
                            {tx.deliveryAddress?.apartment && (
                              <p style={{ margin: 0 }}>
                                {tx.deliveryAddress.apartment}
                              </p>
                            )}
                            <p style={{ margin: 0 }}>
                              {tx.deliveryAddress?.city},{" "}
                              {tx.deliveryAddress?.region}{" "}
                              {tx.deliveryAddress?.postalCode}
                            </p>
                            <p style={{ margin: 0 }}>
                              {tx.deliveryAddress?.country}
                            </p>
                            <p style={{ margin: 0, marginTop: SPACING.S }}>
                              📞 {tx.deliveryAddress?.phone}
                            </p>
                          </div>
                        </div>

                        {/* Payment Details */}
                        <div
                          style={{
                            backgroundColor: COLORS.SOFT_CLOUD,
                            padding: SPACING.L,
                            borderRadius: BORDER_RADIUS.MEDIUM,
                          }}
                        >
                          <h4
                            style={{
                              fontSize: TYPOGRAPHY.SIZE_BODY,
                              fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                              color: COLORS.MIDNIGHT_ASH,
                              marginBottom: SPACING.M,
                            }}
                          >
                            Payment Method
                          </h4>
                          <div
                            style={{
                              fontSize: TYPOGRAPHY.SIZE_BODY,
                              color: COLORS.MIDNIGHT_ASH,
                              lineHeight: 1.6,
                            }}
                          >
                            <p
                              style={{
                                margin: 0,
                                fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                              }}
                            >
                              {tx.paymentInvoice?.method}
                            </p>
                            {tx.paymentInvoice?.reference && (
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: TYPOGRAPHY.SIZE_LABEL,
                                  color: COLORS.PEBBLE,
                                }}
                              >
                                Ref: {tx.paymentInvoice.reference}
                              </p>
                            )}
                            {tx.paymentInvoice?.proofFile && (
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: TYPOGRAPHY.SIZE_LABEL,
                                  color: COLORS.PEBBLE,
                                }}
                              >
                                📎 {tx.paymentInvoice.proofFile}
                              </p>
                            )}
                          </div>

                          <h4
                            style={{
                              fontSize: TYPOGRAPHY.SIZE_BODY,
                              fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                              color: COLORS.MIDNIGHT_ASH,
                              marginTop: SPACING.L,
                              marginBottom: SPACING.M,
                            }}
                          >
                            Delivery Method
                          </h4>
                          <div
                            style={{
                              fontSize: TYPOGRAPHY.SIZE_BODY,
                              color: COLORS.MIDNIGHT_ASH,
                            }}
                          >
                            <p
                              style={{
                                margin: 0,
                                fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                              }}
                            >
                              {tx.deliveryAddress?.deliveryMethod?.title}
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontSize: TYPOGRAPHY.SIZE_LABEL,
                                color: COLORS.PEBBLE,
                              }}
                            >
                              {tx.deliveryAddress?.deliveryMethod?.turnaround}
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                                marginTop: SPACING.S,
                              }}
                            >
                              {tx.deliveryAddress?.deliveryMethod?.price}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Waiting indicator */}
                      <div
                        style={{
                          marginTop: SPACING.L,
                          textAlign: "center",
                          padding: SPACING.L,
                          backgroundColor: "#FEF3C7",
                          borderRadius: BORDER_RADIUS.MEDIUM,
                          border: `1px solid #FDE68A`,
                        }}
                      >
                        <p
                          style={{
                            fontSize: TYPOGRAPHY.SIZE_BODY,
                            color: "#D97706",
                            fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                            margin: 0,
                          }}
                        >
                          ⏳ Waiting for seller to confirm payment and send
                          shipping invoice...
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Before submission - Show Form */
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
                      <p
                        style={{
                          fontSize: TYPOGRAPHY.SIZE_BODY,
                          color: COLORS.PEBBLE,
                          marginBottom: SPACING.L,
                        }}
                      >
                        Complete your payment details and shipping information
                        below.
                      </p>

                      {/* Contact Information */}
                      <div
                        style={{
                          backgroundColor: COLORS.SOFT_CLOUD,
                          padding: SPACING.L,
                          borderRadius: BORDER_RADIUS.MEDIUM,
                          marginBottom: SPACING.L,
                        }}
                      >
                        <h4
                          style={{
                            fontSize: TYPOGRAPHY.SIZE_BODY,
                            fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                            color: COLORS.MIDNIGHT_ASH,
                            marginBottom: SPACING.M,
                          }}
                        >
                          Contact information
                        </h4>
                        <div>
                          <label
                            htmlFor="email"
                            style={{
                              display: "block",
                              fontSize: TYPOGRAPHY.SIZE_LABEL,
                              fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                              color: COLORS.MIDNIGHT_ASH,
                              marginBottom: SPACING.S,
                            }}
                          >
                            Email address
                          </label>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            autoComplete="email"
                            style={{
                              width: "100%",
                              padding: SPACING.M,
                              fontSize: TYPOGRAPHY.SIZE_BODY,
                              borderRadius: BORDER_RADIUS.MEDIUM,
                              border: `1px solid rgba(200,200,200,0.33)`,
                              outline: "none",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>
                      </div>

                      {/* Shipping Information */}
                      <div
                        style={{
                          backgroundColor: COLORS.SOFT_CLOUD,
                          padding: SPACING.L,
                          borderRadius: BORDER_RADIUS.MEDIUM,
                          marginBottom: SPACING.L,
                        }}
                      >
                        <h4
                          style={{
                            fontSize: TYPOGRAPHY.SIZE_BODY,
                            fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                            color: COLORS.MIDNIGHT_ASH,
                            marginBottom: SPACING.M,
                          }}
                        >
                          Shipping information
                        </h4>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: SPACING.M,
                          }}
                        >
                          {/* First Name */}
                          <div>
                            <label
                              htmlFor="firstName"
                              style={{
                                display: "block",
                                fontSize: TYPOGRAPHY.SIZE_LABEL,
                                fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                                color: COLORS.MIDNIGHT_ASH,
                                marginBottom: SPACING.S,
                              }}
                            >
                              First name
                            </label>
                            <input
                              id="firstName"
                              name="firstName"
                              type="text"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              autoComplete="given-name"
                              style={{
                                width: "100%",
                                padding: SPACING.M,
                                fontSize: TYPOGRAPHY.SIZE_BODY,
                                borderRadius: BORDER_RADIUS.MEDIUM,
                                border: `1px solid rgba(200,200,200,0.33)`,
                                outline: "none",
                                boxSizing: "border-box",
                              }}
                            />
                          </div>

                          {/* Last Name */}
                          <div>
                            <label
                              htmlFor="lastName"
                              style={{
                                display: "block",
                                fontSize: TYPOGRAPHY.SIZE_LABEL,
                                fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                                color: COLORS.MIDNIGHT_ASH,
                                marginBottom: SPACING.S,
                              }}
                            >
                              Last name
                            </label>
                            <input
                              id="lastName"
                              name="lastName"
                              type="text"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              autoComplete="family-name"
                              style={{
                                width: "100%",
                                padding: SPACING.M,
                                fontSize: TYPOGRAPHY.SIZE_BODY,
                                borderRadius: BORDER_RADIUS.MEDIUM,
                                border: `1px solid rgba(200,200,200,0.33)`,
                                outline: "none",
                                boxSizing: "border-box",
                              }}
                            />
                          </div>

                          {/* Company (full width) */}
                          <div style={{ gridColumn: "1 / -1" }}>
                            <label
                              htmlFor="company"
                              style={{
                                display: "block",
                                fontSize: TYPOGRAPHY.SIZE_LABEL,
                                fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                                color: COLORS.MIDNIGHT_ASH,
                                marginBottom: SPACING.S,
                              }}
                            >
                              Company (optional)
                            </label>
                            <input
                              id="company"
                              name="company"
                              type="text"
                              value={formData.company}
                              onChange={handleInputChange}
                              autoComplete="organization"
                              style={{
                                width: "100%",
                                padding: SPACING.M,
                                fontSize: TYPOGRAPHY.SIZE_BODY,
                                borderRadius: BORDER_RADIUS.MEDIUM,
                                border: `1px solid rgba(200,200,200,0.33)`,
                                outline: "none",
                                boxSizing: "border-box",
                              }}
                            />
                          </div>

                          {/* Address (full width) */}
                          <div style={{ gridColumn: "1 / -1" }}>
                            <label
                              htmlFor="address"
                              style={{
                                display: "block",
                                fontSize: TYPOGRAPHY.SIZE_LABEL,
                                fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                                color: COLORS.MIDNIGHT_ASH,
                                marginBottom: SPACING.S,
                              }}
                            >
                              Address
                            </label>
                            <input
                              id="address"
                              name="address"
                              type="text"
                              value={formData.address}
                              onChange={handleInputChange}
                              autoComplete="street-address"
                              style={{
                                width: "100%",
                                padding: SPACING.M,
                                fontSize: TYPOGRAPHY.SIZE_BODY,
                                borderRadius: BORDER_RADIUS.MEDIUM,
                                border: `1px solid rgba(200,200,200,0.33)`,
                                outline: "none",
                                boxSizing: "border-box",
                              }}
                            />
                          </div>

                          {/* Apartment (full width) */}
                          <div style={{ gridColumn: "1 / -1" }}>
                            <label
                              htmlFor="apartment"
                              style={{
                                display: "block",
                                fontSize: TYPOGRAPHY.SIZE_LABEL,
                                fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                                color: COLORS.MIDNIGHT_ASH,
                                marginBottom: SPACING.S,
                              }}
                            >
                              Apartment, suite, etc. (optional)
                            </label>
                            <input
                              id="apartment"
                              name="apartment"
                              type="text"
                              value={formData.apartment}
                              onChange={handleInputChange}
                              style={{
                                width: "100%",
                                padding: SPACING.M,
                                fontSize: TYPOGRAPHY.SIZE_BODY,
                                borderRadius: BORDER_RADIUS.MEDIUM,
                                border: `1px solid rgba(200,200,200,0.33)`,
                                outline: "none",
                                boxSizing: "border-box",
                              }}
                            />
                          </div>

                          {/* City */}
                          <div>
                            <label
                              htmlFor="city"
                              style={{
                                display: "block",
                                fontSize: TYPOGRAPHY.SIZE_LABEL,
                                fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                                color: COLORS.MIDNIGHT_ASH,
                                marginBottom: SPACING.S,
                              }}
                            >
                              City
                            </label>
                            <input
                              id="city"
                              name="city"
                              type="text"
                              value={formData.city}
                              onChange={handleInputChange}
                              autoComplete="address-level2"
                              style={{
                                width: "100%",
                                padding: SPACING.M,
                                fontSize: TYPOGRAPHY.SIZE_BODY,
                                borderRadius: BORDER_RADIUS.MEDIUM,
                                border: `1px solid rgba(200,200,200,0.33)`,
                                outline: "none",
                                boxSizing: "border-box",
                              }}
                            />
                          </div>

                          {/* Country */}
                          <div>
                            <label
                              htmlFor="country"
                              style={{
                                display: "block",
                                fontSize: TYPOGRAPHY.SIZE_LABEL,
                                fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                                color: COLORS.MIDNIGHT_ASH,
                                marginBottom: SPACING.S,
                              }}
                            >
                              Country
                            </label>
                            <div style={{ position: "relative" }}>
                              <select
                                id="country"
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                autoComplete="country-name"
                                style={{
                                  width: "100%",
                                  padding: SPACING.M,
                                  paddingRight: SPACING.XL,
                                  fontSize: TYPOGRAPHY.SIZE_BODY,
                                  borderRadius: BORDER_RADIUS.MEDIUM,
                                  border: `1px solid rgba(200,200,200,0.33)`,
                                  outline: "none",
                                  appearance: "none",
                                  backgroundColor: COLORS.WHITE,
                                  boxSizing: "border-box",
                                }}
                              >
                                <option>United States</option>
                                <option>Canada</option>
                                <option>United Kingdom</option>
                                <option>Australia</option>
                                <option>Germany</option>
                                <option>France</option>
                              </select>
                              <ChevronDownIcon
                                style={{
                                  position: "absolute",
                                  right: SPACING.M,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  width: "16px",
                                  height: "16px",
                                  color: COLORS.PEBBLE,
                                  pointerEvents: "none",
                                }}
                              />
                            </div>
                          </div>

                          {/* Region/State */}
                          <div>
                            <label
                              htmlFor="region"
                              style={{
                                display: "block",
                                fontSize: TYPOGRAPHY.SIZE_LABEL,
                                fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                                color: COLORS.MIDNIGHT_ASH,
                                marginBottom: SPACING.S,
                              }}
                            >
                              State / Province
                            </label>
                            <input
                              id="region"
                              name="region"
                              type="text"
                              value={formData.region}
                              onChange={handleInputChange}
                              autoComplete="address-level1"
                              style={{
                                width: "100%",
                                padding: SPACING.M,
                                fontSize: TYPOGRAPHY.SIZE_BODY,
                                borderRadius: BORDER_RADIUS.MEDIUM,
                                border: `1px solid rgba(200,200,200,0.33)`,
                                outline: "none",
                                boxSizing: "border-box",
                              }}
                            />
                          </div>

                          {/* Postal Code */}
                          <div>
                            <label
                              htmlFor="postalCode"
                              style={{
                                display: "block",
                                fontSize: TYPOGRAPHY.SIZE_LABEL,
                                fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                                color: COLORS.MIDNIGHT_ASH,
                                marginBottom: SPACING.S,
                              }}
                            >
                              Postal code
                            </label>
                            <input
                              id="postalCode"
                              name="postalCode"
                              type="text"
                              value={formData.postalCode}
                              onChange={handleInputChange}
                              autoComplete="postal-code"
                              style={{
                                width: "100%",
                                padding: SPACING.M,
                                fontSize: TYPOGRAPHY.SIZE_BODY,
                                borderRadius: BORDER_RADIUS.MEDIUM,
                                border: `1px solid rgba(200,200,200,0.33)`,
                                outline: "none",
                                boxSizing: "border-box",
                              }}
                            />
                          </div>

                          {/* Phone (full width) */}
                          <div style={{ gridColumn: "1 / -1" }}>
                            <label
                              htmlFor="phone"
                              style={{
                                display: "block",
                                fontSize: TYPOGRAPHY.SIZE_LABEL,
                                fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                                color: COLORS.MIDNIGHT_ASH,
                                marginBottom: SPACING.S,
                              }}
                            >
                              Phone
                            </label>
                            <input
                              id="phone"
                              name="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={handleInputChange}
                              autoComplete="tel"
                              style={{
                                width: "100%",
                                padding: SPACING.M,
                                fontSize: TYPOGRAPHY.SIZE_BODY,
                                borderRadius: BORDER_RADIUS.MEDIUM,
                                border: `1px solid rgba(200,200,200,0.33)`,
                                outline: "none",
                                boxSizing: "border-box",
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Delivery Method */}
                      <div
                        style={{
                          backgroundColor: COLORS.SOFT_CLOUD,
                          padding: SPACING.L,
                          borderRadius: BORDER_RADIUS.MEDIUM,
                          marginBottom: SPACING.L,
                        }}
                      >
                        <h4
                          style={{
                            fontSize: TYPOGRAPHY.SIZE_BODY,
                            fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                            color: COLORS.MIDNIGHT_ASH,
                            marginBottom: SPACING.M,
                          }}
                        >
                          Delivery method
                        </h4>
                        <RadioGroup
                          value={selectedDeliveryMethod}
                          onChange={setSelectedDeliveryMethod}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: SPACING.M,
                          }}
                        >
                          {deliveryMethods.map((method) => (
                            <Radio
                              key={method.id}
                              value={method}
                              style={{
                                position: "relative",
                                display: "flex",
                                alignItems: "center",
                                padding: SPACING.M,
                                borderRadius: BORDER_RADIUS.MEDIUM,
                                border:
                                  selectedDeliveryMethod.id === method.id
                                    ? `2px solid ${COLORS.MIDNIGHT_ASH}`
                                    : `1px solid rgba(200,200,200,0.33)`,
                                backgroundColor: COLORS.WHITE,
                                cursor: "pointer",
                              }}
                            >
                              <span style={{ flex: 1 }}>
                                <span
                                  style={{
                                    display: "block",
                                    fontSize: TYPOGRAPHY.SIZE_BODY,
                                    fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                                    color: COLORS.MIDNIGHT_ASH,
                                  }}
                                >
                                  {method.title}
                                </span>
                                <span
                                  style={{
                                    display: "block",
                                    fontSize: TYPOGRAPHY.SIZE_LABEL,
                                    color: COLORS.PEBBLE,
                                  }}
                                >
                                  {method.turnaround}
                                </span>
                                <span
                                  style={{
                                    display: "block",
                                    fontSize: TYPOGRAPHY.SIZE_BODY,
                                    fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                                    color: COLORS.MIDNIGHT_ASH,
                                    marginTop: SPACING.S,
                                  }}
                                >
                                  {method.price}
                                </span>
                              </span>
                              {selectedDeliveryMethod.id === method.id && (
                                <CheckCircleIcon
                                  style={{
                                    width: "20px",
                                    height: "20px",
                                    color: COLORS.MIDNIGHT_ASH,
                                  }}
                                />
                              )}
                            </Radio>
                          ))}
                        </RadioGroup>
                      </div>

                      {/* Payment Method */}
                      <div
                        style={{
                          backgroundColor: COLORS.SOFT_CLOUD,
                          padding: SPACING.L,
                          borderRadius: BORDER_RADIUS.MEDIUM,
                          marginBottom: SPACING.L,
                        }}
                      >
                        <h4
                          style={{
                            fontSize: TYPOGRAPHY.SIZE_BODY,
                            fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                            color: COLORS.MIDNIGHT_ASH,
                            marginBottom: SPACING.M,
                          }}
                        >
                          Payment method
                        </h4>
                        <RadioGroup
                          value={selectedPaymentMethod}
                          onChange={setSelectedPaymentMethod}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: SPACING.S,
                          }}
                        >
                          {paymentMethods.map((method) => (
                            <Radio
                              key={method.id}
                              value={method}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                padding: SPACING.M,
                                borderRadius: BORDER_RADIUS.MEDIUM,
                                border:
                                  selectedPaymentMethod.id === method.id
                                    ? `2px solid ${COLORS.MIDNIGHT_ASH}`
                                    : `1px solid rgba(200,200,200,0.33)`,
                                backgroundColor: COLORS.WHITE,
                                cursor: "pointer",
                              }}
                            >
                              <span style={{ flex: 1 }}>
                                <span
                                  style={{
                                    display: "block",
                                    fontSize: TYPOGRAPHY.SIZE_BODY,
                                    fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                                    color: COLORS.MIDNIGHT_ASH,
                                  }}
                                >
                                  {method.title}
                                </span>
                                <span
                                  style={{
                                    fontSize: TYPOGRAPHY.SIZE_LABEL,
                                    color: COLORS.PEBBLE,
                                  }}
                                >
                                  {method.description}
                                </span>
                              </span>
                              {selectedPaymentMethod.id === method.id && (
                                <CheckCircleIcon
                                  style={{
                                    width: "20px",
                                    height: "20px",
                                    color: COLORS.MIDNIGHT_ASH,
                                  }}
                                />
                              )}
                            </Radio>
                          ))}
                        </RadioGroup>

                        {/* Payment Reference */}
                        <div style={{ marginTop: SPACING.M }}>
                          <label
                            htmlFor="paymentReference"
                            style={{
                              display: "block",
                              fontSize: TYPOGRAPHY.SIZE_LABEL,
                              fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                              color: COLORS.MIDNIGHT_ASH,
                              marginBottom: SPACING.S,
                            }}
                          >
                            Payment reference / Transaction ID
                          </label>
                          <input
                            id="paymentReference"
                            type="text"
                            value={paymentReference}
                            onChange={(e) =>
                              setPaymentReference(e.target.value)
                            }
                            placeholder="e.g., TXN-123456789"
                            style={{
                              width: "100%",
                              padding: SPACING.M,
                              fontSize: TYPOGRAPHY.SIZE_BODY,
                              borderRadius: BORDER_RADIUS.MEDIUM,
                              border: `1px solid rgba(200,200,200,0.33)`,
                              outline: "none",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>

                        {/* Payment Proof Upload */}
                        <div style={{ marginTop: SPACING.M }}>
                          <label
                            htmlFor="paymentProof"
                            style={{
                              display: "block",
                              fontSize: TYPOGRAPHY.SIZE_LABEL,
                              fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                              color: COLORS.MIDNIGHT_ASH,
                              marginBottom: SPACING.S,
                            }}
                          >
                            Upload payment proof (optional)
                          </label>
                          <div
                            style={{
                              padding: SPACING.L,
                              border: `2px dashed rgba(200,200,200,0.5)`,
                              borderRadius: BORDER_RADIUS.MEDIUM,
                              backgroundColor: COLORS.WHITE,
                              textAlign: "center",
                            }}
                          >
                            <input
                              id="paymentProof"
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) =>
                                setPaymentProofFile(e.target.files?.[0] || null)
                              }
                              style={{ display: "none" }}
                            />
                            <label
                              htmlFor="paymentProof"
                              style={{
                                cursor: "pointer",
                                color: COLORS.MIDNIGHT_ASH,
                                fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                                fontSize: TYPOGRAPHY.SIZE_BODY,
                              }}
                            >
                              {paymentProofFile
                                ? paymentProofFile.name
                                : "Click to upload or drag and drop"}
                            </label>
                            <p
                              style={{
                                fontSize: TYPOGRAPHY.SIZE_LABEL,
                                color: COLORS.PEBBLE,
                                marginTop: SPACING.S,
                              }}
                            >
                              PNG, JPG, PDF up to 10MB
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div style={{ marginTop: SPACING.L }}>
                        <button
                          onClick={handleSubmitPaymentAndAddress}
                          disabled={!isFormValid}
                          style={{
                            width: "100%",
                            backgroundColor: isFormValid
                              ? COLORS.MIDNIGHT_ASH
                              : COLORS.PEBBLE,
                            color: COLORS.WHITE,
                            padding: `${SPACING.M} ${SPACING.XL}`,
                            borderRadius: BORDER_RADIUS.MEDIUM,
                            fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                            fontSize: TYPOGRAPHY.SIZE_BODY,
                            border: "none",
                            cursor: isFormValid ? "pointer" : "not-allowed",
                          }}
                        >
                          Submit Payment & Address
                        </button>
                        {!isFormValid && (
                          <p
                            style={{
                              fontSize: TYPOGRAPHY.SIZE_LABEL,
                              color: COLORS.PEBBLE,
                              textAlign: "center",
                              marginTop: SPACING.S,
                            }}
                          >
                            Please fill in all required fields (name, address,
                            city, phone)
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 1: Seller waiting state */}
              {currentStep === 1 && auth.role === "seller" && (
                <div
                  style={{
                    textAlign: "center",
                    padding: `${SPACING.XXL} ${SPACING.L}`,
                    animation: "fadeSlideIn 0.4s ease-out",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      backgroundColor: "#FEF3C7",
                      marginBottom: SPACING.M,
                    }}
                  >
                    <svg
                      style={{
                        width: "32px",
                        height: "32px",
                        color: "#D97706",
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
                  </div>
                  <h3
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_HEADING_SM,
                      fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                      color: COLORS.MIDNIGHT_ASH,
                      marginBottom: SPACING.S,
                    }}
                  >
                    Waiting for Buyer
                  </h3>
                  <p
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_BODY,
                      color: COLORS.PEBBLE,
                    }}
                  >
                    The buyer is preparing their payment invoice and delivery
                    address.
                  </p>
                  <p
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_LABEL,
                      color: COLORS.PEBBLE,
                      opacity: 0.7,
                      marginTop: SPACING.S,
                    }}
                  >
                    You will be notified when they submit.
                  </p>
                </div>
              )}

              {/* STEP 2: Seller confirms payment & sends shipping */}
              {currentStep === 2 &&
                auth.role === "seller" &&
                tx?.status === STATUS.WAITING_SELLER_CONFIRMATION && (
                  <div style={{ animation: "fadeSlideIn 0.4s ease-out" }}>
                    <h3
                      style={{
                        fontSize: TYPOGRAPHY.SIZE_HEADING_SM,
                        fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                        color: COLORS.MIDNIGHT_ASH,
                        marginBottom: SPACING.S,
                      }}
                    >
                      Step 2 — Confirm Payment & Send Shipping Invoice
                    </h3>
                    <p
                      style={{
                        fontSize: TYPOGRAPHY.SIZE_BODY,
                        color: COLORS.PEBBLE,
                        marginBottom: SPACING.L,
                      }}
                    >
                      Review the buyer's payment invoice, then confirm or
                      reject.
                    </p>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: SPACING.L,
                      }}
                    >
                      {/* Read-only Buyer Info */}
                      <div>
                        <h4
                          style={{
                            fontSize: TYPOGRAPHY.SIZE_LABEL,
                            fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                            color: COLORS.MIDNIGHT_ASH,
                            marginBottom: SPACING.M,
                          }}
                        >
                          Buyer Payment Invoice
                        </h4>
                        <div
                          style={{
                            backgroundColor: COLORS.SOFT_CLOUD,
                            padding: SPACING.M,
                            borderRadius: BORDER_RADIUS.MEDIUM,
                            border: `1px solid rgba(200,200,200,0.33)`,
                          }}
                        >
                          <pre
                            style={{
                              fontSize: TYPOGRAPHY.SIZE_LABEL,
                              color: COLORS.MIDNIGHT_ASH,
                              whiteSpace: "pre-wrap",
                              margin: 0,
                            }}
                          >
                            {JSON.stringify(tx.paymentInvoice, null, 2)}
                          </pre>
                        </div>

                        <h4
                          style={{
                            fontSize: TYPOGRAPHY.SIZE_LABEL,
                            fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                            color: COLORS.MIDNIGHT_ASH,
                            marginTop: SPACING.M,
                            marginBottom: SPACING.M,
                          }}
                        >
                          Delivery Address
                        </h4>
                        <div
                          style={{
                            backgroundColor: COLORS.SOFT_CLOUD,
                            padding: SPACING.M,
                            borderRadius: BORDER_RADIUS.MEDIUM,
                            border: `1px solid rgba(200,200,200,0.33)`,
                          }}
                        >
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: SPACING.S,
                              fontSize: TYPOGRAPHY.SIZE_BODY,
                              color: COLORS.MIDNIGHT_ASH,
                            }}
                          >
                            <p style={{ margin: 0 }}>
                              <strong>Name:</strong>{" "}
                              {tx.deliveryAddress?.firstName}{" "}
                              {tx.deliveryAddress?.lastName}
                            </p>
                            <p style={{ margin: 0 }}>
                              <strong>Phone:</strong>{" "}
                              {tx.deliveryAddress?.phone}
                            </p>
                            <p style={{ margin: 0, gridColumn: "1 / -1" }}>
                              <strong>Address:</strong>{" "}
                              {tx.deliveryAddress?.address}
                              {tx.deliveryAddress?.apartment &&
                                `, ${tx.deliveryAddress.apartment}`}
                            </p>
                            <p style={{ margin: 0 }}>
                              <strong>City:</strong> {tx.deliveryAddress?.city}
                            </p>
                            <p style={{ margin: 0 }}>
                              <strong>Region:</strong>{" "}
                              {tx.deliveryAddress?.region}
                            </p>
                            <p style={{ margin: 0 }}>
                              <strong>Country:</strong>{" "}
                              {tx.deliveryAddress?.country}
                            </p>
                            <p style={{ margin: 0 }}>
                              <strong>Postal:</strong>{" "}
                              {tx.deliveryAddress?.postalCode}
                            </p>
                            {tx.deliveryAddress?.deliveryMethod && (
                              <p
                                style={{
                                  margin: 0,
                                  gridColumn: "1 / -1",
                                  marginTop: SPACING.S,
                                }}
                              >
                                <strong>Delivery:</strong>{" "}
                                {tx.deliveryAddress.deliveryMethod.title} (
                                {tx.deliveryAddress.deliveryMethod.price})
                              </p>
                            )}
                          </div>
                        </div>

                        <div
                          style={{
                            marginTop: SPACING.M,
                            display: "flex",
                            gap: SPACING.M,
                          }}
                        >
                          <button
                            onClick={() => handleSellerReject()}
                            style={{
                              padding: `${SPACING.S} ${SPACING.M}`,
                              borderRadius: BORDER_RADIUS.MEDIUM,
                              border: `1px solid #DC2626`,
                              backgroundColor: "transparent",
                              color: "#DC2626",
                              fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                              fontSize: TYPOGRAPHY.SIZE_BODY,
                              cursor: "pointer",
                            }}
                          >
                            Reject Payment
                          </button>
                          <button
                            onClick={() => {}}
                            style={{
                              padding: `${SPACING.S} ${SPACING.M}`,
                              borderRadius: BORDER_RADIUS.MEDIUM,
                              border: `1px solid #16A34A`,
                              backgroundColor: "#F0FDF4",
                              color: "#16A34A",
                              fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                              fontSize: TYPOGRAPHY.SIZE_BODY,
                              cursor: "pointer",
                            }}
                          >
                            ✓ Payment Received
                          </button>
                        </div>
                      </div>

                      {/* Shipping Invoice Form */}
                      <div>
                        <h4
                          style={{
                            fontSize: TYPOGRAPHY.SIZE_LABEL,
                            fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                            color: COLORS.MIDNIGHT_ASH,
                            marginBottom: SPACING.M,
                          }}
                        >
                          Send Shipping Invoice
                        </h4>
                        <ShippingInvoiceForm onSubmit={handleSellerConfirm} />
                      </div>
                    </div>
                  </div>
                )}

              {/* STEP 2: Buyer waiting for seller */}
              {currentStep === 2 && auth.role === "buyer" && (
                <div
                  style={{
                    textAlign: "center",
                    padding: `${SPACING.XXL} ${SPACING.L}`,
                    animation: "fadeSlideIn 0.4s ease-out",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      backgroundColor: "#DBEAFE",
                      marginBottom: SPACING.M,
                    }}
                  >
                    <svg
                      style={{
                        width: "32px",
                        height: "32px",
                        color: "#2563EB",
                      }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                  </div>
                  <h3
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_HEADING_SM,
                      fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                      color: COLORS.MIDNIGHT_ASH,
                      marginBottom: SPACING.S,
                    }}
                  >
                    Waiting for Seller to Ship
                  </h3>
                  <p
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_BODY,
                      color: COLORS.PEBBLE,
                    }}
                  >
                    The seller is reviewing your payment and preparing the
                    shipment.
                  </p>
                </div>
              )}

              {/* STEP 3: Buyer confirms receipt */}
              {currentStep === 3 &&
                auth.role === "buyer" &&
                tx?.status === STATUS.IN_TRANSIT && (
                  <div style={{ animation: "fadeSlideIn 0.4s ease-out" }}>
                    <h3
                      style={{
                        fontSize: TYPOGRAPHY.SIZE_HEADING_SM,
                        fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                        color: COLORS.MIDNIGHT_ASH,
                        marginBottom: SPACING.S,
                      }}
                    >
                      Step 3 — Confirm Receipt of Goods
                    </h3>
                    <p
                      style={{
                        fontSize: TYPOGRAPHY.SIZE_BODY,
                        color: COLORS.PEBBLE,
                        marginBottom: SPACING.L,
                      }}
                    >
                      Review the shipping information and confirm when you
                      receive the item.
                    </p>

                    <div
                      style={{
                        backgroundColor: COLORS.SOFT_CLOUD,
                        padding: SPACING.L,
                        borderRadius: BORDER_RADIUS.MEDIUM,
                        border: `1px solid rgba(200,200,200,0.33)`,
                        marginBottom: SPACING.L,
                      }}
                    >
                      <h4
                        style={{
                          fontSize: TYPOGRAPHY.SIZE_LABEL,
                          fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                          color: COLORS.MIDNIGHT_ASH,
                          marginBottom: SPACING.M,
                        }}
                      >
                        Shipping Invoice & Tracking
                      </h4>
                      <pre
                        style={{
                          fontSize: TYPOGRAPHY.SIZE_BODY,
                          color: COLORS.MIDNIGHT_ASH,
                          whiteSpace: "pre-wrap",
                          margin: 0,
                        }}
                      >
                        {JSON.stringify(tx.shippingInvoice, null, 2)}
                      </pre>
                    </div>

                    <div style={{ display: "flex", gap: SPACING.M }}>
                      <button
                        onClick={handleBuyerConfirmReceipt}
                        style={{
                          backgroundColor: COLORS.MIDNIGHT_ASH,
                          color: COLORS.WHITE,
                          padding: `${SPACING.M} ${SPACING.XL}`,
                          borderRadius: BORDER_RADIUS.MEDIUM,
                          fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                          fontSize: TYPOGRAPHY.SIZE_BODY,
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        ✓ I Have Received the Product
                      </button>
                      <button
                        onClick={() =>
                          showToast("Problem reported — seller notified")
                        }
                        style={{
                          padding: `${SPACING.M} ${SPACING.L}`,
                          borderRadius: BORDER_RADIUS.MEDIUM,
                          border: `1px solid rgba(200,200,200,0.5)`,
                          backgroundColor: "transparent",
                          color: COLORS.MIDNIGHT_ASH,
                          fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                          fontSize: TYPOGRAPHY.SIZE_BODY,
                          cursor: "pointer",
                        }}
                      >
                        Report a Problem
                      </button>
                    </div>
                  </div>
                )}

              {/* STEP 3: Seller waiting for buyer confirmation */}
              {currentStep === 3 && auth.role === "seller" && (
                <div
                  style={{
                    textAlign: "center",
                    padding: `${SPACING.XXL} ${SPACING.L}`,
                    animation: "fadeSlideIn 0.4s ease-out",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      backgroundColor: "#DCFCE7",
                      marginBottom: SPACING.M,
                    }}
                  >
                    <svg
                      style={{
                        width: "32px",
                        height: "32px",
                        color: "#16A34A",
                      }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                      />
                    </svg>
                  </div>
                  <h3
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_HEADING_SM,
                      fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                      color: COLORS.MIDNIGHT_ASH,
                      marginBottom: SPACING.S,
                    }}
                  >
                    Package In Transit
                  </h3>
                  <p
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_BODY,
                      color: COLORS.PEBBLE,
                    }}
                  >
                    Waiting for buyer to confirm receipt of the package.
                  </p>
                </div>
              )}

              {/* STEP 4: Ratings */}
              {currentStep === 4 && (
                <div style={{ animation: "fadeSlideIn 0.4s ease-out" }}>
                  <h3
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_HEADING_SM,
                      fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                      color: COLORS.MIDNIGHT_ASH,
                      marginBottom: SPACING.S,
                    }}
                  >
                    Step 4 — Rate Your Experience
                  </h3>
                  <p
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_BODY,
                      color: COLORS.PEBBLE,
                      marginBottom: SPACING.L,
                    }}
                  >
                    Leave a rating and comment for the other party.
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: SPACING.L,
                    }}
                  >
                    {/* Your Rating */}
                    <div>
                      <h4
                        style={{
                          fontSize: TYPOGRAPHY.SIZE_LABEL,
                          fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                          color: COLORS.MIDNIGHT_ASH,
                          marginBottom: SPACING.M,
                        }}
                      >
                        Your Rating
                      </h4>
                      {tx?.ratings?.[auth.role] ? (
                        <div
                          style={{
                            backgroundColor:
                              tx.ratings[auth.role].score > 0
                                ? "#F0FDF4"
                                : "#FEF2F2",
                            padding: SPACING.L,
                            borderRadius: BORDER_RADIUS.MEDIUM,
                            border: `1px solid ${
                              tx.ratings[auth.role].score > 0
                                ? "#BBF7D0"
                                : "#FECACA"
                            }`,
                            textAlign: "center",
                            transition: "all 0.3s ease",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "48px",
                              marginBottom: SPACING.S,
                            }}
                          >
                            {tx.ratings[auth.role].score > 0 ? "👍" : "👎"}
                          </div>
                          <p
                            style={{
                              color:
                                tx.ratings[auth.role].score > 0
                                  ? "#16A34A"
                                  : "#DC2626",
                              fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                              fontSize: TYPOGRAPHY.SIZE_BODY,
                            }}
                          >
                            You rated:{" "}
                            {tx.ratings[auth.role].score > 0 ? "+1" : "-1"}
                          </p>
                          {tx.ratings[auth.role].comment && (
                            <p
                              style={{
                                marginTop: SPACING.M,
                                fontSize: TYPOGRAPHY.SIZE_LABEL,
                                color: COLORS.PEBBLE,
                                fontStyle: "italic",
                              }}
                            >
                              "{tx.ratings[auth.role].comment}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <div>
                          {/* Thumbs Selection */}
                          <div
                            style={{
                              display: "flex",
                              gap: SPACING.M,
                              justifyContent: "center",
                              marginBottom: SPACING.L,
                            }}
                          >
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
                                  selectedRating === 1
                                    ? "scale(1.05)"
                                    : "scale(1)",
                              }}
                            >
                              <HandThumbUpIcon
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  color: "#16A34A",
                                }}
                              />
                              <span
                                style={{
                                  fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                                  color: "#16A34A",
                                  fontSize: TYPOGRAPHY.SIZE_BODY,
                                }}
                              >
                                +1
                              </span>
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
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  color: "#DC2626",
                                }}
                              />
                              <span
                                style={{
                                  fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                                  color: "#DC2626",
                                  fontSize: TYPOGRAPHY.SIZE_BODY,
                                }}
                              >
                                -1
                              </span>
                            </button>
                          </div>

                          {/* Comment Box */}
                          <div style={{ marginBottom: SPACING.M }}>
                            <label
                              htmlFor="ratingComment"
                              style={{
                                display: "block",
                                fontSize: TYPOGRAPHY.SIZE_LABEL,
                                fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                                color: COLORS.MIDNIGHT_ASH,
                                marginBottom: SPACING.S,
                              }}
                            >
                              Describe your experience (optional)
                            </label>
                            <textarea
                              id="ratingComment"
                              value={ratingComment}
                              onChange={(e) => setRatingComment(e.target.value)}
                              placeholder="Share your experience with this transaction..."
                              rows={3}
                              style={{
                                width: "100%",
                                padding: SPACING.M,
                                fontSize: TYPOGRAPHY.SIZE_BODY,
                                borderRadius: BORDER_RADIUS.MEDIUM,
                                border: `1px solid rgba(200,200,200,0.33)`,
                                outline: "none",
                                boxSizing: "border-box",
                                resize: "vertical",
                                fontFamily: "inherit",
                              }}
                            />
                          </div>

                          {/* Submit Button */}
                          <button
                            onClick={() => {
                              if (selectedRating) {
                                handleRatingSubmit(auth.role, {
                                  score: selectedRating,
                                  comment:
                                    ratingComment ||
                                    (selectedRating > 0
                                      ? "Positive experience"
                                      : "Negative experience"),
                                });
                                setSelectedRating(null);
                                setRatingComment("");
                              }
                            }}
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
                              cursor: selectedRating
                                ? "pointer"
                                : "not-allowed",
                              transition: "all 0.3s ease",
                            }}
                          >
                            Submit Rating
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Other Party Rating */}
                    <div>
                      <h4
                        style={{
                          fontSize: TYPOGRAPHY.SIZE_LABEL,
                          fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                          color: COLORS.MIDNIGHT_ASH,
                          marginBottom: SPACING.M,
                        }}
                      >
                        Other Party's Rating
                      </h4>
                      {tx?.ratings?.[
                        auth.role === "buyer" ? "seller" : "buyer"
                      ] ? (
                        <div
                          style={{
                            backgroundColor:
                              tx.ratings[
                                auth.role === "buyer" ? "seller" : "buyer"
                              ].score > 0
                                ? "#F0FDF4"
                                : "#FEF2F2",
                            padding: SPACING.L,
                            borderRadius: BORDER_RADIUS.MEDIUM,
                            border: `1px solid ${
                              tx.ratings[
                                auth.role === "buyer" ? "seller" : "buyer"
                              ].score > 0
                                ? "#BBF7D0"
                                : "#FECACA"
                            }`,
                            textAlign: "center",
                            transition: "all 0.3s ease",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "48px",
                              marginBottom: SPACING.S,
                            }}
                          >
                            {tx.ratings[
                              auth.role === "buyer" ? "seller" : "buyer"
                            ].score > 0
                              ? "👍"
                              : "👎"}
                          </div>
                          <p
                            style={{
                              fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                              color:
                                tx.ratings[
                                  auth.role === "buyer" ? "seller" : "buyer"
                                ].score > 0
                                  ? "#16A34A"
                                  : "#DC2626",
                              fontSize: TYPOGRAPHY.SIZE_BODY,
                            }}
                          >
                            They rated:{" "}
                            {tx.ratings[
                              auth.role === "buyer" ? "seller" : "buyer"
                            ].score > 0
                              ? "+1"
                              : "-1"}
                          </p>
                          {tx.ratings[
                            auth.role === "buyer" ? "seller" : "buyer"
                          ].comment && (
                            <p
                              style={{
                                marginTop: SPACING.M,
                                fontSize: TYPOGRAPHY.SIZE_LABEL,
                                color: COLORS.PEBBLE,
                                fontStyle: "italic",
                              }}
                            >
                              "
                              {
                                tx.ratings[
                                  auth.role === "buyer" ? "seller" : "buyer"
                                ].comment
                              }
                              "
                            </p>
                          )}
                        </div>
                      ) : (
                        <div
                          style={{
                            backgroundColor: COLORS.SOFT_CLOUD,
                            padding: SPACING.L,
                            borderRadius: BORDER_RADIUS.MEDIUM,
                            border: `1px solid rgba(200,200,200,0.33)`,
                            color: COLORS.PEBBLE,
                            fontSize: TYPOGRAPHY.SIZE_BODY,
                            textAlign: "center",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "32px",
                              marginBottom: SPACING.S,
                              opacity: 0.5,
                            }}
                          >
                            ⏳
                          </div>
                          Waiting for other party to submit their rating...
                        </div>
                      )}
                    </div>
                  </div>

                  {isCompleted && (
                    <div
                      style={{
                        marginTop: SPACING.L,
                        padding: SPACING.M,
                        backgroundColor: "#F0FDF4",
                        borderRadius: BORDER_RADIUS.MEDIUM,
                        border: `1px solid #BBF7D0`,
                      }}
                    >
                      <p
                        style={{
                          color: "#16A34A",
                          fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                          fontSize: TYPOGRAPHY.SIZE_BODY,
                        }}
                      >
                        ✓ Transaction Complete
                      </p>
                      <p
                        style={{
                          fontSize: TYPOGRAPHY.SIZE_LABEL,
                          color: "#16A34A",
                          marginTop: SPACING.S,
                        }}
                      >
                        Both parties have submitted their ratings. This
                        transaction is now closed.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Transaction Summary (Mobile) */}
            <div style={{ marginTop: SPACING.L, display: "none" }}>
              <TransactionSummary transaction={tx} />
            </div>
          </div>
        </div>
      </div>

      {/* Role Switcher (Dev Only) */}
      <div
        style={{
          position: "fixed",
          bottom: SPACING.L,
          left: SPACING.L,
          backgroundColor: COLORS.WHITE,
          padding: SPACING.M,
          borderRadius: BORDER_RADIUS.MEDIUM,
          boxShadow: SHADOWS.CARD,
          border: `1px solid rgba(200,200,200,0.33)`,
        }}
      >
        <p
          style={{
            fontSize: TYPOGRAPHY.SIZE_LABEL,
            color: COLORS.PEBBLE,
            marginBottom: SPACING.S,
          }}
        >
          Dev: Switch Role
        </p>
        <div style={{ display: "flex", gap: SPACING.S }}>
          <button
            onClick={() => auth.setRole("buyer")}
            style={{
              padding: `${SPACING.S} ${SPACING.M}`,
              fontSize: TYPOGRAPHY.SIZE_LABEL,
              borderRadius: BORDER_RADIUS.MEDIUM,
              border: "none",
              cursor: "pointer",
              backgroundColor:
                auth.role === "buyer" ? COLORS.MIDNIGHT_ASH : COLORS.SOFT_CLOUD,
              color: auth.role === "buyer" ? COLORS.WHITE : COLORS.MIDNIGHT_ASH,
            }}
          >
            Buyer
          </button>
          <button
            onClick={() => auth.setRole("seller")}
            style={{
              padding: `${SPACING.S} ${SPACING.M}`,
              fontSize: TYPOGRAPHY.SIZE_LABEL,
              borderRadius: BORDER_RADIUS.MEDIUM,
              border: "none",
              cursor: "pointer",
              backgroundColor:
                auth.role === "seller"
                  ? COLORS.MIDNIGHT_ASH
                  : COLORS.SOFT_CLOUD,
              color:
                auth.role === "seller" ? COLORS.WHITE : COLORS.MIDNIGHT_ASH,
            }}
          >
            Seller
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: SPACING.L,
            right: SPACING.L,
            backgroundColor: COLORS.MIDNIGHT_ASH,
            color: COLORS.WHITE,
            padding: `${SPACING.M} ${SPACING.L}`,
            borderRadius: BORDER_RADIUS.MEDIUM,
            boxShadow: SHADOWS.CARD,
            fontSize: TYPOGRAPHY.SIZE_BODY,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
