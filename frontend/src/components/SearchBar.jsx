const SearchBar = ({ value, onChange, onSearch, placeholder, onKeyDown }) => (
  <div className="flex gap-3">
    <input
      type="text"
      placeholder={placeholder || "Search..."}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      className="flex-1 pl-4 pr-4 py-2.5 border border-gray-300 hover:border-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 bg-gray-50 transition-all"
    />
    <button
      onClick={onSearch}
      className="px-6 py-2.5 !bg-blue-600 text-white rounded-full font-medium text-sm"
    >
      Search
    </button>
  </div>
);

export default SearchBar;
