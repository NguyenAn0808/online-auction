import {
  Route,
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
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
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
