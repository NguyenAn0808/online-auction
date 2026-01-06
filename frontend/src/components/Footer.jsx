import React, { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import { Link } from "react-router-dom";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [categories, setCategories] = useState([]);
  const toast = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Try multiple API endpoints in order
      const apiUrls = [
        import.meta.env.VITE_API_URL || null,
        "http://localhost:8000",
        window.location.origin,
      ].filter(Boolean);

      let data = null;
      let lastError = null;

      for (const apiUrl of apiUrls) {
        try {
          const url = `${apiUrl}/api/categories`;
          console.log("Fetching categories from:", url);

          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            data = await response.json();
            if (data.success && data.data) {
              setCategories(data.data);
              console.log("Categories loaded successfully");
              return;
            }
          }
        } catch (urlError) {
          lastError = urlError;
          console.log(`Failed to fetch from ${apiUrl}:`, urlError.message);
        }
      }

      if (lastError) {
        throw lastError;
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Set default empty state - categories section will show empty
      setCategories([]);
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Validate email
    if (!email.trim()) {
      toast.warning("Please enter your email address");
      return;
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }
    // TODO: Implement newsletter subscription
    console.log("Newsletter signup:", email);
    setEmail("");
    toast.success("Thank you for subscribing to our newsletter!");
  };

  return (
    <footer className="w-full bg-soft-cloud text-midnight">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Section - 4 Column Grid */}
        <div className="py-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Categories - Column 1 */}
            {categories.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-midnight">
                  Categories
                </h3>
                <ul className="space-y-3">
                  {categories
                    .slice(0, Math.ceil(categories.length / 3))
                    .map((category) => (
                      <li key={category.id}>
                        <Link
                          to={`/products?category_id=${category.id}`}
                          className="text-sm text-pebble hover:text-midnight-ash transition-colors"
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Categories - Column 2 */}
            {categories.length > Math.ceil(categories.length / 3) && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-midnight">
                  More Categories
                </h3>
                <ul className="space-y-3">
                  {categories
                    .slice(
                      Math.ceil(categories.length / 3),
                      Math.ceil((2 * categories.length) / 3)
                    )
                    .map((category) => (
                      <li key={category.id}>
                        <Link
                          to={`/products?category_id=${category.id}`}
                          className="text-sm text-pebble hover:text-midnight-ash transition-colors"
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Categories - Column 3 */}
            {categories.length > 2 * Math.ceil(categories.length / 3) && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-midnight">
                  All Categories
                </h3>
                <ul className="space-y-3">
                  {categories
                    .slice(Math.ceil((2 * categories.length) / 3))
                    .map((category) => (
                      <li key={category.id}>
                        <Link
                          to={`/products?category_id=${category.id}`}
                          className="text-sm text-pebble hover:text-midnight-ash transition-colors"
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Newsletter Column */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-midnight">
                Sign up for our newsletter
              </h3>
              <form
                onSubmit={handleNewsletterSubmit}
                className="space-y-3"
                noValidate
              >
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
