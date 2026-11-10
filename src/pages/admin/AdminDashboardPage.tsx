import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { DashboardData } from '../../types';
import { api, formatPrice } from '../../services/api';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [range, setRange] = useState<'all' | '7d' | '30d' | '90d'>('all');
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getDashboard(range);
      setData(res);
    } catch {
      // handled gracefully
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading && !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <div
            key={n}
            className="h-32 bg-white border border-[#E5D9C5] animate-pulse rounded-xs"
          />
        ))}
      </div>
    );
  }

  const summary = data?.summary || {
    total_products: 0,
    total_orders: 0,
    pending_orders: 0,
    confirmed_orders: 0,
    cancelled_orders: 0,
    total_sales: 0,
    pending_sales: 0,
    low_stock_count: 0,
    out_of_stock_count: 0,
  };

  return (
    <div className="space-y-8">
      {/* Top Toolbar & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5D9C5] p-5 rounded-xs">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8C2D56]">
            Rang e Rosh Executive Summary
          </span>
          <h2 className="font-serif-editorial text-3xl font-bold text-[#161F33]">
            Dashboard Overview & Analytics
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-[#FAF6F0] border border-[#E5D9C5] px-3 py-1.5 rounded-xs text-xs">
            <Calendar className="w-3.5 h-3.5 text-[#B8862D]" />
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as any)}
              className="bg-transparent font-semibold text-[#161F33] focus:outline-none cursor-pointer"
              aria-label="Filter analytics by date range"
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            className="p-2 bg-[#FAF6F0] border border-[#E5D9C5] hover:border-[#3A1042] rounded-xs text-[#161F33] cursor-pointer"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 7 Required Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Sales */}
        <div className="bg-gradient-to-br from-[#3A1042] to-[#161F33] text-white p-5 rounded-xs border border-[#B8862D] shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#D8B572] font-semibold">
              Total Confirmed Sales
            </span>
            <TrendingUp className="w-5 h-5 text-[#D8B572]" />
          </div>
          <p className="font-serif-editorial text-3xl font-bold mt-2">
            {formatPrice(summary.total_sales)}
          </p>
          <p className="text-[11px] text-white/70 mt-1">
            + {formatPrice(summary.pending_sales)} in Pending orders
          </p>
        </div>

        {/* 2. Total Products */}
        <Link
          to="/admin/products"
          className="bg-white p-5 rounded-xs border border-[#E5D9C5] hover:border-[#3A1042] transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#161F33]/65 font-semibold">
              Total Products
            </span>
            <Package className="w-5 h-5 text-[#3A1042]" />
          </div>
          <p className="font-serif-editorial text-3xl font-bold text-[#161F33] mt-2">
            {summary.total_products}
          </p>
          <p className="text-[11px] text-[#8C2D56] mt-1 font-medium">Manage Pret Catalog →</p>
        </Link>

        {/* 3. Total Orders */}
        <Link
          to="/admin/orders"
          className="bg-white p-5 rounded-xs border border-[#E5D9C5] hover:border-[#3A1042] transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#161F33]/65 font-semibold">
              Total Orders
            </span>
            <ShoppingBag className="w-5 h-5 text-[#3A1042]" />
          </div>
          <p className="font-serif-editorial text-3xl font-bold text-[#161F33] mt-2">
            {summary.total_orders}
          </p>
          <p className="text-[11px] text-[#161F33]/60 mt-1">All recorded customer orders</p>
        </Link>

        {/* 4. Pending Orders */}
        <Link
          to="/admin/orders?status=Pending"
          className="bg-white p-5 rounded-xs border border-[#E5D9C5] hover:border-[#B8862D] transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#B8862D] font-semibold">
              Pending Orders
            </span>
            <Clock className="w-5 h-5 text-[#B8862D]" />
          </div>
          <p className="font-serif-editorial text-3xl font-bold text-[#B8862D] mt-2">
            {summary.pending_orders}
          </p>
          <p className="text-[11px] text-[#161F33]/60 mt-1">Awaiting WhatsApp confirmation</p>
        </Link>

        {/* 5. Confirmed Orders */}
        <Link
          to="/admin/orders?status=Confirmed"
          className="bg-white p-5 rounded-xs border border-[#E5D9C5] hover:border-[#2E6F73] transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#2E6F73] font-semibold">
              Confirmed Orders
            </span>
            <CheckCircle2 className="w-5 h-5 text-[#2E6F73]" />
          </div>
          <p className="font-serif-editorial text-3xl font-bold text-[#2E6F73] mt-2">
            {summary.confirmed_orders}
          </p>
          <p className="text-[11px] text-[#161F33]/60 mt-1">
            Confirmed / Processing / Shipped / Delivered
          </p>
        </Link>

        {/* 6. Low Stock Products */}
        <Link
          to="/admin/inventory"
          className="bg-white p-5 rounded-xs border border-[#E5D9C5] hover:border-[#B8862D] transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#B8862D] font-semibold">
              Low Stock Products
            </span>
            <AlertTriangle className="w-5 h-5 text-[#B8862D]" />
          </div>
          <p className="font-serif-editorial text-3xl font-bold text-[#B8862D] mt-2">
            {summary.low_stock_count}
          </p>
          <p className="text-[11px] text-[#161F33]/60 mt-1">At or below low-stock threshold</p>
        </Link>

        {/* 7. Out of Stock Products */}
        <Link
          to="/admin/inventory"
          className="bg-white p-5 rounded-xs border border-[#E5D9C5] hover:border-red-500 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-red-700 font-semibold">
              Out of Stock Products
            </span>
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="font-serif-editorial text-3xl font-bold text-red-700 mt-2">
            {summary.out_of_stock_count}
          </p>
          <p className="text-[11px] text-[#161F33]/60 mt-1">Requires immediate restocking</p>
        </Link>
      </div>

      {/* Low Stock / Out of Stock Alert Banner if any exist */}
      {data &&
        (data.low_stock_products.length > 0 || data.out_of_stock_products.length > 0) && (
          <div className="bg-[#B8862D]/10 border border-[#B8862D] rounded-xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-[#3A1042]">
                <AlertTriangle className="w-4 h-4 text-[#B8862D]" />
                <span>Inventory Attention Required</span>
              </div>
              <Link
                to="/admin/inventory"
                className="text-xs font-semibold uppercase tracking-wider text-[#3A1042] hover:underline"
              >
                Manage Stock →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...data.out_of_stock_products, ...data.low_stock_products].map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white p-3 rounded-xs border border-[#E5D9C5] flex items-center justify-between text-xs"
                >
                  <div>
                    <strong className="text-[#161F33] block">{prod.name}</strong>
                    <span className="text-[#161F33]/60 font-mono">{prod.sku}</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 font-semibold rounded-xs ${
                      prod.inventory.available_stock <= 0
                        ? 'bg-red-100 text-red-800'
                        : 'bg-[#B8862D]/20 text-[#B8862D]'
                    }`}
                  >
                    {prod.inventory.available_stock} Left
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Main Analytics & Top Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Incoming Orders (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E5D9C5] rounded-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5D9C5] pb-3">
            <h3 className="font-serif-editorial text-2xl font-bold text-[#161F33]">
              Recent Incoming Orders
            </h3>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold uppercase tracking-wider text-[#3A1042] hover:text-[#8C2D56] flex items-center gap-1"
            >
              <span>All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {!data || data.recent_orders.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#161F33]/60">
              No customer orders recorded for this period yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E5D9C5] text-[#161F33]/60 uppercase tracking-wider">
                    <th className="py-2.5 pr-3">Order ID</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Total</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 pl-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5D9C5]/60">
                  {data.recent_orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#FAF6F0]/60">
                      <td className="py-3 pr-3 font-mono font-semibold text-[#3A1042]">
                        #{ord.order_number}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[#161F33]">{ord.customer_name}</div>
                        <div className="text-[11px] text-[#161F33]/60">{ord.customer_phone}</div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#161F33]">
                        {formatPrice(ord.total_amount)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-xs text-[10px] font-semibold uppercase tracking-wider ${
                            ord.status === 'Pending'
                              ? 'bg-[#B8862D]/20 text-[#B8862D]'
                              : ord.status === 'Cancelled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-[#2E6F73]/15 text-[#2E6F73]'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 pl-3 text-right">
                        <Link
                          to={`/admin/orders?highlight=${ord.order_number}`}
                          className="text-[#3A1042] hover:underline font-semibold"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Selling Products & Stock Overview (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E5D9C5] rounded-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5D9C5] pb-3">
            <h3 className="font-serif-editorial text-2xl font-bold text-[#161F33]">
              Products by Sales & Stock
            </h3>
            <Link
              to="/admin/inventory"
              className="text-xs font-semibold uppercase tracking-wider text-[#3A1042] hover:text-[#8C2D56]"
            >
              Inventory →
            </Link>
          </div>

          <div className="divide-y divide-[#E5D9C5]">
            {data?.top_selling_products.map((prod) => (
              <div key={prod.id} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                <img
                  src={prod.primary_image}
                  alt={prod.name}
                  className="w-11 h-14 rounded-xs object-cover object-top border border-[#E5D9C5] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif-editorial text-lg font-bold text-[#161F33] truncate">
                      {prod.name}
                    </h4>
                    <span className="text-xs font-bold text-[#3A1042]">
                      {formatPrice(prod.effective_price)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#161F33]/70 mt-0.5">
                    <span>
                      Sold: <strong className="text-[#2E6F73]">{prod.inventory.sold_quantity}</strong>{' '}
                      | Reserved: <strong>{prod.inventory.reserved_stock}</strong>
                    </span>
                    <span
                      className={`font-semibold ${
                        prod.inventory.available_stock <= 0
                          ? 'text-red-600'
                          : prod.inventory.stock_status === 'Low Stock'
                            ? 'text-[#B8862D]'
                            : 'text-[#2E6F73]'
                      }`}
                    >
                      {prod.inventory.available_stock} in stock
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Revenue & Order Analytics Breakdown */}
      {data && data.daily_analytics.length > 0 && (
        <div className="bg-white border border-[#E5D9C5] rounded-xs p-6 space-y-4">
          <h3 className="font-serif-editorial text-2xl font-bold text-[#161F33] border-b border-[#E5D9C5] pb-3">
            Daily Order & Revenue Analytics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {data.daily_analytics.map((day) => (
              <div
                key={day.date}
                className="p-4 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs space-y-1"
              >
                <span className="text-xs font-mono text-[#161F33]/60">{day.date}</span>
                <p className="font-serif-editorial text-2xl font-bold text-[#3A1042]">
                  {formatPrice(day.revenue)}
                </p>
                <p className="text-xs text-[#161F33]/75">
                  {day.order_count} {day.order_count === 1 ? 'order' : 'orders'} placed
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
