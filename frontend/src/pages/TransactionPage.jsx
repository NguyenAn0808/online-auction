import React, { useEffect, useMemo, useState } from "react";
import {
  useParams,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import Header from "../components/Header";
import TransactionStepper from "../components/TransactionStepper";
import TransactionSummary from "../components/TransactionSummary";
import ShippingInvoiceForm from "../components/ShippingInvoiceForm";
import FileUploadBox from "../components/FileUploadBox";
import { Radio, RadioGroup } from "@headlessui/react";
import { HandThumbUpIcon, HandThumbDownIcon } from "@heroicons/react/24/solid";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { useAuth } from "../context/AuthContext";
import * as TransactionService from "../services/transactionService"; // Legacy service (deprecated)
import { STATUS } from "../services/transactionService"; // Legacy status constants (deprecated)
import orderService, { ORDER_STATUS } from "../services/orderService"; // Use OpenAPI service
import { ratingService } from "../services/ratingService";
import CancelOrderModal from "../components/CancelOrderModal";
import { productService } from "../services/productService";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { useToast } from "../context/ToastContext";

// CancelledView Component - Displays when order is cancelled
function CancelledView({ order, isSeller, navigate }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl py-12 px-8 text-center max-w-md mx-auto">
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
          <XCircleIcon className="w-12 h-12 text-red-600" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-red-800 mb-3">
        {isSeller ? "Transaction Cancelled" : "Order Cancelled by Seller"}
      </h2>

      {/* Message */}
      <p className="text-sm text-red-900 mb-8 leading-relaxed">
        {isSeller
          ? "You have successfully cancelled this transaction. The buyer has been rated -1 automatically."
          : "The seller has cancelled this order. If you believe this is an error, please contact support."}
      </p>

      {/* Order Info */}
      {order && (
        <div className="bg-white border border-red-200 rounded-lg p-4 mb-6 text-left">
          <div className="text-xs text-gray-500 mb-1">Order ID</div>
          <div className="text-sm font-semibold text-gray-700">
            #{order.id?.slice(0, 8) || "N/A"}
          </div>
          {order.productName && (
            <>
              <div className="text-xs text-gray-500 mt-3 mb-1">Product</div>
              <div className="text-sm font-semibold text-gray-700">
                {order.productName}
              </div>
            </>
          )}
          {order.cancellation_reason && (
            <>
              <div className="text-xs text-gray-500 mt-3 mb-1">
                Cancellation Reason
              </div>
              <div className="text-sm text-red-700 italic">
                {order.cancellation_reason}
              </div>
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate("/")}
          className="w-full py-3.5 px-6 bg-gray-900 text-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-colors hover:bg-gray-700"
        >
          Return to Dashboard
        </button>
        {!isSeller && (
          <button
            onClick={() =>
              (window.location.href = "mailto:support@auction.com")
            }
            className="w-full py-3.5 px-6 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-semibold cursor-pointer transition-colors hover:bg-red-50"
          >
            Contact Support
          </button>
        )}
      </div>
    </div>
  );
}
const DELIVERY_METHODS = [
  {
    id: 1,
    title: "Standard",
    turnaround: "4–10 business days",
    price: "50.000 VND",
  },
  {
    id: 2,
    title: "Express",
    turnaround: "2–5 business days",
    price: "160.000 VND",
  },
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
  const { orderId } = useParams(); // The Order ID
  const location = useLocation();
  const [ratingComment, setRatingComment] = useState("");
  const [selectedRating, setSelectedRating] = useState(null);
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- STATE ---
  const toast = useToast();
  const [tx, setTx] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [localToast, setLocalToast] = useState(null);
  const [isCancelModalOpen, setCancelModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [viewStep, setViewStep] = useState(null); // Step being viewed (for navigation)
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
      const FIXED_REASON = "Người thắng không chịu thanh toán.";
      const cancelled = await orderService.cancelOrder(orderId, FIXED_REASON);

      // Auto rate buyer -1 with fixed comment
      try {
        const targetBuyerId = cancelled?.buyer_id || tx?.buyer_id;
        const productId =
          cancelled?.product_id || tx?.product_id || productDetails?.id;
        if (user?.id && targetBuyerId && productId) {
          await ratingService.createRating({
            user_id: targetBuyerId,
            reviewer_id: user.id,
            product_id: productId,
            is_positive: false,
            comment: "Người thắng không thanh toán.",
          });
        }
      } catch (rateErr) {
        console.error("Auto-rating on cancel failed:", rateErr);
      }

      setCancelModalOpen(false);

      // Update local state immediately to show CancelledView
      setTx((prev) => ({ ...prev, status: ORDER_STATUS.CANCELLED }));

      // Show success notification
      setNotification({
        type: "success",
        message: "Order has been cancelled.",
      });
      setTimeout(() => setNotification(null), 5000);
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
      // Order ID is required
      if (!orderId) {
        setLoading(false);
        navigate("/", { replace: true });
        return;
      }

      try {
        // Use OpenAPI endpoint: GET /orders/{order_id}
        const apiResponse = await orderService.getOrderById(orderId);
        if (apiResponse) {
          setTx(apiResponse);

          // Always fetch product details using product_id
          if (apiResponse.product_id) {
            try {
              const product = await productService.getProductById(
                apiResponse.product_id
              );
              setProductDetails({
                name: product.name,
                id: product.id,
                thumbnail: product.images?.[0]?.image_url,
                images: product.images,
              });
            } catch (productErr) {
              console.error("Failed to fetch product details:", productErr);
              // Fallback: set basic info from order if available
              if (apiResponse.productName) {
                setProductDetails({
                  name: apiResponse.productName,
                  id: apiResponse.product_id,
                });
              }
            }
          }
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
          toast.error(
            "You do not have permission to view this transaction or it does not exist."
          );
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [orderId, navigate, location.pathname]);

  function showToast(message) {
    setLocalToast(message);
    setTimeout(() => setLocalToast(null), 3000);
  }

  const isBuyer = tx && user && user.id === tx.buyer_id;
  const isSeller = tx && user && user.id === tx.seller_id;
  const userRole = isSeller ? "seller" : "buyer";

  // Use OpenAPI status enums instead of database status strings
  // Handle case-insensitive check for cancelled status (backend may return 'cancelled' or 'Cancelled')
  const isCompleted = tx?.status === ORDER_STATUS.COMPLETED;
  const isCancelled =
    tx?.status?.toLowerCase() === ORDER_STATUS.CANCELLED.toLowerCase();

  const isFormValid =
    formData.firstName && formData.address && formData.city && formData.phone;
  // STEP 1: CREATE ORDER (Buyer) - Submit Payment Proof
  // NOTE: Since the order is auto-created by the cron job when auction ends,
  // we need to UPDATE the existing order with payment proof, not create a new one.
  async function handleCreateOrder() {
    if (!paymentProofFile)
      return showToast("Please upload payment proof image.");

    if (!formData.address || !formData.city || !formData.phone) {
      return showToast("Please fill in Address, City and Phone.");
    }

    try {
      // 1. Get Order ID from existing transaction
      const oid = tx?.id || orderId;
      if (!oid) return showToast("Order ID missing.");

      // 2. Prepare Form Data (Backend expects multipart/form-data)
      const fullAddress = `${formData.address}, ${formData.city}, ${formData.region}, ${formData.country}. Phone: ${formData.phone}`;

      const payload = new FormData();
      payload.append("shippingAddress", fullAddress);
      payload.append("image", paymentProofFile); // Backend middleware checks for 'image' or 'file'

      // 3. Update order with payment proof
      const res = await orderService.updatePaymentProof(oid, payload);

      // 4. Handle Success
      if (res && (res.success || res.data)) {
        const newTx = res.data || res;
        setTx(newTx);
        showToast("Payment proof submitted successfully!");
      }
    } catch (err) {
      console.error(err);
      // Display backend error message if available
      showToast(
        err.response?.data?.message || "Failed to submit payment proof"
      );
    }
  }
  // STEP 2: CONFIRM SHIPPING (Seller)
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

    if (!shippingData.shippingCode || !shippingData.file) {
      return showToast("Please provide shipping code and proof image.");
    }

    try {
      // Use the legacy transactionService which has the correct implementation
      const res = await TransactionService.confirmShipping(
        orderId,
        shippingData.shippingCode,
        shippingData.file
      );

      if (res) {
        // Reload the order to get updated status
        const updatedOrder = await orderService.getOrderById(orderId);
        setTx(updatedOrder);
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
  async function handleBuyerConfirmReceipt() {
    if (!tx) return;
    const orderId = tx._id || tx.id;
    if (!orderId) return showToast("Order ID missing.");

    try {
      await TransactionService.confirmReceipt(orderId);
      // Reload the order to get updated status
      const updatedOrder = await orderService.getOrderById(orderId);
      setTx(updatedOrder);
      showToast("Receipt confirmed! Please rate the seller.");
    } catch (err) {
      console.error("Delivery confirmation error:", err);
      showToast(err.response?.data?.message || "Failed to confirm receipt");
    }
  }

  // STEP 4: SUBMIT RATING (Allow re-rating)
  async function handleRatingSubmit() {
    if (!tx || !selectedRating) return;
    const orderId = tx._id || tx.id;
    try {
      await TransactionService.rateTransaction(
        orderId,
        selectedRating,
        ratingComment
      );
      setIsRatingSubmitted(true);

      // Show appropriate message
      showToast(
        hasUserRated
          ? "Rating updated successfully!"
          : "Rating submitted successfully!"
      );

      // Reload order to check if both parties rated (status might be 'completed' now)
      const updatedOrder = await orderService.getOrderById(orderId);
      setTx(updatedOrder);

      if (updatedOrder.status === "completed") {
        showToast("Transaction completed! Both parties have rated.");
      }
    } catch (err) {
      console.error("Rating error:", err);
      showToast(err.response?.data?.message || "Failed to submit rating");
    }
  }

  // SKIP RATING: Navigate to profile for later rating
  async function handleSkipRating() {
    if (!tx) return;
    const orderId = tx._id || tx.id;

    try {
      // Navigate to profile
      navigate(`/summary/${user.id}`);
      showToast("You can rate this transaction later from your profile");
    } catch (err) {
      console.error("Skip rating error:", err);
      showToast("Failed to skip rating");
    }
  }

  const currentStep = useMemo(() => {
    if (!tx) return 1; // Step 1: Creating Order

    // Map database status values to step numbers
    switch (tx.status) {
      case "pending_payment":
        return 1; // Step 1: Buyer needs to provide payment proof

      case "pending_verification":
        return 2; // Step 2: Seller needs to verify payment and ship

      case "delivering":
        return 3; // Step 3: Package in transit, buyer waiting for delivery

      case "await_rating":
        return 4; // Step 4: Buyer confirmed receipt, awaiting ratings

      case "completed":
        return 5; // Step 5: Transaction complete

      case "cancelled":
        return 0; // Cancelled transaction

      // OpenAPI enum fallbacks (if backend switches to enum format)
      case ORDER_STATUS.PENDING_BIDDER_PAYMENT:
        return 1;

      case ORDER_STATUS.PENDING_SELLER_CONFIRMATION:
        return 2;

      case ORDER_STATUS.PENDING_DELIVERY:
        return 3;

      case ORDER_STATUS.PENDING_RATING:
        return 4;

      case ORDER_STATUS.COMPLETED:
        return 5;

      case ORDER_STATUS.CANCELLED:
        return 0;

      default:
        return 1;
    }
  }, [tx]);

  const hasUserRated = tx?.ratings?.[userRole];

  // The step being viewed (defaults to currentStep if not set)
  const activeViewStep = viewStep ?? currentStep;

  // Whether viewing a completed (read-only) step
  const isViewingPastStep = activeViewStep < currentStep;

  // Handler for step navigation
  const handleStepClick = (stepId) => {
    // Only allow navigation to completed steps or current step
    if (stepId <= currentStep) {
      setViewStep(stepId);
    }
  };

  // Reset viewStep when currentStep changes (e.g., after submitting)
  useEffect(() => {
    setViewStep(null);
  }, [currentStep]);

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
    <div className="min-h-screen bg-soft-cloud">
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
      <div className="flex h-[calc(100vh-64px)]">
        {/* LEFT: Main Wizard Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-6 gap-4">
              <div className="flex items-center gap-4">
                {(tx?.productImage ||
                  productDetails?.thumbnail ||
                  productDetails?.images?.[0]?.image_url) && (
                  <img
                    src={
                      tx?.productImage ||
                      productDetails?.thumbnail ||
                      productDetails?.images?.[0]?.image_url
                    }
                    alt="Product"
                    className="w-16 h-16 object-cover rounded-lg shadow-sm"
                  />
                )}
                <div>
                  {/* Product Name - Primary */}
                  <h1 className="text-2xl font-bold text-midnight-ash mb-1.5 leading-tight">
                    {productDetails?.name || "Loading product..."}
                  </h1>

                  {/* Transaction Info Row */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Order ID Badge */}
                    <span className="text-xs font-medium bg-soft-cloud py-1 px-2.5 rounded-full text-pebble inline-flex items-center gap-1">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Order #{orderId?.slice(0, 8) || "..."}
                    </span>

                    {/* Separator */}
                    <span className="text-morning-mist">•</span>

                    {/* Role Badge */}
                    <span
                      className={`text-xs font-semibold py-1 px-2.5 rounded-full ${
                        userRole === "buyer"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {userRole === "buyer" ? "🛒 Buyer" : "🏪 Seller"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Seller Cancel Button - Disabled after Confirm Receipt (Step 4+) */}
              {isSeller && !isCompleted && !isCancelled && (
                <button
                  onClick={() => currentStep < 4 && setCancelModalOpen(true)}
                  disabled={currentStep >= 4}
                  title={
                    currentStep >= 4
                      ? "Cannot cancel after buyer confirmed receipt"
                      : "Cancel this transaction"
                  }
                  className={`flex items-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold shadow-sm transition-all ${
                    currentStep >= 4
                      ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60"
                      : "bg-red-50 text-red-600 border border-red-200 cursor-pointer hover:bg-red-100 hover:border-red-300 hover:-translate-y-0.5 hover:shadow-md"
                  }`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M15 9l-6 6M9 9l6 6" />
                  </svg>
                  Cancel Transaction
                </button>
              )}
            </div>

            {/* Cancelled View - Show when order is cancelled */}
            {isCancelled ? (
              <CancelledView
                order={tx}
                isSeller={isSeller}
                navigate={navigate}
              />
            ) : (
              <>
                {/* Stepper */}
                <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                  <TransactionStepper
                    current={currentStep}
                    viewStep={activeViewStep}
                    onStepClick={handleStepClick}
                  />
                </div>

                {/* Read-only banner when viewing past step */}
                {isViewingPastStep && (
                  <div className="bg-pebble border border-blue-200 rounded-lg p-4 mb-4 flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-soft-cloud flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="flex-1">
                      <span className="text-sm text-soft-cloud font-medium">
                        Viewing completed step (read-only)
                      </span>
                      <span className="text-xs text-soft-cloud ml-2">
                        This step has already been completed and cannot be
                        modified.
                      </span>
                    </div>
                    <button
                      onClick={() => setViewStep(currentStep)}
                      className="text-xs bg-midnight-ash text-soft-cloud py-1.5 px-3 rounded-lg font-medium hover:bg-midnight-ash/90 transition-colors cursor-pointer"
                    >
                      Go to Current Step
                    </button>
                  </div>
                )}

                {/* Step Content */}
                <div
                  className={`bg-white p-6 rounded-lg shadow-sm transition-all duration-400 ${
                    tx ? "opacity-100" : "opacity-95"
                  }`}
                >
                  {/* ===== STEP 1: PAYMENT & DELIVERY ===== */}
                  {activeViewStep === 1 && (
                    <div className="animate-fadeSlideIn">
                      {/* READ-ONLY: Step 1 completed (viewing past step) */}
                      {isViewingPastStep ? (
                        <div>
                          <h3 className="text-lg font-semibold text-midnight-ash mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">
                              ✓
                            </span>
                            Step 1 — Payment & Delivery (Completed)
                          </h3>
                          <div className="bg-soft-cloud p-6 rounded-lg">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-pebble font-medium">
                                  Shipping Address:
                                </span>
                                <p className="text-midnight-ash mt-1">
                                  {tx?.shipping_address || "—"}
                                </p>
                              </div>
                              <div>
                                <span className="text-pebble font-medium">
                                  Payment Proof:
                                </span>
                                <p className="mt-1">
                                  {tx?.payment_proof_image ? (
                                    <a
                                      href={tx.payment_proof_image}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-blue-600 underline inline-flex items-center gap-1"
                                    >
                                      View Image →
                                    </a>
                                  ) : (
                                    <span className="text-pebble">—</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : isBuyer ? (
                        /* BUYER: Active Step 1 */
                        tx?.status ===
                        ORDER_STATUS.PENDING_SELLER_CONFIRMATION ? (
                          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                            <h3 className="text-lg font-semibold text-green-600">
                              ✓ Order Submitted
                            </h3>
                            <p className="text-green-600">
                              Waiting for seller to confirm payment.
                            </p>
                          </div>
                        ) : (
                          <div>
                            <h3 className="text-lg font-semibold text-midnight-ash mb-2">
                              Step 1 — Provide Payment & Delivery Address
                            </h3>
                            <div className="bg-soft-cloud p-6 rounded-lg mb-6">
                              <div className="grid grid-cols-2 gap-4">
                                <input
                                  name="firstName"
                                  placeholder="First Name"
                                  onChange={handleInputChange}
                                  className="p-4 border border-gray-300 rounded-lg"
                                />
                                <input
                                  name="lastName"
                                  placeholder="Last Name"
                                  onChange={handleInputChange}
                                  className="p-4 border border-gray-300 rounded-lg"
                                />
                                <input
                                  name="address"
                                  placeholder="Address"
                                  onChange={handleInputChange}
                                  className="p-4 border border-gray-300 rounded-lg col-span-2"
                                />
                                <input
                                  name="city"
                                  placeholder="City"
                                  onChange={handleInputChange}
                                  className="p-4 border border-gray-300 rounded-lg"
                                />
                                <input
                                  name="phone"
                                  placeholder="Phone"
                                  onChange={handleInputChange}
                                  className="p-4 border border-gray-300 rounded-lg"
                                />
                              </div>
                            </div>
                            <div className="mb-6">
                              <FileUploadBox
                                id="payment-proof-upload"
                                label="Upload Payment Proof"
                                file={paymentProofFile}
                                onFileChange={setPaymentProofFile}
                                accept="image/*"
                                helpText="Upload a screenshot or photo of your payment confirmation"
                              />
                            </div>
                            <button
                              onClick={handleCreateOrder}
                              disabled={!isFormValid}
                              className={`w-full p-4 rounded-lg border-none ${
                                isFormValid
                                  ? "bg-midnight-ash text-white cursor-pointer"
                                  : "bg-pebble text-white cursor-not-allowed"
                              }`}
                            >
                              Submit Payment & Address
                            </button>
                          </div>
                        )
                      ) : (
                        /* SELLER: Waiting for buyer */
                        <div className="p-6">
                          <h3 className="font-semibold mb-6 text-midnight-ash">
                            Step 1 — Buyer Payment Information
                          </h3>
                          {tx?.payment_proof_image && tx?.shipping_address ? (
                            <div className="bg-soft-cloud p-6 rounded-lg mb-6">
                              <div className="mb-4">
                                <p className="font-semibold mb-2">
                                  <strong>Shipping Address:</strong>
                                </p>
                                <p className="text-midnight-ash">
                                  {tx.shipping_address}
                                </p>
                              </div>
                              <div>
                                <p className="font-semibold mb-2">
                                  <strong>Payment Proof:</strong>
                                </p>
                                <a
                                  href={tx.payment_proof_image}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 underline inline-flex items-center gap-2"
                                >
                                  View Payment Proof Image →
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <div className="text-4xl mb-4">⏳</div>
                              <h3 className="font-semibold">
                                Waiting for Buyer
                              </h3>
                              <p className="text-pebble">
                                The buyer has not yet submitted payment proof
                                and shipping address.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ===== STEP 2: SELLER CONFIRMATION ===== */}
                  {activeViewStep === 2 && (
                    <div className="animate-fadeSlideIn">
                      {/* READ-ONLY: Step 2 completed */}
                      {isViewingPastStep ? (
                        <div>
                          <h3 className="text-lg font-semibold text-midnight-ash mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">
                              ✓
                            </span>
                            Step 2 — Seller Confirmation (Completed)
                          </h3>
                          <div className="bg-soft-cloud p-6 rounded-lg">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-pebble font-medium">
                                  Shipping Code:
                                </span>
                                <p className="text-midnight-ash mt-1 font-mono">
                                  {tx?.shipping_code || "—"}
                                </p>
                              </div>
                              <div>
                                <span className="text-pebble font-medium">
                                  Shipping Receipt:
                                </span>
                                <p className="mt-1">
                                  {tx?.shipping_receipt_image ? (
                                    <a
                                      href={tx.shipping_receipt_image}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-blue-600 underline inline-flex items-center gap-1"
                                    >
                                      View Receipt →
                                    </a>
                                  ) : (
                                    <span className="text-pebble">—</span>
                                  )}
                                </p>
                              </div>
                              <div className="col-span-2">
                                <span className="text-pebble font-medium">
                                  Shipped To:
                                </span>
                                <p className="text-midnight-ash mt-1">
                                  {tx?.shipping_address || "—"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : isSeller ? (
                        /* SELLER: Active Step 2 */
                        <div>
                          <h3 className="font-semibold mb-6">
                            Step 2 — Verify Payment & Ship
                          </h3>
                          <div className="bg-soft-cloud p-4 rounded-lg mb-6">
                            <p>
                              <strong>Ship To:</strong> {tx?.shipping_address}
                            </p>
                            <p>
                              <strong>Payment Proof:</strong>
                            </p>
                            {tx?.payment_proof_image ? (
                              <a
                                href={tx.payment_proof_image}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 underline"
                              >
                                View Proof Image
                              </a>
                            ) : (
                              <span className="text-red-600 font-bold">
                                Not Uploaded
                              </span>
                            )}
                          </div>
                          <ShippingInvoiceForm onSubmit={handleSellerConfirm} />
                        </div>
                      ) : (
                        /* BUYER: Waiting for seller */
                        <div className="text-center py-12">
                          <div className="text-4xl mb-4">📦</div>
                          <h3 className="font-semibold">Processing</h3>
                          <p className="text-pebble">
                            Seller is verifying your payment.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ===== STEP 3: CONFIRM RECEIPT ===== */}
                  {activeViewStep === 3 && (
                    <div className="animate-fadeSlideIn">
                      {/* READ-ONLY: Step 3 completed */}
                      {isViewingPastStep ? (
                        <div>
                          <h3 className="text-lg font-semibold text-midnight-ash mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">
                              ✓
                            </span>
                            Step 3 — Receipt Confirmed (Completed)
                          </h3>
                          <div className="bg-soft-cloud p-6 rounded-lg">
                            <div className="text-sm">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-green-600">✓</span>
                                <span className="text-midnight-ash">
                                  Buyer confirmed receipt of the product
                                </span>
                              </div>
                              <div>
                                <span className="text-pebble font-medium">
                                  Tracking Code:
                                </span>
                                <span className="ml-2 font-mono text-midnight-ash">
                                  {tx?.shipping_code || "—"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : isBuyer ? (
                        /* BUYER: Active Step 3 */
                        <div>
                          <h3 className="font-semibold mb-6">
                            Step 3 — Confirm Receipt
                          </h3>
                          <div className="bg-soft-cloud p-4 rounded-lg mb-6">
                            <p>
                              <strong>Tracking Code:</strong>{" "}
                              {tx?.shipping_code}
                            </p>
                          </div>
                          <button
                            onClick={handleBuyerConfirmReceipt}
                            className="w-full bg-midnight-ash text-white p-4 rounded-lg border-none cursor-pointer"
                          >
                            I Have Received the Product
                          </button>
                        </div>
                      ) : (
                        /* SELLER: Waiting for buyer */
                        <div className="text-center py-12">
                          <div className="text-4xl mb-4">🚚</div>
                          <h3 className="font-semibold">In Transit</h3>
                          <p className="text-pebble">
                            Waiting for buyer to receive package.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ===== STEP 4: RATINGS ===== */}
                  {(activeViewStep === 4 || currentStep === 5) && (
                    <div className="animate-fadeSlideIn text-center">
                      <h3 className="font-semibold mb-6">
                        Step {currentStep} —{" "}
                        {currentStep === 4
                          ? "Rate Your Experience"
                          : "Finalized"}
                      </h3>

                      {/* Info banner for re-rating */}
                      {!shouldShowFinalReceipt && hasUserRated && (
                        <div className="bg-amber-100 p-4 rounded-lg mb-6 border border-amber-300">
                          <p className="text-amber-800 text-sm">
                            ℹ️ You have already rated this transaction. You can
                            update your rating below.
                          </p>
                        </div>
                      )}

                      {shouldShowFinalReceipt ? (
                        /* CONDITION 1: FINAL RECEIPT (Triggers if Step 5 OR if rating was just submitted/exists) */
                        <div className="py-12 bg-teal-50 rounded-lg border border-teal-400 text-teal-700">
                          <CheckCircleIcon className="w-10 mx-auto mb-4" />
                          <h4 className="font-bold text-lg">
                            Transaction Complete!
                          </h4>
                          <p className="mt-2">
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
                          <div className="flex justify-center gap-6 mb-6">
                            {/* ... Thumb Up/Down Buttons ... */}
                            <button
                              onClick={() => setSelectedRating(1)}
                              className={`flex flex-col items-center gap-2 p-6 rounded-lg cursor-pointer transition-all min-w-[100px] ${
                                selectedRating === 1
                                  ? "bg-green-50 border-2 border-green-600 scale-105"
                                  : "bg-soft-cloud border-2 border-transparent"
                              }`}
                            >
                              <HandThumbUpIcon className="w-8 text-green-600" />{" "}
                              +1
                            </button>
                            <button
                              onClick={() => setSelectedRating(-1)}
                              className={`flex flex-col items-center gap-2 p-6 rounded-lg cursor-pointer transition-all min-w-[100px] ${
                                selectedRating === -1
                                  ? "bg-red-50 border-2 border-red-600 scale-105"
                                  : "bg-soft-cloud border-2 border-transparent"
                              }`}
                            >
                              <HandThumbDownIcon className="w-8 text-red-600" />{" "}
                              -1
                            </button>
                          </div>
                          <textarea
                            value={ratingComment}
                            onChange={(e) => setRatingComment(e.target.value)}
                            placeholder="Add a comment about your experience (optional)"
                            className="w-full p-4 border border-gray-300 rounded-lg resize-none mb-4"
                            rows={3}
                          />

                          <button
                            onClick={handleRatingSubmit}
                            disabled={!selectedRating}
                            className={`w-full py-4 px-6 border-none rounded-lg font-semibold text-base transition-all ${
                              selectedRating
                                ? "bg-midnight-ash text-white cursor-pointer"
                                : "bg-pebble text-white cursor-not-allowed"
                            }`}
                          >
                            {hasUserRated ? "Update Rating" : "Submit Rating"}
                          </button>

                          {/* Skip Rating Button */}
                          {!hasUserRated && (
                            <button
                              onClick={handleSkipRating}
                              className="w-full py-4 px-6 bg-transparent text-midnight-ash border-2 border-pebble rounded-lg font-medium text-base cursor-pointer transition-all mt-2 hover:bg-soft-cloud"
                            >
                              Skip rating, I will rate later
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {currentStep === 5 && (
                    <button
                      onClick={() => navigate("/transactions")}
                      className="bg-midnight-ash text-white py-2 px-4 rounded-lg border-none font-semibold cursor-pointer mt-4 transition-colors hover:bg-gray-700"
                    >
                      View Transaction History
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {localToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-gray-800 text-white py-3 px-6 rounded-full shadow-lg flex items-center gap-3 min-w-[300px] justify-center animate-slideDown">
          {/* Optional Icon based on success/error */}
          <span className="text-lg">🔔</span>

          <span className="font-medium text-sm">{localToast}</span>
        </div>
      )}

      {/* Add this Animation Style tag just before the closing div if you don't have it in CSS */}
      <style>
        {`
          @keyframes slideDown {
            from { transform: translate(-50%, -20px); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
          }
          @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeSlideIn {
            animation: fadeSlideIn 0.4s ease-out;
          }
          .animate-slideDown {
            animation: slideDown 0.3s ease-out forwards;
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
