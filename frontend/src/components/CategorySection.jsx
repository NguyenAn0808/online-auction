import React, { useState, useEffect } from "react";
import ParentCategoryCard from "./ParentCategoryCard";
import ChildCategoryCard from "./ChildCategoryCard";
import { categoryService } from "../services/categoryService";

// Mapping category names to Unsplash images
const getCategoryImage = (categoryName) => {
  const name = categoryName?.toLowerCase() || "";

  // Map category names to Unsplash URLs (matching database schema)
  const categoryImageMap = {
    bags: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    "bags & accessories":
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    apparel:
      "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=600&q=80",
    "apparel & clothing":
      "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=600&q=80",
    clothing:
      "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=600&q=80",
    footwear:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    "footwear & shoes":
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=812&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    shoes:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    electronics:
      "https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=600&q=80",
    "electronics & audio":
      "https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=600&q=80",
    audio:
      "https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=600&q=80",
    home: "https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?auto=format&fit=crop&w=600&q=80",
    "home & workspace":
      "https://images.unsplash.com/photo-1737305467768-cfcbf106a535?q=80&w=464&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  };

  // Try exact match first
  if (categoryImageMap[name]) {
    return categoryImageMap[name];
  }

  // Try partial match (e.g., "Bags & Accessories" contains "bags")
  for (const [key, url] of Object.entries(categoryImageMap)) {
    if (name.includes(key) || key.includes(name)) {
      return url;
    }
  }

  // Default fallback
  return "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80";
};

const CategorySection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedParentId, setSelectedParentId] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryService.getCategories();
        if (response && response.success && Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          console.warn("Unexpected response format:", response);
          setCategories([]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
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
      <div style={{ paddingTop: "var(--space-lg)" }}>
        <h2
          className="category-title text-center py-4"
          style={{ marginBottom: "var(--space-lg)" }}
        >
          Categories
        </h2>

        {/*Parent categories */}
        <div
          className="w-full flex justify-center py-4"
          style={{ padding: "var(--space-sm) var(--space-md)" }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 py-4">
            {displayParentCategories.map((category) => (
              <div key={category.id} className="relative">
                <ParentCategoryCard
                  categoryId={category.id}
                  title={category.name}
                  image={category.image || getCategoryImage(category.name)}
                  onClick={() => handleParentClick(category.id)}
                  expanded={selectedParentId === category.id}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Child categories - Show when parent is selected */}
        {selectedParentId && (
          <div
            className="w-full flex justify-center"
            style={{
              padding: "var(--space-sm) var(--space-md)",
              animation: "fadeIn 0.3s ease-in",
            }}
          >
            <div className="max-w-4xl w-full py-4">
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
                  <p className="text-pebble" style={{ fontStyle: "italic" }}>
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
