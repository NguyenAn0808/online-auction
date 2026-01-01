import {
  Route,
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
} from "react-router-dom";

// Authentication Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

// Pages - General
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import Conversation from "./pages/Conversation";

// Pages - Products & Categories
import ProductListingPage from "./pages/ProductListingPage";
import ProductDetails from "./pages/ProductDetails";
// import ProductDetailPage from "./pages/ProductDetailPage"; // Kept commented as per source

// Pages - Buying & Bidding
import { BiddingPage } from "./pages/BiddingPage";
import OrderPage from "./pages/OrderPage";
import BidsOffers from "./pages/BidsOffers";
import Watchlist from "./pages/Watchlist";

// Pages - User & Profile
import { BidderProfilePage } from "./pages/BidderProfilePage";
import Ratings from "./pages/Ratings";

// Pages - Transactions
import TransactionHistory from "./pages/TransactionHistory";
import TransactionPage from "./pages/TransactionPage";
import SellerTransactions from "./pages/SellerTransactions";

// Pages - Selling
import ListingPage from "./pages/ListingPage";
import SellingRequestPage from "./pages/SellingRequestPage";

// Pages - Admin
import AdminDashboardPage from "./pages/AdminDashboardPage";
import CategoryManagementPage from "./pages/CategoryManagementPage";
import ProductManagementPage from "./pages/ProductManagementPage";
import UserManagementPage from "./pages/UserManagementPage";
import SellerUpgradesPage from "./pages/SellerUpgradesPage";
import SystemSettingsPage from "./pages/SystemSettingsPage";
import ProtectedRoute from "./components/ProtectedRoute";
// Services
import OAuthCallback from "./pages/OAuthCallback";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Authentication */}
      <Route path="/auth/*" element={<MainLayout />}>
        <Route path="signin" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="callback" element={<OAuthCallback />} />
      </Route>
      {/* --- Main Client Layout --- */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />

        {/* PUBLIC ROUTES (Guest, Bidder, Seller) */}
        {/* Product Routes */}
        <Route path="products" element={<ProductListingPage />} />
        <Route path="products/:productId" element={<ProductDetails />} />

        {/* PROTECTED ROUTES (Logged in Users Only - Bidders & Sellers) */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["bidder", "seller", "admin"]} />
          }
        >
          <Route path="products/:userId/bidding" element={<BidsOffers />} />

          {/* Bidding & Orders */}
          <Route path="bids/:bidId" element={<BiddingPage />} />
          <Route path="orders/:productId" element={<OrderPage />} />

          {/* User Specific */}
          <Route path="conversations" element={<Conversation />} />
          <Route path="summary/:userId" element={<BidderProfilePage />} />
          <Route path="watchlists/:userId" element={<Watchlist />} />
          <Route path="ratings/:userId" element={<Ratings />} />
          {/* Transactions */}
          {/* Note: Kept all variations found in source to ensure coverage */}
          <Route path="transactions" element={<TransactionHistory />} />
          <Route path="transactions/create" element={<TransactionPage />} />
          <Route
            path="transactions-old/:transactionId"
            element={<TransactionHistory />}
          />
          <Route path="upgrade-requests" element={<SellingRequestPage />} />
        </Route>

        {/* SELLER ONLY ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={["seller", "admin"]} />}>
          <Route path="seller/transactions" element={<SellerTransactions />} />
          {/* Note: 'upgrade-requests' is typically for Bidders who want to become Sellers, 
                so it might need 'bidder' access depending on your flow */}
          <Route path="seller/listing" element={<ListingPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* --- Admin Layout (ADMIN ONLY) --- */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="categories" element={<CategoryManagementPage />} />
          <Route path="products" element={<ProductManagementPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="seller-upgrades" element={<SellerUpgradesPage />} />
          <Route path="settings" element={<SystemSettingsPage />} />
        </Route>
      </Route>
    </>
  )
);

export default function App() {
  return <RouterProvider router={router} />;
}
