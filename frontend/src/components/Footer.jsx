import React from "react";

const Footer = () => {
  return (
    <footer
      className="bg-soft-cloud text-midnight"
      style={{
        padding: "var(--space-md)",
        marginTop: "var(--space-lg)",
        width: "100%",
      }}
    >
      <div className="container-max text-center">
        <p className="text-footnote">
          &copy; 2025 Online Auction. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
