import React, { useState } from "react";
import { useToast } from "../context/ToastContext";
import FileUploadBox from "./FileUploadBox";

export default function ShippingInvoiceForm({ initial = {}, onSubmit }) {
  const [shippingCode, setShippingCode] = useState(initial.tracking || "");
  const [eta, setEta] = useState(initial.eta || "");
  const [cost, setCost] = useState(initial.cost || "");
  const [file, setFile] = useState(null);
  const toast = useToast();

  function handleSubmit(e) {
    e.preventDefault();

    if (!shippingCode) {
      toast.warning("Please enter a tracking number");
      return;
    }
    if (!file) {
      toast.warning("Please upload a shipping receipt image");
      return;
    }

    // Return the data in the structure the parent component expects
    onSubmit &&
      onSubmit({
        shippingCode,
        file,
        estimatedDate: eta,
      });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Shipping code
        </label>
        <input
          type="text"
          value={shippingCode}
          onChange={(e) => setShippingCode(e.target.value)}
          className="block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-black focus:ring-black sm:text-sm"
        />
      </div>

      <FileUploadBox
        id="shipping-file-upload"
        label="Upload Shipping Receipt"
        file={file}
        onFileChange={setFile}
        accept="image/*"
        helpText="Upload a photo of the shipping receipt or tracking info"
      />

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white btn-primary "
        >
          Confirm & Send Shipping Invoice
        </button>
      </div>
    </form>
  );
}
