import React, { useState } from "react";

export default function ShippingInvoiceForm({ initial = {}, onSubmit }) {
  const [carrier, setCarrier] = useState(initial.carrier || "UPS");
  const [tracking, setTracking] = useState(initial.tracking || "");
  const [eta, setEta] = useState(initial.eta || "");
  const [cost, setCost] = useState(initial.cost || "");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit && onSubmit({ carrier, tracking, eta, cost });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Carrier
        </label>
        <input
          value={carrier}
          onChange={(e) => setCarrier(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Tracking number
        </label>
        <input
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Estimated delivery date
        </label>
        <input
          type="date"
          value={eta}
          onChange={(e) => setEta(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Shipping cost
        </label>
        <input
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white btn-primary "
        >
          Send shipping invoice
        </button>
      </div>
    </form>
  );
}
