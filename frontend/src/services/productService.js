import axios from "axios";

// Simple in-memory product service for UI/demo purposes.
let _product = null;
let _bids = [];
let _qa = [];
let _similar = [];
let _ratings = {};

function createDemo() {
  _product = {
    id: "prod-1",
    name: "Zip Tote Basket",
    price: 140.0,
    // minimum increment step for suggested/valid bids (currency units)
    minIncrement: 100.0,
    buyNowPrice: 199.0,
    postedAt: "2025-11-25T10:30:00Z",
    rating: 4,
    // Auction ended - highest bid is set
    highestBid: 275.0,
    highestBidder: { id: "buyer-1", name: "Lisa Wong", rating: 4.8 },
    images: [
      {
        id: 1,
        name: "Angled view",
        src: "https://tailwindui.com/plus-assets/img/ecommerce-images/product-page-03-product-01.jpg",
        alt: "Angled front view with bag zipped and handles upright.",
      },
      {
        id: 2,
        name: "Front view",
        src: "https://tailwindui.com/plus-assets/img/ecommerce-images/product-page-03-product-02.jpg",
        alt: "Front view with bag zipped and handles upright.",
      },
      {
        id: 3,
        name: "Back view",
        src: "https://tailwindui.com/plus-assets/img/ecommerce-images/product-page-03-product-03.jpg",
        alt: "Back view with bag zipped and handles upright.",
      },
      {
        id: 4,
        name: "Open view",
        src: "https://tailwindui.com/plus-assets/img/ecommerce-images/product-page-03-product-04.jpg",
        alt: "Top down view with bag open.",
      },
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
    description: `\n      <p>The Zip Tote Basket is the perfect midpoint between shopping tote and comfy backpack. With convertible straps, you can hand carry, should sling, or backpack this convenient and spacious bag. The zip top and durable canvas construction keeps your goods protected for all-day use.</p>\n    `,
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
    ],
    dueTime: "2025-12-01T23:59:59Z", // Ended auction
    seller: {
      id: "seller-1",
      name: "Seller Co.",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=256&q=80",
      rating: 4.6,
      totalReviews: 1624,
      // whether seller allows unrated bidders to place bids
      allowUnratedBuyers: true,
    },
  };

  _bids = [
    {
      id: 1,
      name: "Jane Cooper",
      time: new Date(Date.now() - 3600e3).toISOString(),
      amount: 200.0,
    },
    {
      id: 2,
      name: "John Doe",
      time: new Date(Date.now() - 2 * 3600e3).toISOString(),
      amount: 250.0,
    },
    {
      id: 3,
      name: "Alex Smith",
      time: new Date(Date.now() - 3 * 3600e3).toISOString(),
      amount: 180.0,
    },
    {
      id: 4,
      name: "Lisa Wong",
      time: new Date(Date.now() - 30 * 60e3).toISOString(),
      amount: 275.0,
    },
  ];

  // simple demo rating counts (positive, negative) per bidder
  _ratings = {
    "Jane Cooper": { positive: 5, negative: 0 },
    "John Doe": { positive: 4, negative: 1 },
    "Alex Smith": { positive: 8, negative: 2 },
    "Lisa Wong": { positive: 9, negative: 1 },
    TestBidder: { positive: 18, negative: 2 }, // 90% score - eligible to bid
  };

  _qa = [
    {
      id: 1,
      question: "Does this bag include a shoulder strap?",
      questionBy: "Buyer123",
      role: "bidder",
      questionAt: new Date(Date.now() - 48 * 3600e3).toISOString(),
      answer: "Yes — it includes a detachable, adjustable shoulder strap.",
      answerBy: "Seller Co.",
      answerAt: new Date(Date.now() - 47 * 3600e3).toISOString(),
    },
    {
      id: 2,
      question: "Is the color true to the images?",
      questionBy: "CuriousUser",
      role: "bidder",
      questionAt: new Date(Date.now() - 24 * 3600e3).toISOString(),
      answer: "Colors are accurate under daylight; monitors may vary slightly.",
      answerBy: "Seller Co.",
      answerAt: new Date(Date.now() - 23.5 * 3600e3).toISOString(),
    },
  ];

  _similar = [
    {
      id: 1,
      name: "Canvas Weekend Bag",
      color: "Natural",
      href: "#",
      imageSrc:
        "https://tailwindui.com/plus-assets/img/ecommerce-images/product-page-03-related-product-02.jpg",
      imageAlt: "Canvas weekend bag on a table.",
      price: 95,
    },
    {
      id: 2,
      name: "Leather Crossbody",
      color: "Tan",
      href: "#",
      imageSrc:
        "https://tailwindui.com/plus-assets/img/ecommerce-images/product-page-03-related-product-03.jpg",
      imageAlt: "Leather crossbody bag.",
      price: 160,
    },
    {
      id: 3,
      name: "Mini Backpack",
      color: "Olive",
      href: "#",
      imageSrc:
        "https://tailwindui.com/plus-assets/img/ecommerce-images/product-page-03-related-product-04.jpg",
      imageAlt: "Mini backpack with straps.",
      price: 120,
    },
    {
      id: 4,
      name: "Market Tote",
      color: "Striped",
      href: "#",
      imageSrc:
        "https://tailwindui.com/plus-assets/img/ecommerce-images/product-page-03-related-product-05.jpg",
      imageAlt: "Striped market tote.",
      price: 80,
    },
    {
      id: 5,
      name: "Zip Organizer",
      color: "Black",
      href: "#",
      imageSrc:
        "https://tailwindui.com/plus-assets/img/ecommerce-images/product-page-03-related-product-01.jpg",
      imageAlt: "Zip organizer pouch.",
      price: 40,
    },
  ];
}

createDemo();

export function getProduct() {
  // ignoring id for demo; return a shallow clone
  return { ..._product };
}

export async function getProductById(id) {
  try {
    // 1. Try to fetch REAL data from your Backend
    // Adjust the port (8000) if your backend runs elsewhere
    const response = await axios.get(
      `http://localhost:8000/api/products/${id}`
    );

    // console.log("Backend Response:", response.data);
    // 2. Return the real data
    const productData = response.data.data || response.data;
    return productData;
  } catch (error) {
    console.error("API CALL FAILED DETAILS:", error.response || error.message);
    console.warn(
      `Failed to fetch product ${id} from API, falling back to mock data.`
    );

    // 3. Fallback: If API fails, return the Mock Zip Tote Basket
    return getProduct();
  }
}

export function getBidEligibility(name) {
  // returns { allowed: boolean, score: number (0-1), positive, negative }
  if (!name) return { allowed: false, score: 0, positive: 0, negative: 0 };
  const counts = _ratings[name];
  if (!counts) {
    // unrated buyer: allowed only if seller permits
    return {
      allowed: !!(
        _product &&
        _product.seller &&
        _product.seller.allowUnratedBuyers
      ),
      score: 0,
      positive: 0,
      negative: 0,
    };
  }
  const positive = counts.positive || 0;
  const negative = counts.negative || 0;
  const total = positive + negative;
  const score = total > 0 ? positive / total : 0;
  const allowed = score >= 0.8;
  return { allowed, score, positive, negative };
}

export function suggestNextBid() {
  const base = _product.highestBid || _product.price || 0;
  const step = _product.minIncrement || 0;
  return Math.round((base + step) * 100) / 100;
}

export function addQuestion(q) {
  const item = {
    id: Date.now(),
    question: q.question,
    questionBy: q.questionBy || "Anonymous",
    role: q.role || "bidder",
    questionAt: new Date().toISOString(),
    answer: q.answer || null,
    answerBy: q.answerBy || null,
    answerAt: q.answerAt || null,
  };
  _qa.unshift(item);
  return item;
}

export function getBidHistory() {
  return [..._bids].sort((a, b) => b.amount - a.amount);
}

export function getQuestions() {
  return [..._qa];
}

export function getSimilarProducts() {
  return [..._similar];
}

export function placeBid({ name, amount }) {
  const bid = { id: Date.now(), name, time: new Date().toISOString(), amount };
  _bids.push(bid);
  // update highest bid on product
  _product = {
    ..._product,
    highestBid: Math.max(_product.highestBid || 0, amount),
    highestBidder: { name },
  };
  return bid;
}

export function reset() {
  createDemo();
}

export const productService = {
  ...productAPI,
  ...productHelpers,
};

export default productService;
