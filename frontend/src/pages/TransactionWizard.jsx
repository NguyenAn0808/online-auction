import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import TransactionStepper from "../components/TransactionStepper";
import TransactionSummary from "../components/TransactionSummary";
import PaymentInvoiceForm from "../components/PaymentInvoiceForm";
import ShippingInvoiceForm from "../components/ShippingInvoiceForm";
import RatingForm from "../components/RatingForm";
import {
  createTransaction,
  getTransaction,
  updateTransaction,
  listTransactions,
  STATUS,
} from "../services/transactionService";

// Simple mock auth role. Replace with real auth hook later.
function useMockAuth() {
  const [role, setRole] = useState("buyer");
  return { role, setRole, userId: role === "buyer" ? "buyer-1" : "seller-1" };
}

export default function TransactionWizard() {
  const auth = useMockAuth();
  const [tx, setTx] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // create a demo transaction for the buyer if none exists
    const existing = listTransactions((t) => t.buyerId === auth.userId)[0];
    if (existing) setTx(existing);
    else if (auth.role === "buyer") {
      const newTx = createTransaction({
        buyerId: auth.userId,
        sellerId: "seller-1",
      });
      setTx(newTx);
    }
  }, [auth.userId, auth.role]);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  function handleSubmitPayment(data) {
    if (!tx) return;
    updateTransaction(tx.id, {
      paymentInvoice: data,
      status: STATUS.WAITING_SELLER_CONFIRMATION,
    });
    setTx(getTransaction(tx.id));
    showToast("Payment invoice submitted — waiting seller confirmation");
  }

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
    updateTransaction(tx.id, { status: STATUS.PAYMENT_REJECTED });
    setTx(getTransaction(tx.id));
    showToast("Payment rejected — buyer notified");
  }

  function handleBuyerConfirmReceipt() {
    if (!tx) return;
    updateTransaction(tx.id, { status: STATUS.COMPLETED_AWAITING_RATING });
    setTx(getTransaction(tx.id));
    showToast("Confirmed receipt — awaiting ratings");
  }

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

  const currentStep = useMemo(() => {
    if (!tx) return 1;
    switch (tx.status) {
      case STATUS.WAITING_SELLER_CONFIRMATION:
        return 1;
      case STATUS.PAYMENT_REJECTED:
        return 1;
      case STATUS.IN_TRANSIT:
        return 3;
      case STATUS.COMPLETED_AWAITING_RATING:
        return 4;
      case STATUS.COMPLETED:
        return 4;
      default:
        return 1;
    }
  }, [tx]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="mb-4">
                <TransactionStepper current={currentStep} />
              </div>

              <div>
                {auth.role === "buyer" && currentStep === 1 && (
                  <div>
                    <h3 className="text-lg font-medium">
                      Step 1 — Provide payment & delivery
                    </h3>
                    <p className="text-sm text-gray-500">
                      Upload or enter payment invoice and delivery address.
                    </p>
                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <PaymentInvoiceForm
                          onSubmit={handleSubmitPayment}
                          initial={tx?.paymentInvoice}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {auth.role === "seller" &&
                  tx &&
                  tx.status === STATUS.WAITING_SELLER_CONFIRMATION && (
                    <div>
                      <h3 className="text-lg font-medium">
                        Step 2 — Confirm payment & send shipping invoice
                      </h3>
                      <p className="text-sm text-gray-500">
                        Review buyer payment invoice, then confirm or reject.
                      </p>

                      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-semibold">
                            Buyer payment invoice
                          </h4>
                          <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                            {JSON.stringify(tx.paymentInvoice, null, 2)}
                          </pre>

                          <div className="mt-4">
                            <button
                              onClick={() => handleSellerReject()}
                              className="mr-3 inline-flex px-3 py-2 rounded-md border border-red-600 text-red-600"
                            >
                              Reject payment
                            </button>
                            <button
                              onClick={() => {}}
                              className="inline-flex px-3 py-2 rounded-md border bg-indigo-50 text-indigo-700"
                            >
                              Mark as received
                            </button>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold">
                            Send shipping invoice
                          </h4>
                          <ShippingInvoiceForm onSubmit={handleSellerConfirm} />
                        </div>
                      </div>
                    </div>
                  )}

                {auth.role === "buyer" &&
                  tx &&
                  tx.status === STATUS.IN_TRANSIT && (
                    <div>
                      <h3 className="text-lg font-medium">
                        Step 3 — Confirm receipt of goods
                      </h3>
                      <p className="text-sm text-gray-500">
                        Review shipping invoice and tracking details.
                      </p>
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold">
                          Shipping invoice
                        </h4>
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                          {JSON.stringify(tx.shippingInvoice, null, 2)}
                        </pre>
                        <div className="mt-4">
                          <button
                            onClick={handleBuyerConfirmReceipt}
                            className="mr-3 inline-flex px-4 py-2 rounded-md bg-indigo-600 text-white"
                          >
                            Confirm goods received
                          </button>
                          <button
                            onClick={() =>
                              showToast("Reported a problem — seller notified")
                            }
                            className="inline-flex px-4 py-2 rounded-md border"
                          >
                            Report a problem
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                {tx && tx.status === STATUS.COMPLETED_AWAITING_RATING && (
                  <div>
                    <h3 className="text-lg font-medium">Step 4 — Ratings</h3>
                    <p className="text-sm text-gray-500">
                      Leave ratings and comments for the other party.
                    </p>
                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-semibold">Your rating</h4>
                        <RatingForm
                          onSubmit={(r) =>
                            handleRatingSubmit(
                              auth.role === "buyer" ? "buyer" : "seller",
                              r
                            )
                          }
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">
                          Other party rating
                        </h4>
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                          {JSON.stringify(tx.ratings, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="col-span-12 lg:col-span-4">
            <div className="sticky top-24">
              <TransactionSummary transaction={tx} />
            </div>
          </aside>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2 rounded-md shadow">
          {toast}
        </div>
      )}
    </div>
  );
}
