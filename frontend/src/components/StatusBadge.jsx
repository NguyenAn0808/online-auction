const StatusBadge = ({ status, type = "default" }) => {
  const getBadgeStyle = () => {
    if (type === "role") {
      const roleStyles = {
        admin: "badge badge-danger",
        seller: "badge badge-info",
        bidder: "badge badge-success",
      };
      return roleStyles[status] || "badge";
    }

    if (type === "verification") {
      return status ? "badge badge-success" : "badge badge-warning";
    }

    if (type === "upgrade") {
      const upgradeStyles = {
        pending: "badge badge-pending",
        approved: "badge badge-success",
        rejected: "badge badge-danger",
      };
      return upgradeStyles[status] || "badge";
    }

    if (type === "product") {
      const productStyles = {
        active: "badge badge-success",
        ACTIVE: "badge badge-success",
        ended: "badge",
        ENDED: "badge",
      };
      return productStyles[status] || "badge badge-warning";
    }

    return "badge";
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

  return <span className={getBadgeStyle()}>{getText()}</span>;
};

export default StatusBadge;
