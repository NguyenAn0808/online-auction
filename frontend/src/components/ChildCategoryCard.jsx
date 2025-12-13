import React from "react";
import { useNavigate } from "react-router-dom";

// Child category card: rectangular with thumbnail + title
const ChildCategoryCard = ({ name, categoryId, parentId, image }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (categoryId) {
      navigate(`/products?category_id=${categoryId}`);
    }
  };

  const thumb = image || "/images/sample.jpg";

  return (
    <div
      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition cursor-pointer w-40 sm:w-52 shadow-sm"
      onClick={handleClick}
    >
      <img
        src={thumb}
        alt={name}
        className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md flex-shrink-0"
        loading="lazy"
      />
      <span className="text-xs sm:text-sm font-medium text-gray-700 leading-snug line-clamp-2">
        {name}
      </span>
    </div>
  );
};

export default ChildCategoryCard;
