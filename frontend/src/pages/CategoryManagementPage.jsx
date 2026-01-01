import { useState, useEffect, useCallback } from "react";
import { categoryService } from "../services/categoryService";
import Pagination from "../components/Pagination";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", parent_id: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const itemsPerPage = 10;

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategories();

      if (response && response.success && Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("API call failed:", error);
      setCategories([]);
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

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Handle create category
  const handleCreate = () => {
    setFormData({ name: "", parent_id: "" });
    setError("");
    setSuccess("");
    setShowCreateModal(true);
  };

  // Handle edit category
  const handleEdit = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      parent_id: category.parent_id || "",
    });
    setError("");
    setSuccess("");
    setShowEditModal(true);
  };

  // Handle delete category
  const handleDelete = (category) => {
    setSelectedCategory(category);
    setError("");
    setSuccess("");
    setShowDeleteModal(true);
  };

  // Submit create
  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Category name is required");
      return;
    }

    setSubmitting(true);
    try {
      await categoryService.createCategory({
        name: formData.name.trim(),
        parent_id: formData.parent_id || null,
      });
      setSuccess("Category created successfully");
      setShowCreateModal(false);
      fetchCategories();
    } catch (err) {
      setError(err.message || "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit edit
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Category name is required");
      return;
    }

    setSubmitting(true);
    try {
      await categoryService.updateCategory(selectedCategory.id, {
        name: formData.name.trim(),
        parent_id: formData.parent_id || null,
      });
      setSuccess("Category updated successfully");
      setShowEditModal(false);
      fetchCategories();
    } catch (err) {
      setError(err.message || "Failed to update category");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit delete
  const handleSubmitDelete = async () => {
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await categoryService.deleteCategory(selectedCategory.id);
      setSuccess("Category deleted successfully");
      setShowDeleteModal(false);
      fetchCategories();
    } catch (err) {
      setError(err.message || "Failed to delete category");
      setShowDeleteModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Get parent categories (excluding current category when editing)
  const getAvailableParentCategories = () => {
    if (showEditModal && selectedCategory) {
      return categories.filter((cat) => cat.id !== selectedCategory.id);
    }
    return categories;
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
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">Category Management</h3>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-midnight-ash text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <PlusIcon className="h-5 w-5" />
          Add Category
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

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
                    <button
                      onClick={() => handleEdit(cat)}
                      className="px-3 py-1 border border-blue-300 text-blue-600 rounded-md text-xs font-medium hover:bg-blue-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="px-3 py-1 border border-red-300 text-red-600 rounded-md text-xs font-medium hover:bg-red-50"
                    >
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl font-bold">Create Category</h4>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-midnight-ash focus:border-transparent"
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Category (Optional)
                </label>
                <select
                  value={formData.parent_id}
                  onChange={(e) =>
                    setFormData({ ...formData, parent_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-midnight-ash focus:border-transparent"
                >
                  <option value="">None (Top Level)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-midnight-ash text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl font-bold">Edit Category</h4>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-midnight-ash focus:border-transparent"
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Category (Optional)
                </label>
                <select
                  value={formData.parent_id}
                  onChange={(e) =>
                    setFormData({ ...formData, parent_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-midnight-ash focus:border-transparent"
                >
                  <option value="">None (Top Level)</option>
                  {getAvailableParentCategories().map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-midnight-ash text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl font-bold text-red-600">
                Delete Category
              </h4>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to delete the category{" "}
              <strong>{selectedCategory?.name}</strong>? This action cannot be
              undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDelete}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagementPage;
