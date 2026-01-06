import React, { useState } from "react";
import { useToast } from "../context/ToastContext";

export default function PaymentInvoiceForm({ initial, onSubmit }) {
  const safeInitial = initial || {};
  const [method, setMethod] = useState(safeInitial.method || "Bank Transfer");
  const [reference, setReference] = useState(safeInitial.reference || "");
  const [note, setNote] = useState(safeInitial.note || "");
  const [error, setError] = useState("");
  const toast = useToast();

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!reference.trim()) {
      setError("Reference / Invoice number is required");
      toast.warning("Please enter the reference or invoice number");
      return;
    }

    onSubmit && onSubmit({ method, reference, note, uploaded: null });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Payment method
        </label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300"
        >
          <option>Bank Transfer</option>
          <option>PayPal</option>
          <option>Credit Card</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Reference / Invoice No.
        </label>
        <input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Note / Upload (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300"
        />
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white btn-primary"
        >
          Submit payment invoice
        </button>
      </div>
    </form>
  );
}
