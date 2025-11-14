import React from "react";
import { useNavigate } from "react-router-dom";

const CategoryCard = ({ title, image, categoryId }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (categoryId) {
      navigate(`/categories/${categoryId}`);
    }
  };

  return (
    <div
      className="flex flex-col items-center cursor-pointer"
      onClick={handleClick}
    >
      <div className="w-40 h-40 rounded-full overflow-hidden hover:shadow-xl transition-shadow">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <h3 className="text-lg font-semibold text-center mt-4">{title}</h3>
    </div>
  );
};

export default CategoryCard;
