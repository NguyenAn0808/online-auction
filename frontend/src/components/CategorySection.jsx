import React, { useState, useEffect } from "react";
import CategoryCard from "./CategoryCard";
import { categoryService } from "../services/categoryService";

const CategorySection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const sampleCategories = [
    { _id: "sample-1", title: "Đồ điện tử", image: "/images/sample.jpg" },
    { _id: "sample-2", title: "Thời trang", image: "/images/sample.jpg" },
    { _id: "sample-3", title: "Đồ gia dụng", image: "/images/sample.jpg" },
    { _id: "sample-4", title: "Sách", image: "/images/sample.jpg" },
    { _id: "sample-5", title: "Thể thao", image: "/images/sample.jpg" },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryService.getCategories();
        // API returns array of categories directly
        if (response && Array.isArray(response)) {
          setCategories(response);
        } else {
          setCategories(sampleCategories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Use sample categories on error
        setCategories(sampleCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const displayCategories =
    categories.length > 0 ? categories.slice(0, 5) : sampleCategories;

  return (
    <>
      <div className="pt-10">
        <h2 className="text-2xl text-center font-bold mb-6">
          Featured Categories
        </h2>

        <div className="w-full flex justify-center p-4">
          <div className="grid grid-cols-5 gap-4">
            {displayCategories.map((category, index) => (
              <CategoryCard
                key={category._id || index}
                categoryId={category._id}
                title={category.name || category.title}
                image={category.image || "/images/sample.jpg"}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default CategorySection;
