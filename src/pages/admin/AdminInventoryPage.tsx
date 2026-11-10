import React, { useState, useEffect, useCallback } from 'react';
import {
  Boxes,
  Plus,
  Minus,
  AlertTriangle,
  History,
  TrendingUp,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Product, InventoryTransaction, STANDARD_SIZES } from '../../types';
import { api } from '../../services/api';
import { useStore } from '../../context/StoreContext';

export const AdminInventoryPage: React.FC = () => {
  const { refreshStorefront } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterView, setFilterView] = useState<'all' | 'low_stock' | 'out_of_stock' | 'top_sales'>(
    'all'
  );
  const [quickAdjustingKey, setQuickAdjustingKey] = useState<string | null>(null);

  // Stock adjustment modal state
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustTargetSize, setAdjustTargetSize] = useState<string>('ALL');
  const [adjustMode, setAdjustMode] = useState<'increase' | 'decrease' | 'set'>('increase');
  const [adjustQty, setAdjustQty] = useState<string>('5');
  const [adjustThreshold, setAdjustThreshold] = useState<string>('5');
  const [adjustNote, setAdjustNote] = useState<string>('');
  const [savingAdjust, setSavingAdjust] = useState(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getInventory();
      setProducts(res.products);
      setTransactions(res.transactions);
    } catch {
      // handled gracefully
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const getProductSizeStock = (prod: Product, size: string): number => {
    const map = prod.inventory.size_stock;
    if (map && size in map) {
      return Number(map[size] ?? 0);
    }
    return Math.max(0, Math.floor(prod.inventory.available_stock / 4));
  };

  const handleQuickSizeDelta = async (
    prod: Product,
    size: string,
    mode: 'increase' | 'decrease'
  ) => {
    const currentForSize = getProductSizeStock(prod, size);
    if (mode === 'decrease' && currentForSize <= 0) return;

    const actionKey = `${prod.id}::${size}`;
    setQuickAdjustingKey(actionKey);
    try {
      const res = await api.adjustInventory(prod.id, {
        mode,
        quantity: 1,
        size,
        note: `Quick ${mode} (1 unit) for size ${size}`,
      });
      setProducts((prev) => prev.map((p) => (p.id === prod.id ? res.product : p)));
      await loadInventory();
      await refreshStorefront();
    } catch {
      // handled gracefully
    } finally {
      setQuickAdjustingKey(null);
    }
  };

  const openAdjustModal = (
    prod: Product,
    defaultMode: 'increase' | 'decrease' | 'set',
    defaultSize = 'ALL'
  ) => {
    setAdjustingProduct(prod);
    setAdjustTargetSize(defaultSize);
    setAdjustMode(defaultMode);
    if (defaultMode === 'set') {
      const currentVal =
        defaultSize === 'ALL'
          ? prod.inventory.available_stock
          : getProductSizeStock(prod, defaultSize);
      setAdjustQty(String(currentVal));
    } else {
      setAdjustQty('1');
    }
    setAdjustThreshold(String(prod.inventory.low_stock_threshold));
    setAdjustNote('');
    setAdjustError(null);
  };

  const handleApplyAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    setSavingAdjust(true);
    setAdjustError(null);
    try {
      await api.adjustInventory(adjustingProduct.id, {
        mode: adjustMode,
        quantity: Number(adjustQty),
        size: adjustTargetSize === 'ALL' ? undefined : adjustTargetSize,
        low_stock_threshold: Number(adjustThreshold),
        note:
          adjustNote.trim() ||
          `Manual ${adjustMode} adjustment (${adjustTargetSize === 'ALL' ? 'All Sizes' : adjustTargetSize})`,
      });
      setAdjustingProduct(null);
      await loadInventory();
      await refreshStorefront();
    } catch (err: any) {
      setAdjustError(err.message || 'Failed to update stock');
    } finally {
      setSavingAdjust(false);
    }
  };

  const displayedProducts = React.useMemo(() => {
    let list = [...products];
    if (filterView === 'low_stock') {
      list = list.filter((p) => p.inventory.stock_status === 'Low Stock');
    } else if (filterView === 'out_of_stock') {
      list = list.filter((p) => p.inventory.stock_status === 'Out of Stock');
    } else if (filterView === 'top_sales') {
      list.sort((a, b) => b.inventory.sold_quantity - a.inventory.sold_quantity);
    }
    return list;
  }, [products, filterView]);

  const lowStockCount = products.filter((p) => p.inventory.stock_status === 'Low Stock').length;
  const outOfStockCount = products.filter(
    (p) => p.inventory.stock_status === 'Out of Stock'
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5D9C5] p-5 rounded-xs">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8C2D56]">
            Real-Time Stock & Ledger
          </span>
          <h2 className="font-serif-editorial text-3xl font-bold text-[#161F33]">
            Stock & Inventory Management
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterView('all')}
            className={`px-3 py-1.5 rounded-xs text-xs font-semibold cursor-pointer ${
              filterView === 'all'
                ? 'bg-[#3A1042] text-white'
                : 'bg-[#FAF6F0] border border-[#E5D9C5] text-[#161F33]'
            }`}
          >
            All Products ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterView('low_stock')}
            className={`px-3 py-1.5 rounded-xs text-xs font-semibold flex items-center gap-1 cursor-pointer ${
              filterView === 'low_stock'
                ? 'bg-[#B8862D] text-white'
                : 'bg-[#FAF6F0] border border-[#E5D9C5] text-[#B8862D]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock ({lowStockCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterView('out_of_stock')}
            className={`px-3 py-1.5 rounded-xs text-xs font-semibold cursor-pointer ${
              filterView === 'out_of_stock'
                ? 'bg-red-600 text-white'
                : 'bg-[#FAF6F0] border border-[#E5D9C5] text-red-700'
            }`}
          >
            Out of Stock ({outOfStockCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterView('top_sales')}
            className={`px-3 py-1.5 rounded-xs text-xs font-semibold flex items-center gap-1 cursor-pointer ${
              filterView === 'top_sales'
                ? 'bg-[#2E6F73] text-white'
                : 'bg-[#FAF6F0] border border-[#E5D9C5] text-[#2E6F73]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Highest Sales</span>
          </button>
          <button
            type="button"
            onClick={loadInventory}
            className="p-2 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-[#E5D9C5] rounded-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#161F33]/60">Loading inventory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F3ECE0] border-b border-[#E5D9C5] text-[#161F33]/75 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">
                    Sizes Quantity (Small, Medium, Large, Extra Large)
                  </th>
                  <th className="py-3.5 px-4">Total Stock</th>
                  <th className="py-3.5 px-4">Reserved / Sold</th>
                  <th className="py-3.5 px-4">Stock Status</th>
                  <th className="py-3.5 px-4 text-right">Stock Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5D9C5]">
                {displayedProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#FAF6F0]/70">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.primary_image}
                          alt={prod.name}
                          className="w-10 h-13 rounded-xs object-cover object-top border border-[#E5D9C5]"
                        />
                        <span className="font-serif-editorial text-xl font-bold text-[#161F33]">
                          {prod.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#3A1042]">
                      {prod.sku}
                    </td>
                    <td className="py-3.5 px-4 min-w-[330px]">
                      <div className="grid grid-cols-2 gap-1.5">
                        {STANDARD_SIZES.map((size) => {
                          const qty = getProductSizeStock(prod, size);
                          const isBusy = quickAdjustingKey === `${prod.id}::${size}`;
                          return (
                            <div
                              key={size}
                              className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FAF6F0] border border-[#E5D9C5]"
                            >
                              <span className="text-[11px] font-bold text-[#161F33] truncate">
                                {size}
                              </span>
                              <div className="inline-flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  disabled={isBusy || qty <= 0}
                                  onClick={() => handleQuickSizeDelta(prod, size, 'decrease')}
                                  className="w-6 h-6 rounded bg-[#8C2D56] hover:bg-[#6e2142] disabled:opacity-35 text-white flex items-center justify-center cursor-pointer transition-colors"
                                  title={`Decrease ${size} quantity`}
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span
                                  className={`min-w-[24px] text-center font-mono text-xs font-extrabold ${
                                    qty <= 0 ? 'text-red-600' : 'text-[#3A1042]'
                                  }`}
                                >
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleQuickSizeDelta(prod, size, 'increase')}
                                  className="w-6 h-6 rounded bg-[#2E6F73] hover:bg-[#23585B] disabled:opacity-35 text-white flex items-center justify-center cursor-pointer transition-colors"
                                  title={`Increase ${size} quantity`}
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-base font-bold text-[#161F33]">
                        {prod.inventory.available_stock}
                      </span>
                      <div className="text-[10px] text-[#161F33]/60">
                        Alert ≤ {prod.inventory.low_stock_threshold}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#B8862D]">
                        Reserved: {prod.inventory.reserved_stock}
                      </div>
                      <div className="font-semibold text-[#2E6F73]">
                        Sold: {prod.inventory.sold_quantity}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-xs text-[10px] font-semibold uppercase tracking-wider ${
                          prod.inventory.stock_status === 'Out of Stock'
                            ? 'bg-red-100 text-red-700'
                            : prod.inventory.stock_status === 'Low Stock'
                              ? 'bg-[#B8862D]/20 text-[#B8862D]'
                              : 'bg-[#2E6F73]/15 text-[#2E6F73]'
                        }`}
                      >
                        {prod.inventory.stock_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                      <button
                        type="button"
                        onClick={() => openAdjustModal(prod, 'increase', 'Small')}
                        className="px-2.5 py-1.5 bg-[#2E6F73] hover:bg-[#23585B] text-white rounded-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                        title="Increase Stock"
                      >
                        <Plus className="w-3 h-3" /> Stock
                      </button>
                      <button
                        type="button"
                        onClick={() => openAdjustModal(prod, 'decrease', 'Small')}
                        className="px-2.5 py-1.5 bg-[#8C2D56] hover:bg-[#6e2142] text-white rounded-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                        title="Decrease Stock"
                      >
                        <Minus className="w-3 h-3" /> Stock
                      </button>
                      <button
                        type="button"
                        onClick={() => openAdjustModal(prod, 'set', 'Small')}
                        className="px-2.5 py-1.5 bg-[#3A1042] hover:bg-[#280A2E] text-white rounded-xs font-semibold cursor-pointer"
                      >
                        Set Exact
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inventory Transaction History Table */}
      <div className="bg-white border border-[#E5D9C5] rounded-xs p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E5D9C5] pb-3">
          <History className="w-5 h-5 text-[#B8862D]" />
          <h3 className="font-serif-editorial text-2xl font-bold text-[#161F33]">
            Inventory Transaction History
          </h3>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF6F0] border-b border-[#E5D9C5] text-[#161F33]/70 uppercase tracking-wider">
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">Event Type</th>
                <th className="py-2.5 px-3">Delta</th>
                <th className="py-2.5 px-3">Available (Prev → New)</th>
                <th className="py-2.5 px-3">Reserved (Prev → New)</th>
                <th className="py-2.5 px-3">Note</th>
                <th className="py-2.5 px-3">By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5D9C5]/60">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#FAF6F0]/50">
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#161F33]/65 whitespace-nowrap">
                    {tx.created_at}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-[#161F33]">
                    {tx.product_name}{' '}
                    <span className="text-[10px] font-mono text-[#161F33]/50">
                      ({tx.product_sku})
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-xs bg-[#F3ECE0] text-[#3A1042] font-mono text-[10px] uppercase">
                      {tx.change_type}
                    </span>
                  </td>
                  <td
                    className={`py-2.5 px-3 font-bold ${
                      tx.quantity_delta > 0
                        ? 'text-[#2E6F73]'
                        : tx.quantity_delta < 0
                          ? 'text-red-600'
                          : 'text-[#B8862D]'
                    }`}
                  >
                    {tx.quantity_delta > 0 ? `+${tx.quantity_delta}` : tx.quantity_delta}
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    {tx.previous_available} → <strong>{tx.new_available}</strong>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[#B8862D]">
                    {tx.previous_reserved} → <strong>{tx.new_reserved}</strong>
                  </td>
                  <td className="py-2.5 px-3 text-[#161F33]/80">{tx.note}</td>
                  <td className="py-2.5 px-3 text-[#161F33]/65">{tx.performed_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Stock Adjustment Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setAdjustingProduct(null)}
            className="fixed inset-0 bg-[#161F33]/65 backdrop-blur-xs"
          />
          <div className="relative z-10 w-full max-w-md bg-white border-2 border-[#B8862D] rounded-xs p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5D9C5] pb-3">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-[#3A1042]" />
                <h3 className="font-serif-editorial text-2xl font-bold text-[#161F33]">
                  Update Stock: {adjustingProduct.name}
                </h3>
              </div>
            </div>

            {adjustError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs">
                {adjustError}
              </div>
            )}

            <form onSubmit={handleApplyAdjustment} className="space-y-4 text-xs">
              <div className="p-3 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs space-y-2">
                <div className="flex justify-between">
                  <span>Total Available Stock:</span>
                  <strong className="text-sm text-[#3A1042]">
                    {adjustingProduct.inventory.available_stock} units
                  </strong>
                </div>
                <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-[#E5D9C5]/70">
                  {STANDARD_SIZES.map((s) => (
                    <div
                      key={s}
                      className="text-center p-1.5 rounded bg-white border border-[#E5D9C5]"
                    >
                      <div className="text-[10px] font-bold text-[#161F33]/70">{s}</div>
                      <div className="text-xs font-extrabold text-[#3A1042]">
                        {getProductSizeStock(adjustingProduct, s)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider mb-1">
                  Select Size to Adjust
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {([...STANDARD_SIZES, 'ALL'] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => {
                        setAdjustTargetSize(sz);
                        if (adjustMode === 'set') {
                          setAdjustQty(
                            String(
                              sz === 'ALL'
                                ? adjustingProduct.inventory.available_stock
                                : getProductSizeStock(adjustingProduct, sz)
                            )
                          );
                        }
                      }}
                      className={`py-2 px-2 rounded-xs font-semibold text-[11px] border cursor-pointer ${
                        adjustTargetSize === sz
                          ? 'bg-[#B8862D] text-white border-[#B8862D]'
                          : 'bg-[#FAF6F0] text-[#161F33] border-[#E5D9C5]'
                      }`}
                    >
                      {sz === 'ALL' ? 'All Sizes' : sz}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider mb-1">
                  Adjustment Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['increase', 'decrease', 'set'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setAdjustMode(m)}
                      className={`py-2 px-3 rounded-xs font-semibold uppercase tracking-wider border cursor-pointer ${
                        adjustMode === m
                          ? 'bg-[#3A1042] text-white border-[#3A1042]'
                          : 'bg-[#FAF6F0] text-[#161F33] border-[#E5D9C5]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">
                    {adjustMode === 'set' ? 'New Stock Quantity' : 'Units to Adjust'} *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">
                    Low-Stock Threshold
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={adjustThreshold}
                    onChange={(e) => setAdjustThreshold(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider mb-1">
                  Audit Note / Reason
                </label>
                <input
                  type="text"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="e.g., New atelier batch received"
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5D9C5]">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-4 py-2 border border-[#E5D9C5] rounded-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAdjust}
                  className="px-5 py-2 bg-[#3A1042] hover:bg-[#8C2D56] text-white rounded-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{savingAdjust ? 'Updating...' : 'Save Stock Update'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
