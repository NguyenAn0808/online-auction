import React from "react";
import { useNavigate } from "react-router-dom";

const ParentCategoryCard = ({
  title,
  image,
  categoryId,
  onClick,
  expanded = false,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (categoryId) {
      navigate(`/products?category_id=${categoryId}`);
    }
  };

  const handleIconClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className="flex flex-col items-center cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden hover:shadow-xl transition-shadow">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="w-full flex justify-center items-center gap-1 sm:gap-2 mt-2 sm:mt-4">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-center">
          {title}
        </h3>

        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`flex-shrink-0 cursor-pointer hover:opacity-70 transition-opacity transform transition-transform duration-500 ${
            expanded ? "rotate-180" : ""
          }`}
          onClick={handleIconClick}
        >
          <path
            d="M12.3763 17.9268C12.4967 17.878 12.6095 17.8047 12.7071 17.7071C12.7069 17.7073 12.7073 17.7069 12.7071 17.7071L20.7071 9.70711C21.0976 9.31658 21.0976 8.68342 20.7071 8.2929C20.3166 7.90237 19.6834 7.90237 19.2929 8.29289L12 15.5858L4.70711 8.29289C4.31658 7.90237 3.68342 7.90237 3.29289 8.29289C2.90237 8.68342 2.90237 9.31658 3.29289 9.70711L11.2929 17.7071C11.5858 18 12.0152 18.0732 12.3763 17.9268Z"
            fill="#191919"
          />
        </svg>
      </div>{" "}
    </div>
  );
};
export default ParentCategoryCard;
