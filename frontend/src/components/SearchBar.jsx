import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SearchBar = ({
  value,
  onChange,
  onSearch,
  placeholder,
  onKeyDown,
  onClear,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleClear = () => {
    // Clear the input in controlled parent
    if (onChange) {
      onChange({ target: { value: "" } });
    }

    // Allow parent to override URL handling
    if (onClear) {
      onClear();
      return;
    }

    // Default: remove 'search' from current URL, reset 'page' to 1, keep other params
    const params = new URLSearchParams(location.search);
    params.delete("search");
    // Optional: reset page to 1 if pagination exists
    if (params.has("page")) {
      params.set("page", "1");
    }

    const query = params.toString();
    if (query) {
      navigate(`${location.pathname}?${query}`);
    } else {
      navigate(location.pathname);
    }
  };

  return (
    <div className="flex gap-3 items-center">
      <div className="relative flex-1">
        <input
          type="text"
          placeholder={placeholder || "Search..."}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          className="w-full pl-4 pr-9 py-2.5 border border-gray-300 hover:border-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 bg-gray-50 transition-all"
        />
        {value && value.length > 0 && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={handleClear}
            className="absolute w-8 h-8 right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full"
            title="Clear"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
