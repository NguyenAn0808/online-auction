import React, { useState } from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    console.log("Newsletter signup:", email);
    setEmail("");
    alert("Thank you for subscribing to our newsletter!");
  };

  return (
    <footer className="w-full bg-soft-cloud text-midnight">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Section - 4 Column Grid */}
        <div className="py-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Shop Column */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-midnight">Shop</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/products?category=electronics"
                    className="text-sm text-pebble hover:text-midnight-ash transition-colors"
                  >
                    Electronics
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products?category=fashion"
                    className="text-sm text-pebble hover:text-midnight-ash transition-colors"
                  >
                    Fashion
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products?category=collectibles"
                    className="text-sm text-pebble hover:text-midnight-ash transition-colors"
                  >
                    Collectibles
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products?category=home"
                    className="text-sm text-pebble hover:text-midnight-ash transition-colors"
                  >
                    Home & Garden
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-midnight">Company</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/about"
                    className="text-sm text-pebble hover:text-midnight-ash transition-colors"
                  >
                    Who we are
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-sm text-pebble hover:text-midnight-ash transition-colors"
                  >
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="text-sm text-pebble hover:text-midnight-ash transition-colors"
                  >
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Account Column */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-midnight">Account</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/profile"
                    className="text-sm text-pebble hover:text-midnight-ash transition-colors"
                  >
                    Manage Account
                  </Link>
                </li>
                <li>
                  <Link
                    to="/returns"
                    className="text-sm text-pebble hover:text-midnight-ash transition-colors"
                  >
                    Returns & Exchanges
                  </Link>
                </li>
                <li>
                  <Link
                    to="/help"
                    className="text-sm text-pebble hover:text-midnight-ash transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>

            {/* Newsletter Column */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-midnight">
                Sign up for our newsletter
              </h3>
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <div>
                  <label htmlFor="newsletter-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="newsletter-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-midnight placeholder:text-pebble focus:border-midnight-ash focus:outline-none focus:ring-1 focus:ring-midnight-ash"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-md bg-midnight-ash px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-midnight-ash focus:ring-offset-2"
                >
                  Sign up
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Section - Copyright */}
        <div className="border-t border-gray-300 py-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-pebble">
              &copy; 2025 Online Auction. All rights reserved.
            </p>
            {/* Optional: Social Media Icons */}
            <div className="flex gap-4">
              {/* Social icons can be added here if needed */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
