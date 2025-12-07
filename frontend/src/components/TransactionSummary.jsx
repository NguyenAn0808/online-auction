import React from "react";

export default function TransactionSummary({ transaction }) {
  if (!transaction) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
      <h4 className="text-sm font-semibold">Transaction #{transaction.id}</h4>
      <p className="text-xs text-gray-500">Status: {transaction.status}</p>

      <div className="mt-3 text-sm text-gray-700">
        <p>
          <strong>Buyer:</strong> {transaction.buyerId}
        </p>
        <p>
          <strong>Seller:</strong> {transaction.sellerId}
        </p>
      </div>

      <div className="mt-3 text-sm">
        <h5 className="text-xs font-medium text-gray-500">Payment Invoice</h5>
        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
          {JSON.stringify(transaction.paymentInvoice, null, 2)}
        </pre>
      </div>

      <div className="mt-3 text-sm">
        <h5 className="text-xs font-medium text-gray-500">Shipping Invoice</h5>
        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
          {JSON.stringify(transaction.shippingInvoice, null, 2)}
        </pre>
      </div>
    </div>
  );
}
