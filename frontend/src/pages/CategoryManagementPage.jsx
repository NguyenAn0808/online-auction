import { useState, useEffect, useCallback } from "react";
import { categoryService } from "../services/categoryService";
import categoriesMock from "../data/categories.json";
import Pagination from "../components/Pagination";

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      // Call API
      const data = await categoryService.getCategories();

      // Handle response structure
      if (data.data) {
        setCategories(data.data);
      } else if (Array.isArray(data)) {
        setCategories(data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.warn("API call failed, using mock data:", error);
      // Fallback to mock data on error
      setCategories(categoriesMock);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Helper to get parent name
  const getParentName = (parentId) => {
    if (!parentId) return "-";
    const parent = categories.find((c) => (c.id || c._id) === parentId);
    return parent ? parent.name : "Unknown";
  };

  // Pagination logic
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCategories = categories.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = useCallback((page) => setCurrentPage(page), []);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-2xl font-bold mb-6">Category Management</h3>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-whisper">
            <tr>
              <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">
                #
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">
                Name
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">
                Parent Category
              </th>
              <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">
                Created At
              </th>
              <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentCategories.map((cat, idx) => (
              <tr key={cat.id || cat._id} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-500">
                  {startIndex + idx + 1}
                </td>
                <td className="px-3 py-2 font-medium text-gray-900">
                  {cat.name}
                </td>
                <td className="px-3 py-2 text-gray-700">
                  {getParentName(cat.parent_id)}
                </td>
                <td className="px-3 py-2 text-gray-700">
                  {formatDate(cat.createdAt)}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2 justify-center">
                    <button className="px-3 py-1 border border-blue-300 text-blue-600 rounded-md text-xs font-medium hover:bg-blue-50">
                      Edit
                    </button>
                    <button className="px-3 py-1 border border-red-300 text-red-600 rounded-md text-xs font-medium hover:bg-red-50">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-8 text-center text-gray-500 text-sm"
                >
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default CategoryManagementPage;
