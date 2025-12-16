import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { categoryService } from "../services/categoryService";

// Menu dropdown with parent & child category tables
const Menu = () => {
  // temp change to force commit
  const [showMenu, setShowMenu] = useState(false);
  const [categories, setCategories] = useState([]);
  const [hoverParentId, setHoverParentId] = useState(null);
  const [dropdownLeft, setDropdownLeft] = useState(0); // dynamic left position so parent panel stays fixed
  const navigate = useNavigate();
  const menuButtonRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        if (response && response.success && Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          setCategories([]);
        }
      } catch (e) {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const parentCategories = categories.filter((c) => !c.parent_id);
  const getChildCategories = (pid) =>
    categories.filter((c) => c.parent_id === pid);

  const menuDropdownRef = useRef(null);

  // Close when clicking anywhere outside the Menu button and dropdown
  useEffect(() => {
    if (!showMenu) return;
    const handleOutside = (e) => {
      if (
        menuButtonRef.current &&
        !menuButtonRef.current.contains(e.target) &&
        menuDropdownRef.current &&
        !menuDropdownRef.current.contains(e.target)
      ) {
        setShowMenu(false);
        setHoverParentId(null);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setShowMenu(false);
        setHoverParentId(null);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showMenu]);

  // Recompute dropdown position when menu opens or window resizes to keep parent panel fixed under the Menu button
  useEffect(() => {
    if (!showMenu) return;
    const computeLeft = () => {
      if (!menuButtonRef.current || !navRef.current) return;
      const buttonRect = menuButtonRef.current.getBoundingClientRect();
      const navRect = navRef.current.getBoundingClientRect();
      // Parent panel width = w-64 = 256px
      const parentPanelWidth = 256;
      const centerXWithinNav =
        buttonRect.left - navRect.left + buttonRect.width / 2;
      const left = Math.max(8, centerXWithinNav - parentPanelWidth / 2); // keep at least 8px padding from left
      setDropdownLeft(left);
    };
    computeLeft();
    window.addEventListener("resize", computeLeft);
    return () => window.removeEventListener("resize", computeLeft);
  }, [showMenu]);

  return (
    <nav ref={navRef} className="flex justify-center relative">
      <ul className="flex pl-4 mt-1 gap-6">
        <li ref={menuButtonRef}>
          <button
            type="button"
            onMouseEnter={() => setShowMenu(true)}
            onClick={() => navigate("/products")}
            className="hover:text-gray-700 font-medium"
          >
            Menu
          </button>
        </li>
      </ul>
      {showMenu && parentCategories.length > 0 && (
        <div
          ref={menuDropdownRef}
          className="absolute top-full mt-4 flex gap-6 z-50"
          style={{ left: dropdownLeft }}
        >
          {/* Parent table */}
          <div className="w-64 bg-white rounded-2xl shadow-lg p-4 border border-gray-200">
            <h4 className="text-sm font-semibold mb-2 px-1">Categories</h4>
            <ul className="space-y-1">
              {parentCategories.map((parent) => (
                <li key={parent.id || parent._id}>
                  <button
                    type="button"
                    onMouseEnter={() =>
                      setHoverParentId(parent.id || parent._id)
                    }
                    onFocus={() => setHoverParentId(parent.id || parent._id)}
                    onClick={() => {
                      navigate(
                        `/products?category_id=${parent.id || parent._id}`
                      );
                      setShowMenu(false);
                      setHoverParentId(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md transition hover:bg-soft-cloud ${
                      hoverParentId === (parent.id || parent._id)
                        ? "bg-whisper text-pebble"
                        : ""
                    }`}
                  >
                    <span className="text-sm font-medium text-gray-800">
                      {parent.name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {/* Child table only when a parent is hovered */}
          {hoverParentId && (
            <div className="w-64 bg-white rounded-2xl shadow-lg p-4 border border-gray-200">
              <h4 className="text-sm font-semibold mb-2 px-1">Subcategories</h4>
              <ul className="space-y-1">
                {getChildCategories(hoverParentId).map((child) => (
                  <li key={child.id || child._id}>
                    <button
                      type="button"
                      onClick={() => {
                        navigate(
                          `/products?category_id=${child.id || child._id}`
                        );
                        setShowMenu(false);
                        setHoverParentId(null);
                      }}
                      className="w-full text-left px-3 py-2 rounded-md transition hover:bg-soft-cloud"
                    >
                      <span className="text-sm text-gray-700">
                        {child.name}
                      </span>
                    </button>
                  </li>
                ))}
                {getChildCategories(hoverParentId).length === 0 && (
                  <li className="px-3 py-2 text-xs text-gray-500 italic">
                    No subcategories
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Menu;
