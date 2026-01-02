import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { formatCurrency } from "../utils/formatters";
import { productAPI } from "../services/productService";
import userService from "../services/userService";
import upgradeRequestService from "../services/upgradeRequestService";
import settingsService from "../services/settingsService";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeAuctions: 0,
    endedAuctions: 0,
    totalUsers: 0,
    totalSellers: 0,
    totalBidders: 0,
    pendingUpgrades: 0,
    totalRevenue: 0,
  });

  const [recentProducts, setRecentProducts] = useState([]);
  const [settings, setSettings] = useState({
    auto_extend_threshold_minutes: 5,
    auto_extend_duration_minutes: 10,
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch products by status for counts and revenue
        const [activeRes, endedRes] = await Promise.all([
          productAPI.getProducts({ status: "active", page: 1, limit: 100 }),
          productAPI.getProducts({ status: "ended", page: 1, limit: 100 }),
        ]);

        const getItems = (res) => res.items || res.data || res.products || [];
        const activeItems = getItems(activeRes);
        const endedItems = getItems(endedRes);

        const activeAuctions = activeItems.length;
        const endedAuctions = endedItems.length;

        const revenue = endedItems.reduce(
          (sum, p) => sum + (p.current_price || p.start_price || 0),
          0
        );

        // Fetch users for totals
        const usersRes = await userService.getAllUsers({
          page: 1,
          limit: 1000,
        });
        const usersData = usersRes.data || usersRes.items || [];
        const totalUsers = usersRes.pagination?.totalItems || usersData.length;
        const sellers = usersData.filter((u) => u.role === "seller").length;
        const bidders = usersData.filter((u) => u.role === "bidder").length;

        // Pending upgrades count (safe try)
        let pendingUpgrades = 0;
        try {
          const upgradesRes = await upgradeRequestService.getAllRequests({
            status: "pending",
            page: 1,
            limit: 1,
          });
          pendingUpgrades =
            upgradesRes.pagination?.total || upgradesRes.data?.length || 0;
        } catch (e) {
          pendingUpgrades = 0;
        }

        setStats({
          totalProducts:
            (activeRes.pagination?.total || activeItems.length) +
            (endedRes.pagination?.total || endedItems.length),
          activeAuctions,
          endedAuctions,
          totalUsers,
          totalSellers: sellers,
          totalBidders: bidders,
          pendingUpgrades,
          totalRevenue: revenue,
        });

        // Recent products: fetch a page and sort by createdAt/created_at
        const allRes = await productAPI.getProducts({ page: 1, limit: 50 });
        const allItems = getItems(allRes);
        const recent = [...allItems]
          .sort(
            (a, b) =>
              new Date(b.createdAt || b.created_at) -
              new Date(a.createdAt || a.created_at)
          )
          .slice(0, 5);
        setRecentProducts(recent);
      } catch (err) {
        console.error("Error loading admin dashboard data:", err);
        setStats((prev) => ({ ...prev }));
        setRecentProducts([]);
      }
    };

    load();
  }, []);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await settingsService.getAllSettings();
      const formValues = {};
      data.forEach((setting) => {
        formValues[setting.key] = parseInt(setting.value);
      });
      setSettings(formValues);
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: parseInt(value) || 0,
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      const promises = Object.keys(settings).map((key) =>
        settingsService.updateSetting(key, settings[key])
      );
      await Promise.all(promises);
      showToast("Settings updated successfully");
      await fetchSettings();
    } catch (error) {
      console.error("Error updating settings:", error);
      showToast("Failed to update settings");
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          subtitle={`${stats.activeAuctions} active auctions`}
        />

        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          subtitle={`${stats.totalSellers} sellers, ${stats.totalBidders} bidders`}
        />

        <StatCard
          title="Active Auctions"
          value={stats.activeAuctions}
          subtitle={`${stats.endedAuctions} ended`}
        />

        <StatCard
          title="Pending Upgrades"
          value={stats.pendingUpgrades}
          subtitle="Seller upgrade requests"
        />
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">
          Recent Products
        </h3>
        <div className="space-y-4">
          {recentProducts.map((product) => {
            const thumb =
              product.thumbnail ||
              product.productImage ||
              product.images?.[0]?.image_url;
            return (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {thumb && (
                    <img
                      src={thumb}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-md border border-gray-200"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate mb-2">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={product.status} type="product" />
                      <span className="text-xs text-gray-500">
                        {product.bid_count || 0} bids
                      </span>
                      <span className="text-xs text-gray-500">
                        {`Created at: `}
                        {new Date(
                          product.createdAt || product.created_at
                        ).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <button
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="!mt-2 !px-3 !py-1 btn-secondary !text-sm !font-semibold !rounded-md hover:!bg-gray-200 transition"
                  >
                    Open Product
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Auto-Extend Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Auto-Extend Auction Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Threshold Minutes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Threshold (minutes)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Minimum minutes before auction end to trigger extension
            </p>
            <input
              type="number"
              min="1"
              max="60"
              value={settings.auto_extend_threshold_minutes || 5}
              onChange={(e) =>
                handleSettingChange(
                  "auto_extend_threshold_minutes",
                  e.target.value
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Extension Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Extension Duration (minutes)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Number of minutes to extend the auction when triggered
            </p>
            <input
              type="number"
              min="1"
              max="120"
              value={settings.auto_extend_duration_minutes || 10}
              onChange={(e) =>
                handleSettingChange(
                  "auto_extend_duration_minutes",
                  e.target.value
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Example rule summary */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md mb-4">
          <p className="text-sm text-blue-800">
            <strong>Current rule:</strong> If a bid is placed within{" "}
            <strong>
              {settings.auto_extend_threshold_minutes || 5} minutes
            </strong>{" "}
            before auction end, extend by{" "}
            <strong>
              {settings.auto_extend_duration_minutes || 10} minutes
            </strong>
            .
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={savingSettings}
          className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {savingSettings ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
