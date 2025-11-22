import React, { useState, useEffect } from "react";
import ParentCategoryCard from "./ParentCategoryCard";
import ChildCategoryCard from "./ChildCategoryCard";
import { categoryService } from "../services/categoryService";
import categoriesMock from "../data/categories.json";

const CategorySection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedParentId, setSelectedParentId] = useState(null);

  // Toggle to force using mock data (e.g. when backend not ready)
  const useMock = false;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        if (useMock) {
          setCategories(categoriesMock);
        } else {
          const response = await categoryService.getCategories();
          if (response && Array.isArray(response)) {
            setCategories(response);
          } else {
            setCategories(categoriesMock);
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories(categoriesMock);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Separate parent and child categories
  const parentCategories = categories.filter((cat) => !cat.parent_id);
  const getChildCategories = (parentId) => {
    return categories.filter((cat) => cat.parent_id === parentId);
  };

  const handleParentClick = (categoryId) => {
    setSelectedParentId(selectedParentId === categoryId ? null : categoryId);
  };

  const displayParentCategories = parentCategories.slice(0, 5);

  return (
    <>
      <div className="pt-10">
        <h2 className="text-2xl text-center font-bold mb-6">Categories</h2>

        {/*Parent categories */}
        <div className="w-full flex justify-center px-4 py-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {displayParentCategories.map((category) => (
              <div key={category.id} className="relative">
                <ParentCategoryCard
                  categoryId={category.id}
                  title={category.name}
                  image={category.image || "/images/sample.jpg"}
                  onClick={() => handleParentClick(category.id)}
                  expanded={selectedParentId === category.id}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Child categories - Show when parent is selected */}
        {selectedParentId && (
          <div className="w-full flex justify-center px-4 py-2 animate-fadeIn">
            <div className="max-w-4xl w-full">
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
                {getChildCategories(selectedParentId).length > 0 ? (
                  getChildCategories(selectedParentId).map((child) => (
                    <ChildCategoryCard
                      key={child.id}
                      categoryId={child.id}
                      parentId={selectedParentId}
                      name={child.name}
                      image={child.image}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 italic">
                    No subcategories available
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CategorySection;
