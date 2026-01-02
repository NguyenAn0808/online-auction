import React, { useState, useRef, useEffect } from "react";
import ShoppingCart from "./ShoppingCart";
import FlyoutMenu from "./FlyoutMenu";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Menu from "./Menu";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { COLORS, TYPOGRAPHY } from "../constants/designSystem";

const Header = () => {
  const { user, activeRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/products?search=${searchTerm}`);
  };

  const [showCart, setShowCart] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  const [showListingBlocked, setShowListingBlocked] = useState(false);

  const handleCartClick = () => {
    if (!user) {
      // Redirect guest to login
      navigate("/auth/signin", { state: { from: location } });
    } else {
      setShowCart(true);
    }
  };

  useEffect(() => {
    if (!showProfile) return;

    function handleOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    }

    function handleKey(e) {
      if (e.key === "Escape") setShowProfile(false);
    }

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [showProfile]);

  const handleListing = () => {
    if (!user) {
      navigate("/auth/signin", { state: { from: location } });
      return;
    }

    if (activeRole !== "seller" && activeRole !== "admin") {
      setShowListingBlocked(true);
      return;
    }

    navigate("/seller/listing");
  };

  return (
    <header className="navbar">
      <div className="container-max flex flex-wrap items-center justify-between gap-4">
        {/* Logo + Menu */}
        <div className="flex items-center gap-4">
          <Link to="/" className="navbar-logo">
            eBid
          </Link>

          {/* Menu Component */}
          <Menu />
        </div>

        {/* Search Bar, List Product Button, Cart, Profile */}
        <div className="flex flex-wrap items-center gap-4 justify-end">
          <form
            onSubmit={handleSearch}
            className="search-bar w-36 sm:w-64 md:w-80"
          >
            <input
              type="text"
              placeholder="Search... "
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>

          <button
            onClick={handleListing}
            className="btn-primary whitespace-nowrap"
          >
            List Product
          </button>

          <Dialog
            open={!!user && activeRole === "bidder" && showListingBlocked}
            onClose={() => setShowListingBlocked(false)}
            className="relative z-50"
          >
            <DialogBackdrop
              transition
              className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-6 text-center">
                <DialogPanel
                  transition
                  className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-center shadow-2xl transition data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in data-closed:scale-95"
                >
                  <button
                    type="button"
                    onClick={() => setShowListingBlocked(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon aria-hidden="true" className="size-6" />
                  </button>

                  <div className="text-lg font-semibold text-midnight-ash">
                    Only seller can do listing.
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <Link
                      to="/"
                      className="font-semibold text-midnight-ash hover:text-gray-600 transition-colors !underline"
                      onClick={() => setShowListingBlocked(false)}
                    >
                      Return
                    </Link>{" "}
                    or{" "}
                    <Link
                      to="/upgrade-requests"
                      className="font-semibold text-midnight-ash hover:text-gray-600 transition-colors !underline"
                      onClick={() => setShowListingBlocked(false)}
                    >
                      Upgrade to Seller
                    </Link>
                  </div>
                </DialogPanel>
              </div>
            </div>
          </Dialog>

          {/* <button
            className="p-2 rounded-full transition btn-icon"
            onClick={handleCartClick}
            aria-label="Toggle cart"
          >
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M1 2C0.447715 2 0 2.44772 0 3C0 3.55228 0.447715 4 1 4H3.20441L5.66783 14.6748C5.98195 16.036 7.19404 17.0002 8.591 17.0002H17.3956C18.8017 17.0002 20.0192 16.0236 20.3242 14.651L21.9762 7.21715C22.1128 6.60238 21.6297 6.00022 21 6.00022H5.71857L4.97955 2.79783C4.88542 2.33934 4.48145 2 4 2H1ZM7.61661 14.2251L6.18011 8.00022H19.7534L18.3718 14.2172C18.2701 14.6747 17.8643 15.0002 17.3956 15.0002H8.591C8.12535 15.0002 7.72132 14.6788 7.61661 14.2251Z"
              />
              <path d="M8 23C9.10457 23 10 22.1046 10 21C10 19.8954 9.10457 19 8 19C6.89543 19 6 19.8954 6 21C6 22.1046 6.89543 23 8 23Z" />
              <path d="M20 21C20 22.1046 19.1046 23 18 23C16.8954 23 16 22.1046 16 21C16 19.8954 16.8954 19 18 19C19.1046 19 20 19.8954 20 21Z" />
            </svg>
          </button> */}

          <ShoppingCart open={showCart} setOpen={setShowCart} />

          {user ? (
            // LOGGED IN: Show Profile Avatar & Dropdown
            <div ref={profileRef} className="relative">
              <button
                className="p-2 rounded-full transition btn-icon"
                onClick={() => setShowProfile((s) => !s)}
                aria-expanded={showProfile}
                aria-controls="profile-panel"
                aria-label="Profile menu"
              >
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M15.9999 10.0007C15.9999 12.2099 14.209 14.0007 11.9999 14.0007C9.79077 14.0007 7.99991 12.2099 7.99991 10.0007C7.99991 7.79159 9.79077 6.00073 11.9999 6.00073C14.209 6.00073 15.9999 7.79159 15.9999 10.0007ZM13.9999 10.0007C13.9999 11.1053 13.1045 12.0007 11.9999 12.0007C10.8953 12.0007 9.99991 11.1053 9.99991 10.0007C9.99991 8.89616 10.8953 8.00073 11.9999 8.00073C13.1045 8.00073 13.9999 8.89616 13.9999 10.0007Z"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M23 12.0007C23 18.0759 18.0751 23.0007 12 23.0007C5.92487 23.0007 1 18.0759 1 12.0007C1 5.9256 5.92487 1.00073 12 1.00073C18.0751 1.00073 23 5.9256 23 12.0007ZM16.596 19.7404C15.2508 20.5409 13.6791 21.0007 12 21.0007C10.3209 21.0007 8.74912 20.5409 7.40384 19.7403C8.14682 18.1775 9.85264 17.0007 11.9999 17.0007C14.1472 17.0007 15.8531 18.1775 16.596 19.7404ZM18.2161 18.5092C17.0503 16.4247 14.7042 15.0007 11.9999 15.0007C9.29567 15.0007 6.94959 16.4247 5.78377 18.5091C4.06849 16.8703 3 14.5603 3 12.0007C3 7.03017 7.02944 3.00073 12 3.00073C16.9706 3.00073 21 7.03017 21 12.0007C21 14.5604 19.9315 16.8704 18.2161 18.5092Z"
                  />
                </svg>
              </button>

              {/* Render the profile panel when toggled */}
              {showProfile && (
                <div id="profile-panel" role="dialog" aria-modal="false">
                  <FlyoutMenu alignRight />
                </div>
              )}
            </div>
          ) : (
            // GUEST: Show Register | Login Links
            <div className="flex items-center gap-3 ml-2">
              <Link
                to="/auth/signup"
                className="text-sm font-semibold text-midnight-ash hover:text-gray-600 transition-colors"
              >
                Register
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                to="/auth/signin"
                className="text-sm font-semibold text-midnight-ash hover:text-gray-600 transition-colors"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
