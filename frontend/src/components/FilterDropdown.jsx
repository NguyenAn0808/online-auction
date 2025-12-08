const FilterDropdown = ({
  label,
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
}) => (
  <div className="relative">
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 6H20M7 12H17M10 18H14"
          stroke="#191919"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-medium text-md">
        {label}: {value}
      </span>
    </button>
    {isOpen && (
      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelect(option.value)}
            className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
              index === 0 ? "first:rounded-t-lg" : ""
            } ${index === options.length - 1 ? "last:rounded-b-lg" : ""} ${
              value === option.label ? "bg-blue-50 text-blue-600" : ""
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    )}
  </div>
);

export default FilterDropdown;
