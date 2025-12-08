"use client";

import { useState } from "react";
import OrderSummary from "./OrderSummary";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { Radio, RadioGroup } from "@headlessui/react";
import { CheckCircleIcon, TrashIcon } from "@heroicons/react/20/solid";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/designSystem";

const products = [
  {
    id: 1,
    title: "Basic Tee",
    href: "#",
    price: "$32.00",
    color: "Black",
    size: "Large",
    imageSrc:
      "https://tailwindui.com/plus-assets/img/ecommerce-images/checkout-page-02-product-01.jpg",
    imageAlt: "Front of men's Basic Tee in black.",
  },
  // More products...
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

export default function Checkout() {
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState(
    deliveryMethods[0]
  );
  const [showSummary, setShowSummary] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setShowSummary(true);
  }

  if (showSummary) {
    return <OrderSummary />;
  }

  return (
    <div
      style={{
        backgroundColor: COLORS.SOFT_CLOUD,
        paddingTop: SPACING.XXL,
        paddingBottom: SPACING.XXL,
      }}
    >
      <div
        style={{
          marginLeft: "auto",
          marginRight: "auto",
          maxWidth: "1400px",
          paddingLeft: SPACING.M,
          paddingRight: SPACING.M,
        }}
      >
        <h2 className="sr-only">Checkout</h2>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: SPACING.L,
          }}
        >
          <div>
            <div
              style={{
                backgroundColor: COLORS.WHITE,
                padding: SPACING.L,
                borderRadius: BORDER_RADIUS.MEDIUM,
              }}
            >
              <h2
                style={{
                  fontSize: TYPOGRAPHY.SIZE_HEADING_SM,
                  fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                  color: COLORS.MIDNIGHT_ASH,
                }}
              >
                Contact information
              </h2>

              <div style={{ marginTop: SPACING.M }}>
                <label
                  htmlFor="email-address"
                  style={{
                    display: "block",
                    fontSize: TYPOGRAPHY.SIZE_LABEL,
                    fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                    color: COLORS.MIDNIGHT_ASH,
                  }}
                >
                  Email address
                </label>
                <div style={{ marginTop: SPACING.S }}>
                  <input
                    id="email-address"
                    name="email-address"
                    type="email"
                    autoComplete="email"
                    style={{
                      width: "100%",
                      borderRadius: BORDER_RADIUS.MEDIUM,
                      backgroundColor: COLORS.WHITE,
                      padding: `${SPACING.S} ${SPACING.M}`,
                      fontSize: TYPOGRAPHY.SIZE_BODY,
                      color: COLORS.MIDNIGHT_ASH,
                      border: `1px solid ${COLORS.MORNING_MIST}`,
                      transition: "border-color 0.2s ease",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = COLORS.MIDNIGHT_ASH;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = COLORS.MORNING_MIST;
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: SPACING.L,
                backgroundColor: COLORS.WHITE,
                padding: SPACING.L,
                borderRadius: BORDER_RADIUS.MEDIUM,
              }}
            >
              <h2
                style={{
                  fontSize: TYPOGRAPHY.SIZE_HEADING_SM,
                  fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                  color: COLORS.MIDNIGHT_ASH,
                }}
              >
                Shipping information
              </h2>

              <div
                style={{
                  marginTop: SPACING.M,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: SPACING.M,
                }}
              >
                <div>
                  <label
                    htmlFor="first-name"
                    style={{
                      display: "block",
                      fontSize: TYPOGRAPHY.SIZE_LABEL,
                      fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                      color: COLORS.MIDNIGHT_ASH,
                    }}
                  >
                    First name
                  </label>
                  <div style={{ marginTop: SPACING.S }}>
                    <input
                      id="first-name"
                      name="first-name"
                      type="text"
                      autoComplete="given-name"
                      style={{
                        width: "100%",
                        borderRadius: BORDER_RADIUS.MEDIUM,
                        backgroundColor: COLORS.WHITE,
                        padding: `${SPACING.S} ${SPACING.M}`,
                        fontSize: TYPOGRAPHY.SIZE_BODY,
                        color: COLORS.MIDNIGHT_ASH,
                        border: `1px solid ${COLORS.MORNING_MIST}`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="last-name"
                    style={{
                      display: "block",
                      fontSize: TYPOGRAPHY.SIZE_LABEL,
                      fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                      color: COLORS.MIDNIGHT_ASH,
                    }}
                  >
                    Last name
                  </label>
                  <div style={{ marginTop: SPACING.S }}>
                    <input
                      id="last-name"
                      name="last-name"
                      type="text"
                      autoComplete="family-name"
                      style={{
                        width: "100%",
                        borderRadius: BORDER_RADIUS.MEDIUM,
                        backgroundColor: COLORS.WHITE,
                        padding: `${SPACING.S} ${SPACING.M}`,
                        fontSize: TYPOGRAPHY.SIZE_BODY,
                        color: COLORS.MIDNIGHT_ASH,
                        border: `1px solid ${COLORS.MORNING_MIST}`,
                      }}
                    />
                  </div>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label
                    htmlFor="company"
                    style={{
                      display: "block",
                      fontSize: TYPOGRAPHY.SIZE_LABEL,
                      fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                      color: COLORS.MIDNIGHT_ASH,
                    }}
                  >
                    Company
                  </label>
                  <div style={{ marginTop: SPACING.S }}>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      style={{
                        width: "100%",
                        borderRadius: BORDER_RADIUS.MEDIUM,
                        backgroundColor: COLORS.WHITE,
                        padding: `${SPACING.S} ${SPACING.M}`,
                        fontSize: TYPOGRAPHY.SIZE_BODY,
                        color: COLORS.MIDNIGHT_ASH,
                        border: `1px solid ${COLORS.MORNING_MIST}`,
                      }}
                    />
                  </div>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label
                    htmlFor="address"
                    style={{
                      display: "block",
                      fontSize: TYPOGRAPHY.SIZE_LABEL,
                      fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                      color: COLORS.MIDNIGHT_ASH,
                    }}
                  >
                    Address
                  </label>
                  <div style={{ marginTop: SPACING.S }}>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      autoComplete="street-address"
                      style={{
                        width: "100%",
                        borderRadius: BORDER_RADIUS.MEDIUM,
                        backgroundColor: COLORS.WHITE,
                        padding: `${SPACING.S} ${SPACING.M}`,
                        fontSize: TYPOGRAPHY.SIZE_BODY,
                        color: COLORS.MIDNIGHT_ASH,
                        border: `1px solid ${COLORS.MORNING_MIST}`,
                      }}
                    />
                  </div>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label
                    htmlFor="apartment"
                    style={{
                      display: "block",
                      fontSize: TYPOGRAPHY.SIZE_LABEL,
                      fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                      color: COLORS.MIDNIGHT_ASH,
                    }}
                  >
                    Apartment, suite, etc.
                  </label>
                  <div style={{ marginTop: SPACING.S }}>
                    <input
                      id="apartment"
                      name="apartment"
                      type="text"
                      style={{
                        width: "100%",
                        borderRadius: BORDER_RADIUS.MEDIUM,
                        backgroundColor: COLORS.WHITE,
                        padding: `${SPACING.S} ${SPACING.M}`,
                        fontSize: TYPOGRAPHY.SIZE_BODY,
                        color: COLORS.MIDNIGHT_ASH,
                        border: `1px solid ${COLORS.MORNING_MIST}`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="city"
                    style={{
                      display: "block",
                      fontSize: TYPOGRAPHY.SIZE_LABEL,
                      fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                      color: COLORS.MIDNIGHT_ASH,
                    }}
                  >
                    City
                  </label>
                  <div style={{ marginTop: SPACING.S }}>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      autoComplete="address-level2"
                      style={{
                        width: "100%",
                        borderRadius: BORDER_RADIUS.MEDIUM,
                        backgroundColor: COLORS.WHITE,
                        padding: `${SPACING.S} ${SPACING.M}`,
                        fontSize: TYPOGRAPHY.SIZE_BODY,
                        color: COLORS.MIDNIGHT_ASH,
                        border: `1px solid ${COLORS.MORNING_MIST}`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="country"
                    style={{
                      display: "block",
                      fontSize: TYPOGRAPHY.SIZE_LABEL,
                      fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                      color: COLORS.MIDNIGHT_ASH,
                    }}
                  >
                    Country
                  </label>
                  <div style={{ marginTop: SPACING.S, position: "relative" }}>
                    <select
                      id="country"
                      name="country"
                      autoComplete="country-name"
                      style={{
                        width: "100%",
                        borderRadius: BORDER_RADIUS.MEDIUM,
                        backgroundColor: COLORS.WHITE,
                        padding: `${SPACING.S} ${SPACING.M}`,
                        fontSize: TYPOGRAPHY.SIZE_BODY,
                        color: COLORS.MIDNIGHT_ASH,
                        border: `1px solid ${COLORS.MORNING_MIST}`,
                        paddingRight: "32px",
                      }}
                    >
                      <option>United States</option>
                      <option>Canada</option>
                      <option>Mexico</option>
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

                <div>
                  <label
                    htmlFor="region"
                    style={{
                      display: "block",
                      fontSize: TYPOGRAPHY.SIZE_LABEL,
                      fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                      color: COLORS.MIDNIGHT_ASH,
                    }}
                  >
                    State / Province
                  </label>
                  <div style={{ marginTop: SPACING.S }}>
                    <input
                      id="region"
                      name="region"
                      type="text"
                      autoComplete="address-level1"
                      style={{
                        width: "100%",
                        borderRadius: BORDER_RADIUS.MEDIUM,
                        backgroundColor: COLORS.WHITE,
                        padding: `${SPACING.S} ${SPACING.M}`,
                        fontSize: TYPOGRAPHY.SIZE_BODY,
                        color: COLORS.MIDNIGHT_ASH,
                        border: `1px solid ${COLORS.MORNING_MIST}`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="postal-code"
                    style={{
                      display: "block",
                      fontSize: TYPOGRAPHY.SIZE_LABEL,
                      fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                      color: COLORS.MIDNIGHT_ASH,
                    }}
                  >
                    Postal code
                  </label>
                  <div style={{ marginTop: SPACING.S }}>
                    <input
                      id="postal-code"
                      name="postal-code"
                      type="text"
                      autoComplete="postal-code"
                      style={{
                        width: "100%",
                        borderRadius: BORDER_RADIUS.MEDIUM,
                        backgroundColor: COLORS.WHITE,
                        padding: `${SPACING.S} ${SPACING.M}`,
                        fontSize: TYPOGRAPHY.SIZE_BODY,
                        color: COLORS.MIDNIGHT_ASH,
                        border: `1px solid ${COLORS.MORNING_MIST}`,
                      }}
                    />
                  </div>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label
                    htmlFor="phone"
                    style={{
                      display: "block",
                      fontSize: TYPOGRAPHY.SIZE_LABEL,
                      fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                      color: COLORS.MIDNIGHT_ASH,
                    }}
                  >
                    Phone
                  </label>
                  <div style={{ marginTop: SPACING.S }}>
                    <input
                      id="phone"
                      name="phone"
                      type="text"
                      autoComplete="tel"
                      style={{
                        width: "100%",
                        borderRadius: BORDER_RADIUS.MEDIUM,
                        backgroundColor: COLORS.WHITE,
                        padding: `${SPACING.S} ${SPACING.M}`,
                        fontSize: TYPOGRAPHY.SIZE_BODY,
                        color: COLORS.MIDNIGHT_ASH,
                        border: `1px solid ${COLORS.MORNING_MIST}`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: SPACING.L,
                backgroundColor: COLORS.WHITE,
                padding: SPACING.L,
                borderRadius: BORDER_RADIUS.MEDIUM,
              }}
            >
              <fieldset>
                <legend
                  style={{
                    fontSize: TYPOGRAPHY.SIZE_HEADING_SM,
                    fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                    color: COLORS.MIDNIGHT_ASH,
                  }}
                >
                  Delivery method
                </legend>
                <RadioGroup
                  value={selectedDeliveryMethod}
                  onChange={setSelectedDeliveryMethod}
                  style={{
                    marginTop: SPACING.M,
                    display: "grid",
                    gap: SPACING.M,
                  }}
                >
                  {deliveryMethods.map((deliveryMethod) => (
                    <Radio
                      key={deliveryMethod.id}
                      value={deliveryMethod}
                      aria-label={deliveryMethod.title}
                      aria-description={`${deliveryMethod.turnaround} for ${deliveryMethod.price}`}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        padding: SPACING.M,
                        border: `1px solid ${COLORS.MORNING_MIST}`,
                        borderRadius: BORDER_RADIUS.MEDIUM,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {({ checked }) => (
                        <>
                          <div style={{ flex: 1 }}>
                            <p
                              style={{
                                fontSize: TYPOGRAPHY.SIZE_BODY,
                                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                                color: COLORS.MIDNIGHT_ASH,
                              }}
                            >
                              {deliveryMethod.title}
                            </p>
                            <p
                              style={{
                                marginTop: SPACING.S,
                                fontSize: TYPOGRAPHY.SIZE_LABEL,
                                color: COLORS.PEBBLE,
                              }}
                            >
                              {deliveryMethod.turnaround}
                            </p>
                            <p
                              style={{
                                marginTop: SPACING.M,
                                fontSize: TYPOGRAPHY.SIZE_BODY,
                                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                                color: COLORS.MIDNIGHT_ASH,
                              }}
                            >
                              {deliveryMethod.price}
                            </p>
                          </div>
                          {checked && (
                            <CheckCircleIcon
                              style={{
                                width: "20px",
                                height: "20px",
                                color: COLORS.MIDNIGHT_ASH,
                                marginLeft: SPACING.M,
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </>
                      )}
                    </Radio>
                  ))}
                </RadioGroup>
              </fieldset>
            </div>
          </div>

          {/* Order summary */}
          <div>
            <h2
              style={{
                fontSize: TYPOGRAPHY.SIZE_HEADING_SM,
                fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                color: COLORS.MIDNIGHT_ASH,
                marginBottom: SPACING.M,
              }}
            >
              Order summary
            </h2>

            <div
              style={{
                borderRadius: BORDER_RADIUS.MEDIUM,
                border: `1px solid ${COLORS.MORNING_MIST}`,
                backgroundColor: COLORS.WHITE,
                boxShadow: SHADOWS.SUBTLE,
                overflow: "hidden",
              }}
            >
              <h3 className="sr-only">Items in your cart</h3>
              <ul
                role="list"
                style={{ borderBottom: `1px solid ${COLORS.MORNING_MIST}` }}
              >
                {products.map((product) => (
                  <li
                    key={product.id}
                    style={{
                      display: "flex",
                      padding: SPACING.M,
                      borderBottom: `1px solid ${COLORS.MORNING_MIST}`,
                    }}
                  >
                    <div style={{ flexShrink: 0 }}>
                      <img
                        alt={product.imageAlt}
                        src={product.imageSrc}
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: BORDER_RADIUS.MEDIUM,
                          objectFit: "cover",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        marginLeft: SPACING.M,
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4
                            style={{
                              fontSize: TYPOGRAPHY.SIZE_BODY,
                              fontWeight: TYPOGRAPHY.WEIGHT_MEDIUM,
                              color: COLORS.MIDNIGHT_ASH,
                            }}
                          >
                            <a href={product.href}>{product.title}</a>
                          </h4>
                          <p
                            style={{
                              marginTop: SPACING.S,
                              fontSize: TYPOGRAPHY.SIZE_LABEL,
                              color: COLORS.PEBBLE,
                            }}
                          >
                            {product.color}
                          </p>
                          <p
                            style={{
                              marginTop: SPACING.S,
                              fontSize: TYPOGRAPHY.SIZE_LABEL,
                              color: COLORS.PEBBLE,
                            }}
                          >
                            {product.size}
                          </p>
                        </div>

                        <button
                          type="button"
                          style={{
                            marginLeft: SPACING.M,
                            backgroundColor: COLORS.WHITE,
                            color: COLORS.PEBBLE,
                            border: "none",
                            cursor: "pointer",
                            padding: SPACING.S,
                            transition: "color 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.color = COLORS.MIDNIGHT_ASH;
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = COLORS.PEBBLE;
                          }}
                        >
                          <span className="sr-only">Remove</span>
                          <TrashIcon
                            style={{ width: "20px", height: "20px" }}
                          />
                        </button>
                      </div>

                      <div
                        style={{
                          marginTop: "auto",
                          paddingTop: SPACING.M,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <p
                          style={{
                            marginTop: SPACING.S,
                            fontSize: TYPOGRAPHY.SIZE_BODY,
                            fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                            color: COLORS.MIDNIGHT_ASH,
                          }}
                        >
                          {product.price}
                        </p>

                        <div style={{ position: "relative" }}>
                          <select
                            id="quantity"
                            name="quantity"
                            aria-label="Quantity"
                            style={{
                              borderRadius: BORDER_RADIUS.MEDIUM,
                              backgroundColor: COLORS.WHITE,
                              padding: `${SPACING.S} ${SPACING.M}`,
                              fontSize: TYPOGRAPHY.SIZE_BODY,
                              color: COLORS.MIDNIGHT_ASH,
                              border: `1px solid ${COLORS.MORNING_MIST}`,
                              paddingRight: "32px",
                            }}
                          >
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                            <option value={5}>5</option>
                            <option value={6}>6</option>
                            <option value={7}>7</option>
                            <option value={8}>8</option>
                          </select>
                          <ChevronDownIcon
                            style={{
                              position: "absolute",
                              right: SPACING.S,
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
                    </div>
                  </li>
                ))}
              </ul>
              <dl
                style={{
                  padding: SPACING.M,
                  display: "grid",
                  gap: SPACING.M,
                  borderBottom: `1px solid ${COLORS.MORNING_MIST}`,
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <dt
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_BODY,
                      color: COLORS.PEBBLE,
                    }}
                  >
                    Subtotal
                  </dt>
                  <dd
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_BODY,
                      fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                      color: COLORS.MIDNIGHT_ASH,
                    }}
                  >
                    $64.00
                  </dd>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <dt
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_BODY,
                      color: COLORS.PEBBLE,
                    }}
                  >
                    Shipping
                  </dt>
                  <dd
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_BODY,
                      fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                      color: COLORS.MIDNIGHT_ASH,
                    }}
                  >
                    $5.00
                  </dd>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <dt
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_BODY,
                      color: COLORS.PEBBLE,
                    }}
                  >
                    Taxes
                  </dt>
                  <dd
                    style={{
                      fontSize: TYPOGRAPHY.SIZE_BODY,
                      fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                      color: COLORS.MIDNIGHT_ASH,
                    }}
                  >
                    $5.52
                  </dd>
                </div>
              </dl>

              <div
                style={{
                  padding: SPACING.M,
                  display: "flex",
                  justifyContent: "space-between",
                  borderTop: `1px solid ${COLORS.MORNING_MIST}`,
                }}
              >
                <dt
                  style={{
                    fontSize: TYPOGRAPHY.SIZE_HEADING_SM,
                    fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                    color: COLORS.MIDNIGHT_ASH,
                  }}
                >
                  Total
                </dt>
                <dd
                  style={{
                    fontSize: TYPOGRAPHY.SIZE_HEADING_SM,
                    fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                    color: COLORS.MIDNIGHT_ASH,
                  }}
                >
                  $75.52
                </dd>
              </div>

              <div
                style={{
                  padding: SPACING.M,
                  borderTop: `1px solid ${COLORS.MORNING_MIST}`,
                }}
              >
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    borderRadius: BORDER_RADIUS.MEDIUM,
                    border: "none",
                    backgroundColor: COLORS.MIDNIGHT_ASH,
                    padding: SPACING.M,
                    fontSize: TYPOGRAPHY.SIZE_BODY,
                    fontWeight: TYPOGRAPHY.WEIGHT_SEMIBOLD,
                    color: COLORS.WHITE,
                    cursor: "pointer",
                    transition: "opacity 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
                  onMouseLeave={(e) => (e.target.style.opacity = "1")}
                >
                  Confirm order
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
