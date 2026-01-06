import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { categoryService } from "../services/categoryService";
const CategorySidebar = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Get current category_id from query params
  const searchParams = new URLSearchParams(location.search);
  const activeCategoryId = searchParams.get("category_id");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        // Backend returns { success: true, data: Category[], count: number }
        if (response && response.success && Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          console.warn("Unexpected response format:", response);
          setCategories([]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const parentCategories = categories.filter((cat) => !cat.parent_id);
  const getChildCategories = (parentId) => {
    return categories.filter((cat) => cat.parent_id === parentId);
  };

  const handleCategoryClick = (categoryId) => {
    if (categoryId) {
      // Navigate with category_id query param
      navigate(`/products?category_id=${categoryId}`);
    } else {
      // Navigate to "All" (no category filter)
      navigate("/products");
    }
  };

  const isActive = (categoryId) => {
    return activeCategoryId === String(categoryId);
  };

  const isAllActive = !activeCategoryId;

  return (
    <div className="w-64 bg-white border border-gray-200 rounded-lg p-4">
      {/* All Categories */}
      <button
        onClick={() => handleCategoryClick(null)}
        className={`w-full text-left px-3 py-2 rounded-md transition hover:bg-soft-cloud hover:text-pebble ${
          isAllActive ? "!font-semibold bg-soft-cloud text-midnight-ash" : ""
        }`}
      >
        All
      </button>

      {/* Parent Categories with Children */}
      <div className="mt-2 space-y-1">
        {parentCategories.map((parent) => {
          const children = getChildCategories(parent.id || parent._id);
          const parentId = parent.id || parent._id;
          const childIds = children.map((c) => c.id || c._id).map(String);
          const parentActive =
            isActive(parentId) || childIds.includes(String(activeCategoryId));

          return (
            <div key={parentId}>
              {/* Parent Category */}
              <button
                onClick={() => handleCategoryClick(parentId)}
                className={`w-full text-left px-3 py-2 rounded-md transition hover:bg-soft-cloud hover:text-pebble focus:outline-none ${
                  isActive(parentId)
                    ? "!font-semibold bg-soft-cloud text-midnight-ash"
                    : ""
                }`}
              >
                {parent.name}
              </button>
              {/* Child Categories */}
              {children.length > 0 && (
                <div className="ml-4 mt-1 space-y-1">
                  {children.map((child) => {
                    const childId = child.id || child._id;
                    const childActive = isActive(childId);

                    return (
                      <button
                        key={childId}
                        onClick={() => handleCategoryClick(childId)}
                        className={`w-full text-left px-3 py-2 rounded-md transition text-sm hover:bg-soft-cloud hover:text-pebble focus:outline-none ${
                          isActive(childId)
                            ? "!font-semibold bg-soft-cloud text-midnight-ash"
                            : ""
                        }`}
                      >
                        {child.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySidebar;
