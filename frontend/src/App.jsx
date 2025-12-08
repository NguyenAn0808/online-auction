import {
  Route,
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import ProductDetails from "./pages/ProductDetails";
import { BiddingPage } from "./pages/BiddingPage";
import OrderPage from "./pages/OrderPage";
import { BidderProfilePage } from "./pages/BidderProfilePage";
import Conversation from "./pages/Conversation";
import Watchlist from "./pages/Watchlist";
import Ratings from "./pages/Ratings";
import BidsOffers from "./pages/BidsOffers";
import TransactionWizard from "./pages/TransactionWizard";
import TransactionPage from "./pages/TransactionPage";
import SellerTransactions from "./pages/SellerTransactions";
import ProductListingPage from "./pages/ProductListingPage";
import ListingPage from "./pages/ListingPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import CategoryManagementPage from "./pages/CategoryManagementPage";
import ProductManagementPage from "./pages/ProductManagementPage";
import UserManagementPage from "./pages/UserManagementPage";
import SellerUpgradesPage from "./pages/SellerUpgradesPage";
import SystemSettingsPage from "./pages/SystemSettingsPage";
import SellingRequestPage from "./pages/SellingRequestPage";
import { seedDemo } from "./services/transactionService";
// import ProductDetailPage from "./pages/ProductDetailPage";
// import ProductListingPage from "./pages/ProductListingPage";

// Seed demo transactions on app load
seedDemo();

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductListingPage />} />
        <Route path="products/:productId" element={<ProductDetails />} />
        <Route path="bids/:bidId" element={<BiddingPage />} />
        <Route path="orders/:productId" element={<OrderPage />} />
        <Route path="conversations" element={<Conversation />} />
        <Route path="summary/:userId" element={<BidderProfilePage />} />
        <Route path="watchlists/:userId" element={<Watchlist />} />
        <Route path="ratings/:userId" element={<Ratings />} />
        <Route path="products/:userId/bidding" element={<BidsOffers />} />
        <Route path="transactions" element={<TransactionWizard />} />
        <Route path="seller/transactions" element={<SellerTransactions />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="/sl" element={<MainLayout />}>
        <Route path="listing" element={<ListingPage />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="categories" element={<CategoryManagementPage />} />
        <Route path="products" element={<ProductManagementPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="seller-upgrades" element={<SellerUpgradesPage />} />
        <Route path="settings" element={<SystemSettingsPage />} />
      </Route>
    </>
    <Route path="/" element={<MainLayout />}>
      <Route index element={<HomePage />} />
      {/* <Route path="products" element={<ProductListingPage />} />
      <Route path="products/:productId" element={<ProductDetailPage />} />
      <Route path="categories/:categoryId" element={<ProductListingPage />} /> */}
      <Route path="*" element={<NotFoundPage />} />
      <Route path="products/:productId" element={<ProductDetails />} />
      <Route path="bids/:bidId" element={<BiddingPage />} />
      <Route path="orders/:productId" element={<OrderPage />} />
      <Route path="conversations" element={<Conversation />} />
      <Route path="summary/:userId" element={<BidderProfilePage />} />
      <Route path="watchlists/:userId" element={<Watchlist />} />
      <Route path="ratings/:userId" element={<Ratings />} />
      <Route path="products/:userId/bidding" element={<BidsOffers />} />
      <Route path="transactions/:transactionId" element={<TransactionPage />} />
      <Route
        path="transactions-old/:transactionId"
        element={<TransactionWizard />}
      />
      <Route path="seller/transactions" element={<SellerTransactions />} />
      <Route path="selling-request" element={<SellingRequestPage />} />
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
