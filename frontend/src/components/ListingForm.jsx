import React, { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categoryService } from "../services/categoryService";
import { productAPI } from "../services/productService";
import { useNavigate } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";

// Schema with conditional buy now validation
const schema = z
  .object({
    name: z
      .string()
      .min(5, { message: "Title must be at least 5 characters" })
      .max(80, { message: "Title must not exceed 80 characters" }),
    category_id: z.string(),
    start_price: z
      .number({ invalid_type_error: "Start price must be a number" })
      .min(0, { message: "Start price must be at least 0" }),
    buy_now_enabled: z.boolean().optional(),
    buy_now_price: z
      .union([
        z
          .number({ invalid_type_error: "Enter a valid buy now price" })
          .min(0, { message: "Buy now price must be at least 0" }),
        z.null(),
      ])
      .optional(),
    step_price: z
      .number({ invalid_type_error: "Step price must be a number" })
      .min(0, { message: "Step price must be at least 0" }),
    description: z
      .string()
      .min(10, { message: "Description must be at least 10 characters" }),
    images: z
      .array(z.instanceof(File))
      .min(3, { message: "Please upload at least 3 photos" })
      .max(24, { message: "Maximum 24 photos allowed" }),
    allow_unrated_bidder: z.boolean().optional(),
    auto_extend: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.buy_now_enabled) {
      if (data.buy_now_price === null || data.buy_now_price === undefined) {
        ctx.addIssue({
          path: ["buy_now_price"],
          code: z.ZodIssueCode.custom,
          message: "Buy now price is required when enabled",
        });
      }
    }
  });

const ListingForm = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedParentId, setSelectedParentId] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currency, setCurrency] = useState("VND"); // VND or USD

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      buy_now_enabled: false,
      allow_unrated_bidder: false,
      auto_extend: false,
    },
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        // Backend returns { success: true, data: Category[], count: number }
        if (data && data.success && Array.isArray(data.data)) {
          setCategories(data.data);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Handle image file selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    addImages(files);
  };

  const addImages = (files) => {
    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    const newFiles = [...imageFiles, ...validFiles].slice(0, 24);
    setImageFiles(newFiles);
    setValue("images", newFiles);
    trigger("images");

    // Create previews
    const previews = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
    setValue("images", newFiles);
    trigger("images");
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    addImages(files);
  };

  // Form submit
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      const currentUser = (() => {
        try {
          return JSON.parse(localStorage.getItem("user"));
        } catch {
          return null;
        }
      })();

      if (!currentUser || !currentUser.id) {
        alert("Please sign in to create a listing");
        setIsSubmitting(false);
        return;
      }

      const defaultEndTime = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString();

      const payload = {
        seller_id: currentUser.id,
        category_id: data.category_id,
        name: data.name,
        description: data.description,
        start_price: data.start_price,
        step_price: data.step_price,
        buy_now_price: data.buy_now_enabled ? data.buy_now_price : null,
        allow_unrated_bidder: !!data.allow_unrated_bidder,
        auto_extend: !!data.auto_extend,
        currency_code: currency,
        end_time: defaultEndTime,
      };

      // Create product
      const created = await productAPI.createProduct(payload);
      const productId =
        created?.data?.id || created?.id || created?._id || created?.product_id;

      if (!productId) {
        throw new Error("Product created but no ID returned");
      }

      // Upload images
      if (imageFiles.length > 0) {
        await productAPI.uploadProductImages(productId, imageFiles);
      }

      alert("Listing created successfully!");

      // 3. Navigate to home page
      navigate("/");
    } catch (error) {
      console.error("Failed to create listing:", error);
      alert(error?.response?.data?.message || "Failed to create listing");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build parent/child maps
  const parentCategories = categories.filter((cat) => !cat.parent_id);
  const childCategories = categories.filter((cat) => cat.parent_id);
  const childrenByParent = childCategories.reduce((acc, cat) => {
    acc[cat.parent_id] = acc[cat.parent_id] || [];
    acc[cat.parent_id].push(cat);
    return acc;
  }, {});

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <h3 className="text-3xl font-bold mb-6">Create your listing</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* PHOTOS & VIDEO */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold mb-1">PHOTOS & VIDEO</h2>
              <p className="text-sm text-gray-600">
                You can add up to 24 photos. Buyers want to see all details and
                angles.
              </p>
            </div>
          </div>

          <div className="text-sm text-gray-600 mb-4">
            {imageFiles.length}/24
          </div>

          {errors.images && (
            <p className="text-red-500 text-sm mb-2">{errors.images.message}</p>
          )}

          {/* Initial Empty State - Large Drag & Drop Zone */}
          {imageFiles.length === 0 && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-16 text-center transition ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 bg-gray-50"
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-4">
                <svg
                  className="w-16 h-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-xl font-medium text-gray-700">
                  Drag and drop files
                </p>
                <label
                  htmlFor="image-upload"
                  className="px-8 py-3 bg-white border-2 border-gray-300 rounded-full text-base font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition"
                >
                  Upload from computer
                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Grid Layout After First Image */}
          {imageFiles.length > 0 && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="grid grid-cols-6 gap-4"
            >
              {/* First Image - Main (Larger - 3x size) */}
              {imagePreviews.length > 0 && (
                <div className="col-span-3 row-span-3 relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={imagePreviews[0]}
                    alt="Main preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(0)}
                    className="absolute top-2 right-2 !bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <div className="absolute bottom-3 left-3 bg-gray-700 text-white text-sm px-3 py-1.5 rounded font-medium">
                    Main
                  </div>
                </div>
              )}

              {/* Rest of the Images (Smaller - 12 visible initially) */}
              {imagePreviews.slice(1).map((preview, index) => (
                <div
                  key={index + 1}
                  className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200"
                >
                  <img
                    src={preview}
                    alt={`Preview ${index + 2}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index + 1)}
                    className="absolute top-2 right-2 !bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}

              {/* Add Button - only show when under 24 images */}
              {imageFiles.length < 24 && (
                <label
                  htmlFor="image-upload-grid"
                  className={`aspect-square bg-gray-50 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition ${
                    isDragging
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300"
                  }`}
                >
                  <svg
                    className="w-8 h-8 text-gray-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-600">Add</span>
                  <input
                    id="image-upload-grid"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}

              {/* Empty Slots - show placeholders dynamically */}
              {/* Show 9 slots initially (minus uploaded images), then expand by 4 when needed */}
              {(() => {
                const uploadedCount = imageFiles.length; // includes main
                let totalSlots = 9; // initial 9 child slots (main takes 9 cells)

                // If we have more than 9 images (1 main + 8   children), expand by 4 each time
                if (uploadedCount > 9) {
                  const extraImages = uploadedCount - 9;
                  totalSlots = 9 + Math.ceil(extraImages / 3) * 3;
                }

                // Cap at 23 child slots (24 total - 1 main)
                totalSlots = Math.min(totalSlots, 23);

                // Calculate empty slots: total slots - (uploaded - 1 main) - 1 add button
                const emptySlots = Math.max(
                  0,
                  totalSlots -
                    (uploadedCount - 1) -
                    (uploadedCount < 24 ? 1 : 0)
                );

                return Array.from({ length: emptySlots }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="aspect-square bg-gray-50 rounded-lg border-2 border-dashed border-gray-200"
                  />
                ));
              })()}
            </div>
          )}
        </section>

        {/* TITLE */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">TITLE</h2>
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Item title
            </label>
            <input
              id="name"
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Vintage leather shoes"
              {...register("name")}
            />
            <div className="flex justify-between items-center mt-2">
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
              <p className="text-sm text-gray-500 ml-auto">
                {watch("name")?.length || 0}/80
              </p>
            </div>
          </div>
        </section>

        {/* ITEM CATEGORY */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">ITEM CATEGORY</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="parent_category"
                className="block text-sm font-medium mb-2"
              >
                Parent category
              </label>
              <select
                id="parent_category"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedParentId}
                onChange={(e) => {
                  const pid = e.target.value;
                  setSelectedParentId(pid);
                  // If switching parent, clear current child selection
                  setValue("category_id", "");
                  trigger("category_id");
                }}
              >
                <option value="">Choose a parent...</option>
                {parentCategories.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="category_id"
                className="block text-sm font-medium mb-2"
              >
                Child category
              </label>
              <select
                id="category_id"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                disabled={!selectedParentId}
                {...register("category_id")}
              >
                <option value="">
                  {selectedParentId
                    ? "Choose a child..."
                    : "Select a parent first"}
                </option>
                {(childrenByParent[selectedParentId] || []).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.category_id.message}
                </p>
              )}
            </div>
          </div>

          {/* Breadcrumb preview */}
          {selectedParentId && watch("category_id") && (
            <p className="text-sm text-gray-600 mt-3">
              Selected:{" "}
              {parentCategories.find((p) => p.id === selectedParentId)?.name}
              {" / "}
              {childCategories.find((c) => c.id === watch("category_id"))?.name}
            </p>
          )}
        </section>

        {/* DESCRIPTION */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">DESCRIPTION</h2>
          <Editor
            apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
            value={watch("description") || ""}
            onEditorChange={(content) => {
              setValue("description", content);
              trigger("description");
            }}
            init={{
              height: 400,
              menubar: false,
              plugins: [
                "advlist",
                "autolink",
                "lists",
                "link",
                "image",
                "charmap",
                "preview",
                "anchor",
                "searchreplace",
                "visualblocks",
                "code",
                "fullscreen",
                "insertdatetime",
                "media",
                "table",
                "code",
                "help",
                "wordcount",
              ],
              toolbar:
                "undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
              content_style:
                'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 14px }',
              placeholder: "Write a detailed description of your item...",
            }}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-2">
              {errors.description.message}
            </p>
          )}
        </section>

        {/* PRICING */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">PRICING</h2>

          {/* Inline currency toggle (shared across all price inputs) */}
          <p className="text-xs text-gray-500 mb-4">
            Currency: {currency === "USD" ? "US Dollar" : "Vietnamese Đồng"} –
            click the symbol to change.
          </p>

          <div className="space-y-4">
            {/* Starting Bid */}
            <div>
              <label
                htmlFor="start_price"
                className="block text-sm font-medium mb-2"
              >
                Starting bid
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setCurrency(currency === "USD" ? "VND" : "USD")
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-semibold rounded border border-gray-300 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Toggle currency"
                >
                  {currency === "USD" ? "USD" : "VND"}
                </button>
                <input
                  id="start_price"
                  type="number"
                  step={currency === "USD" ? "0.01" : "1"}
                  className="w-full border border-gray-300 rounded-lg pl-16 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register("start_price", {
                    setValueAs: (v) => {
                      if (v === "" || v === null || v === undefined)
                        return null;
                      const num = Number(v);
                      return Number.isNaN(num) ? null : num;
                    },
                  })}
                />
              </div>
              {errors.start_price && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.start_price.message}
                </p>
              )}
            </div>

            {/* Buy It Now */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <input
                  id="buy_now_enabled"
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  {...register("buy_now_enabled")}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setValue("buy_now_enabled", checked);
                    if (!checked) {
                      setValue("buy_now_price", null);
                    }
                  }}
                />
                <label
                  htmlFor="buy_now_enabled"
                  className="text-sm font-medium"
                >
                  Buy It Now (optional)
                </label>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setCurrency(currency === "USD" ? "VND" : "USD")
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-semibold rounded border border-gray-300 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Toggle currency"
                >
                  {currency === "USD" ? "USD" : "VND"}
                </button>
                <input
                  id="buy_now_price"
                  type="number"
                  step={currency === "USD" ? "0.01" : "1"}
                  disabled={!watch("buy_now_enabled")}
                  className="w-full border border-gray-300 rounded-lg pl-16 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  {...register("buy_now_price", {
                    setValueAs: (v) => {
                      if (v === "" || v === null || v === undefined)
                        return null;
                      const num = Number(v);
                      return Number.isNaN(num) ? null : num;
                    },
                  })}
                />
              </div>
              {errors.buy_now_price && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.buy_now_price.message}
                </p>
              )}
            </div>

            {/* Step Price */}
            <div>
              <label
                htmlFor="step_price"
                className="block text-sm font-medium mb-2"
              >
                Minimum bid increment
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setCurrency(currency === "USD" ? "VND" : "USD")
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-semibold rounded border border-gray-300 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Toggle currency"
                >
                  {currency === "USD" ? "USD" : "VND"}
                </button>
                <input
                  id="step_price"
                  type="number"
                  step={currency === "USD" ? "0.01" : "1"}
                  className="w-full border border-gray-300 rounded-lg pl-16 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register("step_price", {
                    setValueAs: (v) => {
                      if (v === "" || v === null || v === undefined)
                        return null;
                      const num = Number(v);
                      return Number.isNaN(num) ? null : num;
                    },
                  })}
                />
              </div>
              {errors.step_price && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.step_price.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ADDITIONAL OPTIONS */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">ADDITIONAL OPTIONS</h2>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <input
                id="allow_unrated_bidder"
                type="checkbox"
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                {...register("allow_unrated_bidder")}
              />
              <label
                htmlFor="allow_unrated_bidder"
                className="text-sm text-gray-700"
              >
                <span className="font-medium">Allow Unrated Bidder</span>
                <p className="text-gray-500 mt-1">
                  Allow bidders without rating to participate in this auction
                </p>
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input
                id="auto_extend"
                type="checkbox"
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                {...register("auto_extend")}
              />
              <label htmlFor="auto_extend" className="text-sm text-gray-700">
                <span className="font-medium">Auto Extend</span>
                <p className="text-gray-500 mt-1">
                  Automatically extend auction time when bid placed in last
                  minutes
                </p>
              </label>
            </div>
          </div>
        </section>

        {/* Submit Button */}
        <div className="flex justify-center gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 text-white bg-midnight-ash rounded-lg font-semibold transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating Listing..." : "Create Listing"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ListingForm;
