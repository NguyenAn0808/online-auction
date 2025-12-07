"use client";

import { useState } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Radio,
  RadioGroup,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import { StarIcon } from "@heroicons/react/20/solid";
import { HeartIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import BiddingQuickView from "./BiddingQuickView";
import EditProductModal from "./EditProductModal";
import { productService } from "../services/productService";
const product = {
  name: "Zip Tote Basket",
  price: "$140",
  rating: 4,
  images: [
    {
      id: 1,
      name: "Angled view",
      src: "https://tailwindui.com/plus-assets/img/ecommerce-images/product-page-03-product-01.jpg",
      alt: "Angled front view with bag zipped and handles upright.",
    },
    // More images...
  ],
  colors: [
    {
      name: "Washed Black",
      bgColor: "bg-gray-700",
      selectedColor: "ring-gray-700",
    },
    { name: "White", bgColor: "bg-white", selectedColor: "ring-gray-400" },
    {
      name: "Washed Gray",
      bgColor: "bg-gray-500",
      selectedColor: "ring-gray-500",
    },
  ],
  description: `
    <p>The Zip Tote Basket is the perfect midpoint between shopping tote and comfy backpack. With convertible straps, you can hand carry, should sling, or backpack this convenient and spacious bag. The zip top and durable canvas construction keeps your goods protected for all-day use.</p>
  `,
  details: [
    {
      name: "Features",
      items: [
        "Multiple strap configurations",
        "Spacious interior with top zip",
        "Leather handle and tabs",
        "Interior dividers",
        "Stainless strap loops",
        "Double stitched construction",
        "Water-resistant",
      ],
    },
    // More sections...
  ],
  dueTime: "2025-12-31T23:59:59Z",
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ProductOverview() {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);

  const [showBidQuickView, setShowBidQuickView] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);

  const openBidQuickView = () => {
    setBidAmount("");
    setShowBidQuickView(true);
  };
  const closeBidQuickView = () => setShowBidQuickView(false);
  const openEdit = () => setIsEditOpen(true);
  const closeEdit = () => setIsEditOpen(false);

  const handleUpdateProduct = async (productId, data) => {
    const payload = {
      name: data.name,
      description: data.description,
      start_price: data.start_price,
      step_price: data.step_price,
      buy_now_price: data.buy_now_price ?? null,
      allow_unrated_bidder: !!data.allow_unrated_bidder,
      auto_extend: !!data.auto_extend,
    };
    await productService.updateProduct(productId, payload);
    alert("Product updated successfully!");
  };

  const submitBid = (e) => {
    e.preventDefault();
    // minimal validation
    const amount = parseFloat(bidAmount.replace(/[^0-9.]/g, ""));
    if (!amount || amount <= 0) {
      // you can replace with real toast/validation UI
      alert("Enter a valid bid amount.");
      return;
    }

    // TODO: hook into API to place bid
    console.log("Placing bid:", amount);
    // close quick view after placing bid
    setShowBidQuickView(false);
    // optionally show confirmation/toast here
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          {/* Image gallery */}
          <TabGroup className="flex flex-col-reverse">
            {/* Image selector */}
            <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
              <TabList className="grid grid-cols-4 gap-6">
                {product.images.map((image) => (
                  <Tab
                    key={image.id}
                    className="group relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium text-gray-900 uppercase hover:bg-gray-50 focus:ring-3 focus:ring-indigo-500/50 focus:ring-offset-4 focus:outline-hidden"
                  >
                    <span className="sr-only">{image.name}</span>
                    <span className="absolute inset-0 overflow-hidden rounded-md">
                      <img
                        alt=""
                        src={image.src}
                        className="size-full object-cover"
                      />
                    </span>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-md ring-2 ring-transparent ring-offset-2 group-data-selected:ring-indigo-500"
                    />
                  </Tab>
                ))}
              </TabList>
            </div>

            <TabPanels>
              {product.images.map((image) => (
                <TabPanel key={image.id}>
                  <img
                    alt={image.alt}
                    src={image.src}
                    className="aspect-square w-full object-cover sm:rounded-lg"
                  />
                </TabPanel>
              ))}
            </TabPanels>
          </TabGroup>

          {/* Product info */}
          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            <div className="flex items-center gap-5">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {product.name}
              </h1>

              <button
                type="button"
                onClick={openEdit}
                className="rounded-full border !border-gray-300 !bg-white p-2 text-sm !text-gray-700 hover:!bg-gray-50"
                aria-label="Edit product"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl tracking-tight text-gray-900">
                {product.price}
              </p>
            </div>

            {/* Reviews */}
            <div className="mt-3">
              <h3 className="sr-only">Reviews</h3>
              <div className="flex items-center">
                <div className="flex items-center">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <StarIcon
                      key={rating}
                      aria-hidden="true"
                      className={classNames(
                        product.rating > rating
                          ? "text-indigo-500"
                          : "text-gray-300",
                        "size-5 shrink-0"
                      )}
                    />
                  ))}
                </div>
                <p className="sr-only">{product.rating} out of 5 stars</p>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-500 font-bold">
              <p>
                Time left: {/* Calculate and display remaining time */}
                {(() => {
                  const now = new Date();
                  const due = new Date(product.dueTime);
                  if (due <= now) return "Ended";
                  const diff = Math.max(0, due - now);
                  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                  const hours = Math.floor(
                    (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                  );
                  const minutes = Math.floor(
                    (diff % (1000 * 60 * 60)) / (1000 * 60)
                  );
                  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
                  if (hours > 0) return `${hours}h ${minutes}m`;
                  return `${minutes}m`;
                })()}
              </p>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Description</h3>

              <div
                dangerouslySetInnerHTML={{ __html: product.description }}
                className="space-y-6 text-base text-gray-700"
              />
            </div>

            <form className="mt-6">
              {/* Colors */}
              <div>
                <h3 className="text-sm font-medium text-gray-600">Color</h3>

                <fieldset aria-label="Choose a color" className="mt-2">
                  <RadioGroup
                    value={selectedColor}
                    onChange={setSelectedColor}
                    className="flex items-center gap-x-3"
                  >
                    {product.colors.map((color) => (
                      <Radio
                        key={color.name}
                        value={color}
                        aria-label={color.name}
                        className={classNames(
                          color.selectedColor,
                          "relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-hidden data-checked:ring-2 data-focus:data-checked:ring-3 data-focus:data-checked:ring-offset-1"
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={classNames(
                            color.bgColor,
                            "size-8 rounded-full border border-black/10"
                          )}
                        />
                      </Radio>
                    ))}
                  </RadioGroup>
                </fieldset>
              </div>

              <div className="mt-10 flex flex-col gap-4">
                <button
                  type="button"
                  onClick={openBidQuickView}
                  className="w-full flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-gray-700 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-500 focus:outline-hidden"
                >
                  Place bid
                </button>

                <button
                  type="button"
                  className="w-full flex items-center justify-center rounded-md border border-gray-200 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50"
                >
                  <HeartIcon aria-hidden="true" className="size-6 mr-2" />
                  Add to watchlist
                </button>

                <button
                  type="button"
                  className="w-full flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-gray-700 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 focus:outline-hidden"
                >
                  Buy it now
                </button>

                <button
                  type="button"
                  className="w-full flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-gray-700 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 focus:outline-hidden"
                >
                  Add to bag
                </button>
              </div>
            </form>

            <section aria-labelledby="details-heading" className="mt-12">
              <h2 id="details-heading" className="sr-only">
                Additional details
              </h2>

              <div className="divide-y divide-gray-200 border-t">
                {product.details.map((detail) => (
                  <Disclosure key={detail.name} as="div">
                    <h3>
                      <DisclosureButton className="group relative flex w-full items-center justify-between py-6 text-left">
                        <span className="text-sm font-medium text-gray-900 group-data-open:text-indigo-600">
                          {detail.name}
                        </span>
                        <span className="ml-6 flex items-center">
                          <PlusIcon
                            aria-hidden="true"
                            className="block size-6 text-gray-400 group-hover:text-gray-500 group-data-open:hidden"
                          />
                          <MinusIcon
                            aria-hidden="true"
                            className="hidden size-6 text-indigo-400 group-hover:text-indigo-500 group-data-open:block"
                          />
                        </span>
                      </DisclosureButton>
                    </h3>
                    <DisclosurePanel className="pb-6">
                      <ul
                        role="list"
                        className="list-disc space-y-1 pl-5 text-sm/6 text-gray-700 marker:text-gray-300"
                      >
                        {detail.items.map((item) => (
                          <li key={item} className="pl-2">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </DisclosurePanel>
                  </Disclosure>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
      {/* Quick view modal (controlled) */}
      <BiddingQuickView open={showBidQuickView} onClose={closeBidQuickView} />
      {/* Edit product modal (controlled) */}
      <EditProductModal
        isOpen={isEditOpen}
        onClose={closeEdit}
        product={{
          id: "550e8400-e29b-41d4-a716-446655440000",
          name: product.name,
          start_price: 100000,
          buy_now_price: null,
          step_price: 10000,
          description: "A beautiful vintage watch from the 1960s",
          allow_unrated_bidder: true,
          auto_extend: false,
          images: [
            {
              id: 1,
              url: "https://tailwindui.com/plus-assets/img/ecommerce-images/product-page-03-product-01.jpg",
            },
            {
              id: 2,
              url: "https://tailwindui.com/plus-assets/img/ecommerce-images/product-page-03-product-02.jpg",
            },
            {
              id: 3,
              url: "https://tailwindui.com/plus-assets/img/ecommerce-images/product-page-03-product-03.jpg",
            },
            {
              id: 4,
              url: "https://tailwindui.com/plus-assets/img/ecommerce-images/product-page-03-product-04.jpg",
            },
          ],
        }}
        onUpdate={handleUpdateProduct}
      />
    </div>
  );
}
