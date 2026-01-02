import { useState, useEffect } from "react";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { formatCurrency } from "../utils/formatters";
import { productAPI } from "../services/productService";
import userService from "../services/userService";
import upgradeRequestService from "../services/upgradeRequestService";

const AdminDashboardPage = () => {
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

  return (
    <div className="space-y-6">
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
          {recentProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
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
                    {new Date(
                      product.createdAt || product.created_at
                    ).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>
              <div className="ml-4 text-right">
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(product.current_price || product.start_price)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
