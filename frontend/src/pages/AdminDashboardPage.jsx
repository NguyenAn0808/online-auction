import { useState, useEffect } from "react";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { formatCurrency } from "../utils/formatters";
import productsData from "../data/productsWithBids.json";
import usersData from "../data/users.json";
import upgradeRequestsData from "../data/upgradeRequests.json";

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
    // Calculate statistics
    const activeAuctions = productsData.filter(
      (p) => p.status === "active" || p.status === "ACTIVE"
    ).length;
    const endedAuctions = productsData.filter(
      (p) => p.status === "ended" || p.status === "ENDED"
    ).length;

    const sellers = usersData.filter((u) => u.role === "seller").length;
    const bidders = usersData.filter((u) => u.role === "bidder").length;

    const pendingUpgrades = upgradeRequestsData.filter(
      (r) => r.status === "pending"
    ).length;

    // Calculate revenue (sum of current prices for ended auctions)
    const revenue = productsData
      .filter((p) => p.status === "ended" || p.status === "ENDED")
      .reduce((sum, p) => sum + (p.current_price || p.start_price), 0);

    setStats({
      totalProducts: productsData.length,
      activeAuctions,
      endedAuctions,
      totalUsers: usersData.length,
      totalSellers: sellers,
      totalBidders: bidders,
      pendingUpgrades,
      totalRevenue: revenue,
    });

    // Recent products
    const recent = [...productsData]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    setRecentProducts(recent);
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
                    {new Date(product.createdAt).toLocaleDateString("vi-VN")}
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
