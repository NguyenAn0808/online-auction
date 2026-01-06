import { FunnelIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
const FilterDropdown = ({
  label,
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
  Icon = FunnelIcon,
  ActiveIcon = null,
}) => {
  const IconToRender = isOpen && ActiveIcon ? ActiveIcon : Icon;
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`group flex items-center gap-2 px-2 py-2 border rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-200 ${
          isOpen
            ? "bg-whisper"
            : "bg-white border-gray-300 hover:bg-whisper hover:text-pebble"
        }`}
      >
        <IconToRender className={`w-4 h-4 ${isOpen ? "text-pebble" : ""}`} />

        <span className="font-medium text-md">
          {/* Prefer showing value for concise button like User Management */}
          {value || label}
        </span>
        <ChevronUpIcon
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-pebble" : "text-midnight-ash"
          }`}
        />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10 divide-y">
          {options.map((option, index) => {
            const isActive =
              value === option.label || value === option.value || false;
            return (
              <button
                key={index}
                onClick={() => onSelect(option.value)}
                className={`w-full text-left px-2 py-2 text-md hover:bg-whisper hover:text-pebble ${
                  index === 0 ? "first:rounded-t-lg" : ""
                } ${index === options.length - 1 ? "last:rounded-b-lg" : ""} ${
                  isActive ? "bg-whisper text-midnight-ash font-medium" : ""
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
