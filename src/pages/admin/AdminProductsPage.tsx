import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Minus,
  Edit3,
  Trash2,
  Upload,
  X,
  Check,
  Star,
  Eye,
  EyeOff,
  AlertTriangle,
  Image as ImageIcon,
  Video,
} from 'lucide-react';
import { Product, STANDARD_SIZES } from '../../types';
import { api, formatPrice } from '../../services/api';
import { useStore } from '../../context/StoreContext';
import { UniversalVideoPlayer } from '../../components/common/UniversalVideoPlayer';

interface ProductFormState {
  id?: number;
  name: string;
  sku: string;
  collection_name: string;
  category: string;
  regular_price: string;
  discounted_price: string;
  overview: string;
  product_type_detail: string;
  color_name: string;
  fabric: string;
  fit: string;
  embroidered_details: string;
  suit_stitching: string;
  outfit_architecture: string;
  wash_care: string;
  color_disclaimer: string;
  video_url: string;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_published: boolean;
  available_stock: string;
  low_stock_threshold: string;
  size_stock: Record<string, number>;
  images: string[];
  sizes_input: string;
  colors_input: string;
}

const EMPTY_FORM: ProductFormState = {
  name: '',
  sku: '',
  collection_name: 'Rang e Rosh Pret Collection',
  category: '2-Piece Stitched Suit',
  regular_price: '',
  discounted_price: '',
  overview: '',
  product_type_detail: '2-Piece Stitched Suit (Shirt + Trouser)',
  color_name: '',
  fabric: '',
  fit: 'Relaxed / Straight Fit',
  embroidered_details: '',
  suit_stitching: '',
  outfit_architecture: '',
  wash_care: '',
  color_disclaimer:
    'Actual product colors may vary slightly from the images shown due to photographic lighting or device screen settings.',
  video_url: '',
  is_featured: true,
  is_new_arrival: true,
  is_published: true,
  available_stock: '12',
  low_stock_threshold: '5',
  size_stock: {
    Small: 3,
    Medium: 3,
    Large: 3,
    'Extra Large': 3,
  },
  images: [],
  sizes_input: 'Small, Medium, Large, Extra Large',
  colors_input: '',
};

export const AdminProductsPage: React.FC = () => {
  const { refreshStorefront } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Confirmation Dialog state for Delete Product
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getAdminProducts();
      setProducts(res.products);
    } catch {
      // handled gracefully
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const openCreateModal = () => {
    const nextNum = products.length + 1;
    setForm({
      ...EMPTY_FORM,
      sku: `RER-PRET-0${nextNum}`,
    });
    setFormError(null);
    setEditorOpen(true);
  };

  const openEditModal = (prod: Product) => {
    const rawMap = prod.inventory.size_stock || {};
    const fallbackPerSize = Math.max(0, Math.floor(prod.inventory.available_stock / 4));
    const resolvedSizeStock: Record<string, number> = {
      Small: Number(rawMap.Small ?? fallbackPerSize),
      Medium: Number(rawMap.Medium ?? fallbackPerSize),
      Large: Number(rawMap.Large ?? fallbackPerSize),
      'Extra Large': Number(rawMap['Extra Large'] ?? fallbackPerSize),
    };
    const totalFromSizes = Object.values(resolvedSizeStock).reduce((s, n) => s + n, 0);

    setForm({
      id: prod.id,
      name: prod.name,
      sku: prod.sku,
      collection_name: prod.collection_name,
      category: prod.category,
      regular_price: String(prod.regular_price),
      discounted_price: prod.discounted_price !== null ? String(prod.discounted_price) : '',
      overview: prod.overview,
      product_type_detail: prod.product_type_detail,
      color_name: prod.color_name,
      fabric: prod.fabric,
      fit: prod.fit,
      embroidered_details: prod.embroidered_details,
      suit_stitching: prod.suit_stitching,
      outfit_architecture: prod.outfit_architecture,
      wash_care: prod.wash_care,
      color_disclaimer: prod.color_disclaimer,
      video_url: prod.video_url || '',
      is_featured: prod.is_featured,
      is_new_arrival: prod.is_new_arrival,
      is_published: prod.is_published,
      available_stock: String(totalFromSizes),
      low_stock_threshold: String(prod.inventory.low_stock_threshold),
      size_stock: resolvedSizeStock,
      images: prod.images.map((i) => i.image_url),
      sizes_input: STANDARD_SIZES.join(', '),
      colors_input: prod.colors.join(', '),
    });
    setFormError(null);
    setEditorOpen(true);
  };

  const updateFormSizeStock = (size: string, nextVal: number) => {
    const clamped = Math.max(0, Math.floor(nextVal));
    setForm((prev) => {
      const updatedMap = {
        ...prev.size_stock,
        [size]: clamped,
      };
      const total = Object.values(updatedMap).reduce((s, n) => s + n, 0);
      return {
        ...prev,
        size_stock: updatedMap,
        available_stock: String(total),
      };
    });
  };

  const handleQuickTableSizeDelta = async (
    prod: Product,
    size: string,
    mode: 'increase' | 'decrease'
  ) => {
    const currentVal = Number(prod.inventory.size_stock?.[size] ?? 0);
    if (mode === 'decrease' && currentVal <= 0) return;
    try {
      const res = await api.adjustInventory(prod.id, {
        mode,
        quantity: 1,
        size,
        note: `Quick ${mode} (1 unit) for ${size} from Products table`,
      });
      setProducts((prev) => prev.map((p) => (p.id === prod.id ? res.product : p)));
      await refreshStorefront();
    } catch {
      // handled gracefully
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    setFormError(null);
    try {
      const res = await api.uploadFiles(files);
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...res.urls],
      }));
    } catch (err: any) {
      setFormError(err.message || 'Image upload failed');
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingVideo(true);
    setFormError(null);
    try {
      const res = await api.uploadFiles(files);
      if (res.urls && res.urls.length > 0) {
        setForm((prev) => ({
          ...prev,
          video_url: res.urls[0],
        }));
      }
    } catch (err: any) {
      setFormError(err.message || 'Video upload failed');
    } finally {
      setUploadingVideo(false);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, newImageUrl.trim()],
    }));
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleMakePrimary = (index: number) => {
    setForm((prev) => {
      const copy = [...prev.images];
      const [picked] = copy.splice(index, 1);
      copy.unshift(picked);
      return { ...prev, images: copy };
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    try {
      const sizes = form.sizes_input
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const colors = form.colors_input
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        collection_name: form.collection_name.trim(),
        category: form.category.trim(),
        regular_price: Number(form.regular_price),
        discounted_price: form.discounted_price.trim() ? Number(form.discounted_price) : null,
        overview: form.overview.trim(),
        product_type_detail: form.product_type_detail.trim(),
        color_name: form.color_name.trim() || colors[0] || '',
        fabric: form.fabric.trim(),
        fit: form.fit.trim() || sizes[0] || 'Relaxed / Straight Fit',
        embroidered_details: form.embroidered_details.trim(),
        suit_stitching: form.suit_stitching.trim(),
        outfit_architecture: form.outfit_architecture.trim(),
        wash_care: form.wash_care.trim(),
        color_disclaimer: form.color_disclaimer.trim(),
        video_url: form.video_url.trim() || null,
        is_featured: form.is_featured,
        is_new_arrival: form.is_new_arrival,
        is_published: form.is_published,
        available_stock: Object.values(form.size_stock).reduce((s, n) => s + n, 0),
        low_stock_threshold: Number(form.low_stock_threshold),
        size_stock: form.size_stock,
        images: form.images,
        sizes: sizes.length > 0 ? sizes : [...STANDARD_SIZES],
        colors: colors.length > 0 ? colors : [form.color_name.trim()].filter(Boolean),
      };

      if (form.id) {
        await api.updateProduct(form.id, payload);
      } else {
        await api.createProduct(payload);
      }

      setEditorOpen(false);
      await loadProducts();
      await refreshStorefront();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickToggle = async (
    prod: Product,
    field: 'is_published' | 'is_featured'
  ) => {
    try {
      await api.updateProduct(prod.id, {
        [field]: !prod[field],
      });
      await loadProducts();
      await refreshStorefront();
    } catch {
      // handled gracefully
    }
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      await api.deleteProduct(productToDelete.id);
      setProductToDelete(null);
      await loadProducts();
      await refreshStorefront();
    } catch {
      // handled gracefully
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5D9C5] p-5 rounded-xs">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8C2D56]">
            Catalog & Variant Control
          </span>
          <h2 className="font-serif-editorial text-3xl font-bold text-[#161F33]">
            Products Management ({products.length})
          </h2>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-5 py-3 bg-[#3A1042] hover:bg-[#8C2D56] text-white text-xs font-semibold uppercase tracking-wider rounded-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4 text-[#D8B572]" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#E5D9C5] rounded-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#161F33]/60">Loading catalog...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F3ECE0] border-b border-[#E5D9C5] text-[#161F33]/75 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">SKU & Category</th>
                  <th className="py-3.5 px-4">Pricing</th>
                  <th className="py-3.5 px-4">Variants (Sizes / Color)</th>
                  <th className="py-3.5 px-4">Stock Status</th>
                  <th className="py-3.5 px-4 text-center">Featured</th>
                  <th className="py-3.5 px-4 text-center">Published</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5D9C5]">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#FAF6F0]/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.primary_image}
                          alt={prod.name}
                          className="w-12 h-16 rounded-xs object-cover object-top border border-[#E5D9C5] shrink-0"
                        />
                        <div>
                          <div className="font-serif-editorial text-xl font-bold text-[#161F33]">
                            {prod.name}
                          </div>
                          <div className="text-[11px] text-[#8C2D56]">
                            {prod.images.length} photos
                            {prod.video_url ? ' + 1 video' : ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono font-semibold text-[#3A1042]">{prod.sku}</div>
                      <div className="text-[11px] text-[#161F33]/65">{prod.category}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-[#3A1042]">
                        {formatPrice(prod.effective_price)}
                      </div>
                      {prod.discounted_price && prod.discounted_price < prod.regular_price && (
                        <div className="text-[11px] text-gray-400 line-through">
                          {formatPrice(prod.regular_price)}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 min-w-[270px]">
                      <div className="truncate font-semibold text-[#161F33] mb-1.5">
                        {prod.color_name}
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {STANDARD_SIZES.map((sz) => {
                          const st = Number(prod.inventory.size_stock?.[sz] ?? 0);
                          return (
                            <div
                              key={sz}
                              className="flex items-center justify-between gap-1 px-2 py-1 rounded bg-[#FAF6F0] border border-[#E5D9C5]"
                            >
                              <span className="text-[10px] font-bold text-[#161F33] truncate">
                                {sz}
                              </span>
                              <div className="inline-flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  disabled={st <= 0}
                                  onClick={() => handleQuickTableSizeDelta(prod, sz, 'decrease')}
                                  className="w-5 h-5 rounded bg-[#8C2D56] hover:bg-[#6e2142] disabled:opacity-35 text-white flex items-center justify-center cursor-pointer"
                                  title={`Decrease ${sz}`}
                                >
                                  <Minus className="w-2.5 h-2.5" />
                                </button>
                                <span
                                  className={`min-w-[18px] text-center font-mono text-[11px] font-extrabold ${
                                    st <= 0 ? 'text-red-600' : 'text-[#3A1042]'
                                  }`}
                                >
                                  {st}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleQuickTableSizeDelta(prod, sz, 'increase')}
                                  className="w-5 h-5 rounded bg-[#2E6F73] hover:bg-[#23585B] text-white flex items-center justify-center cursor-pointer"
                                  title={`Increase ${sz}`}
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-xs text-[10px] font-semibold uppercase tracking-wider ${
                          prod.inventory.stock_status === 'Out of Stock'
                            ? 'bg-red-100 text-red-700'
                            : prod.inventory.stock_status === 'Low Stock'
                              ? 'bg-[#B8862D]/20 text-[#B8862D]'
                              : 'bg-[#2E6F73]/15 text-[#2E6F73]'
                        }`}
                      >
                        {prod.inventory.stock_status} ({prod.inventory.available_stock})
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleQuickToggle(prod, 'is_featured')}
                        className={`p-1.5 rounded-full cursor-pointer transition-colors ${
                          prod.is_featured
                            ? 'bg-[#B8862D]/20 text-[#B8862D]'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                        title="Toggle Featured"
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleQuickToggle(prod, 'is_published')}
                        className={`p-1.5 rounded-full cursor-pointer transition-colors ${
                          prod.is_published
                            ? 'bg-[#2E6F73]/15 text-[#2E6F73]'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                        title={prod.is_published ? 'Published (Click to Unpublish)' : 'Unpublished'}
                      >
                        {prod.is_published ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(prod)}
                        className="px-3 py-1.5 bg-[#3A1042] hover:bg-[#8C2D56] text-white rounded-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductToDelete(prod)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-xs cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            onClick={() => setEditorOpen(false)}
            className="fixed inset-0 bg-[#161F33]/65 backdrop-blur-xs"
          />

          <div className="relative z-10 w-full max-w-4xl bg-white border-2 border-[#B8862D] rounded-xs shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-5 bg-[#3A1042] text-white flex items-center justify-between">
              <h3 className="font-serif-editorial text-2xl font-bold">
                {form.id ? `Edit Product: ${form.name}` : 'Add New Pret Product'}
              </h3>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-6 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 font-medium rounded-xs">
                  {formError}
                </div>
              )}

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#161F33] mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., ANNA"
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#161F33] mb-1">
                    Unique SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="RER-PRET-ANNA-01"
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#161F33] mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="2-Piece Stitched Suit"
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#161F33] mb-1">
                    Regular Price (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.regular_price}
                    onChange={(e) => setForm({ ...form, regular_price: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#161F33] mb-1">
                    Discounted Price (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.discounted_price}
                    onChange={(e) => setForm({ ...form, discounted_price: e.target.value })}
                    placeholder="Leave blank if no discount"
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#161F33] mb-1">
                    Total Available Stock (Sum of Sizes)
                  </label>
                  <input
                    type="number"
                    readOnly
                    value={form.available_stock}
                    className="w-full p-2.5 bg-[#F3ECE0] border border-[#E5D9C5] rounded-xs font-extrabold text-[#3A1042]"
                  />
                </div>
              </div>

              {/* Per-Size Stock Quantities (Small, Medium, Large, Extra Large) */}
              <div className="p-4 bg-[#FAF6F0] border-2 border-[#D8B572]/60 rounded-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#3A1042] block">
                      Sizes & Stock Quantities (Small, Medium, Large, Extra Large)
                    </span>
                    <span className="text-[11px] text-[#161F33]/70">
                      Use the + and - buttons or enter an exact number for each size
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#3A1042] text-[#F7E3B5] text-xs font-bold">
                    Total Stock: {form.available_stock} units
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {STANDARD_SIZES.map((sz) => {
                    const qty = Number(form.size_stock[sz] ?? 0);
                    return (
                      <div
                        key={sz}
                        className="p-3 rounded-lg bg-white border border-[#E5D9C5] flex flex-col gap-2 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-[#161F33]">{sz}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              qty <= 0
                                ? 'bg-red-100 text-red-700'
                                : 'bg-[#2E6F73]/15 text-[#2E6F73]'
                            }`}
                          >
                            {qty <= 0 ? 'Out' : `${qty} pcs`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => updateFormSizeStock(sz, qty - 1)}
                            disabled={qty <= 0}
                            className="w-8 h-8 rounded bg-[#8C2D56] hover:bg-[#6e2142] disabled:opacity-35 text-white flex items-center justify-center cursor-pointer shrink-0"
                            title={`Decrease ${sz}`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={qty}
                            onChange={(e) => updateFormSizeStock(sz, Number(e.target.value) || 0)}
                            className="w-full p-1.5 text-center font-mono text-sm font-extrabold bg-[#FAF6F0] border border-[#E5D9C5] rounded"
                          />
                          <button
                            type="button"
                            onClick={() => updateFormSizeStock(sz, qty + 1)}
                            className="w-8 h-8 rounded bg-[#2E6F73] hover:bg-[#23585B] text-white flex items-center justify-center cursor-pointer shrink-0"
                            title={`Increase ${sz}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Variants: Sizes, Colors, Fabric, Fit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E5D9C5]">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#161F33] mb-1">
                    Available Sizes / Fit Options (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={form.sizes_input}
                    onChange={(e) => setForm({ ...form, sizes_input: e.target.value })}
                    placeholder="e.g., Small, Medium, Large OR Relaxed / Straight Fit"
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#161F33] mb-1">
                    Color Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.color_name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        color_name: e.target.value,
                        colors_input: e.target.value,
                      })
                    }
                    placeholder="e.g., Classic Black with Ivory/Off-White Embroidery"
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#161F33] mb-1">
                    Fabric
                  </label>
                  <input
                    type="text"
                    value={form.fabric}
                    onChange={(e) => setForm({ ...form, fabric: e.target.value })}
                    placeholder="e.g., Premium Cotton / Linen Blend"
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#161F33] mb-1">
                    Silhouette / Fit
                  </label>
                  <input
                    type="text"
                    value={form.fit}
                    onChange={(e) => setForm({ ...form, fit: e.target.value })}
                    placeholder="e.g., Relaxed / Straight Fit"
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
                  />
                </div>
              </div>

              {/* Multiple Product Images Upload & Management */}
              <div className="pt-4 border-t border-[#E5D9C5] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="font-semibold uppercase tracking-wider text-[#161F33] flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#B8862D]" />
                    <span>Product Images ({form.images.length})</span>
                  </label>

                  <label className="px-4 py-2 bg-[#3A1042] hover:bg-[#8C2D56] text-white rounded-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImages ? 'Uploading...' : 'Upload Multiple Images'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Or paste an image URL (/assets/products/...)"
                    className="flex-1 p-2 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-4 py-2 bg-[#F3ECE0] border border-[#E5D9C5] font-semibold rounded-xs hover:bg-[#E5D9C5] cursor-pointer"
                  >
                    Add URL
                  </button>
                </div>

                {form.images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
                    {form.images.map((url, idx) => (
                      <div
                        key={`${url}-${idx}`}
                        className={`relative group aspect-[3/4] rounded-xs overflow-hidden border-2 ${
                          idx === 0 ? 'border-[#B8862D]' : 'border-[#E5D9C5]'
                        }`}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover object-top" />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-[#B8862D] text-white text-[9px] font-bold uppercase rounded-xs">
                            Primary
                          </span>
                        )}
                        <div className="absolute inset-x-0 bottom-0 p-1 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMakePrimary(idx)}
                              className="text-[10px] text-[#D8B572] hover:underline px-1 cursor-pointer"
                            >
                              Set Main
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="text-red-300 hover:text-red-500 p-0.5 ml-auto cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Video (Studio Reel / Lookbook Video) Upload & Management */}
              <div className="pt-4 border-t border-[#E5D9C5] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="font-semibold uppercase tracking-wider text-[#161F33] flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-[#B8862D]" />
                    <span>Product Video (Optional Studio Reel)</span>
                  </label>

                  <div className="flex items-center gap-2">
                    {form.video_url && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, video_url: '' })}
                        className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Video</span>
                      </button>
                    )}

                    <label className="px-4 py-2 bg-[#3A1042] hover:bg-[#8C2D56] text-white rounded-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingVideo ? 'Uploading Video...' : 'Upload Product Video'}</span>
                      <input
                        type="file"
                        accept="video/*,.mp4,.mov,.webm,.mkv,.avi,.m4v,.wmv,.flv,.3gp,.mpeg,.mpg,.ogv,.ts"
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.video_url}
                    onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                    placeholder="Upload any video file (any format or length) or paste a video / YouTube / Drive URL"
                    className="flex-1 p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
                  />
                </div>

                {form.video_url && (
                  <div className="p-3 bg-[#FAF6F0] border border-[#D8B572]/60 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-32 aspect-[3/4] rounded-lg overflow-hidden bg-black border border-[#E5D9C5] shrink-0">
                      <UniversalVideoPlayer
                        src={form.video_url}
                        controls
                        muted
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#2E6F73]/15 text-[#2E6F73] text-[10px] font-bold uppercase tracking-wider">
                        Video Attached (Any Format &amp; Length Supported)
                      </span>
                      <p className="text-xs font-semibold text-[#161F33] truncate">
                        {form.video_url.startsWith('data:') || form.video_url.startsWith('idb://')
                          ? 'Uploaded Video File (Ready to Save)'
                          : form.video_url}
                      </p>
                      <p className="text-[11px] text-[#161F33]/65">
                        This video will appear in the product detail card under the &ldquo;Video Reel&rdquo; tab and thumbnail strip.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Descriptions & Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E5D9C5]">
                <div className="sm:col-span-2">
                  <label className="block font-semibold uppercase tracking-wider text-[#161F33] mb-1">
                    1-Product Overview *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={form.overview}
                    onChange={(e) => setForm({ ...form, overview: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#161F33] mb-1">
                    3-Embroidered Details
                  </label>
                  <textarea
                    rows={3}
                    value={form.embroidered_details}
                    onChange={(e) => setForm({ ...form, embroidered_details: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#161F33] mb-1">
                    4-Suit Stitching
                  </label>
                  <textarea
                    rows={3}
                    value={form.suit_stitching}
                    onChange={(e) => setForm({ ...form, suit_stitching: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#161F33] mb-1">
                    5-Outfit Architecture
                  </label>
                  <textarea
                    rows={3}
                    value={form.outfit_architecture}
                    onChange={(e) => setForm({ ...form, outfit_architecture: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#161F33] mb-1">
                    6-Wash & Care Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={form.wash_care}
                    onChange={(e) => setForm({ ...form, wash_care: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-[#E5D9C5]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                    className="accent-[#3A1042]"
                  />
                  <span className="font-semibold">Published on Storefront</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                    className="accent-[#3A1042]"
                  />
                  <span className="font-semibold">Featured Product</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_new_arrival}
                    onChange={(e) => setForm({ ...form, is_new_arrival: e.target.checked })}
                    className="accent-[#3A1042]"
                  />
                  <span className="font-semibold">Mark as New Arrival</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5D9C5]">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="px-5 py-2.5 border border-[#E5D9C5] rounded-xs font-semibold hover:bg-[#FAF6F0] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#3A1042] hover:bg-[#8C2D56] text-white font-semibold uppercase tracking-wider rounded-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modal Before Deleting Product */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setProductToDelete(null)}
            className="fixed inset-0 bg-[#161F33]/65 backdrop-blur-xs"
          />
          <div className="relative z-10 w-full max-w-md bg-white border-2 border-red-500 rounded-xs p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-700">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif-editorial text-2xl font-bold">Confirm Product Deletion</h3>
            </div>
            <p className="text-xs text-[#161F33]/80 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong>{productToDelete.name}</strong> (SKU: {productToDelete.sku}) from the store?
              This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 border border-[#E5D9C5] rounded-xs text-xs font-semibold hover:bg-[#FAF6F0] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDeleteProduct}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xs text-xs font-semibold uppercase tracking-wider cursor-pointer"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
