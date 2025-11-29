import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Menu from "./Menu";

const Header = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/products?search=${searchTerm}`);
  };

  return (
    <header className="text-black p-4 w-full border-b border-black-300">
      <div className="container max-w-7xl mx-auto grid grid-cols-2 items-center">
        {/* Logo */}
        <div className="flex justify-start">
          <Link to="/" className="text-2xl font-bold px-4">
            eBid
          </Link>

          {/* Menu Component */}
          <Menu />
        </div>
        {/* Search Bar, Cart, Profile */}
        <div className="flex justify-end items-center gap-4">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search..."
              className="border px-4 p-2 w-60 rounded-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className="p-2 rounded-full border border-gray-400"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1 2C0.447715 2 0 2.44772 0 3C0 3.55228 0.447715 4 1 4H3.20441L5.66783 14.6748C5.98195 16.036 7.19404 17.0002 8.591 17.0002H17.3956C18.8017 17.0002 20.0192 16.0236 20.3242 14.651L21.9762 7.21715C22.1128 6.60238 21.6297 6.00022 21 6.00022H5.71857L4.97955 2.79783C4.88542 2.33934 4.48145 2 4 2H1ZM7.61661 14.2251L6.18011 8.00022H19.7534L18.3718 14.2172C18.2701 14.6747 17.8643 15.0002 17.3956 15.0002H8.591C8.12535 15.0002 7.72132 14.6788 7.61661 14.2251Z"
                  fill="#191919"
                />
                <path
                  d="M8 23C9.10457 23 10 22.1046 10 21C10 19.8954 9.10457 19 8 19C6.89543 19 6 19.8954 6 21C6 22.1046 6.89543 23 8 23Z"
                  fill="#191919"
                />
                <path
                  d="M20 21C20 22.1046 19.1046 23 18 23C16.8954 23 16 22.1046 16 21C16 19.8954 16.8954 19 18 19C19.1046 19 20 19.8954 20 21Z"
                  fill="#191919"
                />
              </svg>
            </button>
          </form>
          <button className="p-2 rounded-full border border-gray-400">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.9999 10.0007C15.9999 12.2099 14.209 14.0007 11.9999 14.0007C9.79077 14.0007 7.99991 12.2099 7.99991 10.0007C7.99991 7.79159 9.79077 6.00073 11.9999 6.00073C14.209 6.00073 15.9999 7.79159 15.9999 10.0007ZM13.9999 10.0007C13.9999 11.1053 13.1045 12.0007 11.9999 12.0007C10.8953 12.0007 9.99991 11.1053 9.99991 10.0007C9.99991 8.89616 10.8953 8.00073 11.9999 8.00073C13.1045 8.00073 13.9999 8.89616 13.9999 10.0007Z"
                fill="#191919"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M23 12.0007C23 18.0759 18.0751 23.0007 12 23.0007C5.92487 23.0007 1 18.0759 1 12.0007C1 5.9256 5.92487 1.00073 12 1.00073C18.0751 1.00073 23 5.9256 23 12.0007ZM16.596 19.7404C15.2508 20.5409 13.6791 21.0007 12 21.0007C10.3209 21.0007 8.74912 20.5409 7.40384 19.7403C8.14682 18.1775 9.85264 17.0007 11.9999 17.0007C14.1472 17.0007 15.8531 18.1775 16.596 19.7404ZM18.2161 18.5092C17.0503 16.4247 14.7042 15.0007 11.9999 15.0007C9.29567 15.0007 6.94959 16.4247 5.78377 18.5091C4.06849 16.8703 3 14.5603 3 12.0007C3 7.03017 7.02944 3.00073 12 3.00073C16.9706 3.00073 21 7.03017 21 12.0007C21 14.5604 19.9315 16.8704 18.2161 18.5092Z"
                fill="#191919"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
