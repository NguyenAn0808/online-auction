import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Tabs from "../components/Tabs";
import Sidebar from "../components/Sidebar";
import BidderProfile from "../components/BidderProfile";
import { useAuth } from "../context/AuthContext";
import { useParams, useLocation } from "react-router-dom";
import userService from "../services/userService";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/designSystem";

export const BidderProfilePage = () => {
  const { user: currentUser } = useAuth();
  const { userId } = useParams();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use userId from params if available, otherwise use current user
  const targetUserId = userId || currentUser?._id;

  useEffect(() => {
    async function fetchUser() {
      if (!targetUserId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const userData = await userService.getUserById(targetUserId);
        setUser(userData);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        // Handle 404 gracefully - endpoint may not be implemented yet
        if (err.response?.status === 404) {
          setError(
            "User profile endpoint not found. Backend route may not be implemented yet."
          );
        } else {
          setError("Failed to load user profile");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [targetUserId, location.pathname]);

  return (
    <div style={{ backgroundColor: COLORS.WHISPER, minHeight: "100vh" }}>
      <Header />

      <div
        style={{ maxWidth: "1400px", margin: "0 auto", padding: SPACING.M }}
        className="mx-auto px-4 sm:px-6 lg:px-8 mt-6"
      >
        <div className="lg:flex lg:space-x-6">
          {/* Sidebar */}
          <div className="hidden lg:block" style={{ width: "256px" }}>
            <Sidebar />
          </div>

          {/* Main area */}
          <div className="flex-1 min-w-0">
            <div style={{ marginBottom: SPACING.L }}>
              <Tabs />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: SPACING.XL,
              }}
            >
              <section>
                <div
                  style={{
                    backgroundColor: COLORS.WHITE,
                    borderRadius: BORDER_RADIUS.MEDIUM,
                    boxShadow: SHADOWS.SUBTLE,
                    padding: SPACING.L,
                  }}
                >
                  {loading ? (
                    <div
                      style={{
                        padding: SPACING.L,
                        textAlign: "center",
                        color: COLORS.PEBBLE,
                      }}
                    >
                      Loading profile...
                    </div>
                  ) : error ? (
                    <div
                      style={{
                        padding: SPACING.L,
                        textAlign: "center",
                        color: "#dc2626",
                      }}
                    >
                      {error}
                    </div>
                  ) : user ? (
                    <BidderProfile user={user} />
                  ) : (
                    <div
                      style={{
                        padding: SPACING.L,
                        textAlign: "center",
                        color: COLORS.PEBBLE,
                      }}
                    >
                      User not found
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
