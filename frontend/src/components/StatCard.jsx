const StatCard = ({ title, value, subtitle }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
    {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
  </div>
);

export default StatCard;
