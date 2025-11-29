const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4 mx-auto"></div>
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  </div>
);

export default LoadingSpinner;
