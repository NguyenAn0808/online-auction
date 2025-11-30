import {
  Route,
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
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
import SellerTransactions from "./pages/SellerTransactions";
// import ProductDetailPage from "./pages/ProductDetailPage";
// import ProductListingPage from "./pages/ProductListingPage";

const router = createBrowserRouter(
  createRoutesFromElements(
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
      <Route path="transactions" element={<TransactionWizard />} />
      <Route path="seller/transactions" element={<SellerTransactions />} />
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
