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
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductListingPage from "./pages/ProductListingPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import CategoryManagementPage from "./pages/CategoryManagementPage";
import ProductManagementPage from "./pages/ProductManagementPage";
import UserManagementPage from "./pages/UserManagementPage";
import SellerUpgradesPage from "./pages/SellerUpgradesPage";
import SystemSettingsPage from "./pages/SystemSettingsPage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductListingPage />} />
        <Route path="products/:productId" element={<ProductDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
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
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
