const StatusBadge = ({ status, type = "default" }) => {
  const getBadgeStyle = () => {
    if (type === "role") {
      const roleStyles = {
        admin: "bg-red-100 text-red-700 border border-red-200",
        seller: "bg-blue-100 text-blue-700 border border-blue-200",
        bidder: "bg-green-100 text-green-700 border border-green-200",
      };
      return (
        roleStyles[status] || "bg-gray-100 text-gray-700 border border-gray-200"
      );
    }

    if (type === "verification") {
      return status
        ? "bg-green-100 text-green-700 border border-green-200"
        : "bg-yellow-100 text-yellow-700 border border-yellow-200";
    }

    if (type === "upgrade") {
      const upgradeStyles = {
        pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
        approved: "bg-green-100 text-green-700 border border-green-200",
        rejected: "bg-red-100 text-red-700 border border-red-200",
      };
      return (
        upgradeStyles[status] ||
        "bg-gray-100 text-gray-700 border border-gray-200"
      );
    }

    if (type === "product") {
      const productStyles = {
        active: "bg-green-100 text-green-700",
        ACTIVE: "bg-green-100 text-green-700",
        ended: "bg-gray-100 text-gray-700",
        ENDED: "bg-gray-100 text-gray-700",
      };
      return productStyles[status] || "bg-yellow-100 text-yellow-700";
    }

    return "bg-gray-100 text-gray-700 border border-gray-200";
  };

  const getText = () => {
    if (type === "verification") {
      return status ? "Verified" : "Unverified";
    }
    if (type === "upgrade") {
      const texts = {
        pending: "Pending",
        approved: "Approved",
        rejected: "Rejected",
      };
      return texts[status] || status;
    }
    if (type === "product") {
      return status
        ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
        : "N/A";
    }
    return status;
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${getBadgeStyle()}`}
    >
      {getText()}
    </span>
  );
};

export default StatusBadge;
