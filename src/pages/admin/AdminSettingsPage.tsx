import React, { useState, useEffect } from 'react';
import { Check, Upload, Save, AlertCircle, KeyRound, Lock } from 'lucide-react';
import { StoreSettings } from '../../types';
import { api } from '../../services/api';
import { useStore } from '../../context/StoreContext';

export const AdminSettingsPage: React.FC = () => {
  const { settings, refreshStorefront } = useStore();
  const [form, setForm] = useState<Partial<StoreSettings>>({});
  const [paymentMethodsText, setPaymentMethodsText] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Admin Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (settings) {
      setForm(settings);
      setPaymentMethodsText((settings.payment_methods || []).join(', '));
    }
  }, [settings]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingLogo(true);
    setFeedback(null);
    try {
      const res = await api.uploadFiles(files);
      const uploadedLogoUrl = res.urls?.[0];
      if (uploadedLogoUrl) {
        const updatedForm = { ...form, logo_url: uploadedLogoUrl };
        setForm(updatedForm);
        await api.updateSettings(updatedForm);
        await refreshStorefront();
        setFeedback({
          type: 'success',
          text: 'New logo uploaded and immediately applied to the Storefront & Admin Dashboard!',
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Logo upload failed' });
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  const handleRestoreOriginalLogo = async () => {
    const defaultLogo = '/assets/logo/rang-e-rosh-logo-v2.jpg';
    const updatedForm = { ...form, logo_url: defaultLogo };
    setForm(updatedForm);
    try {
      await api.updateSettings(updatedForm);
      await refreshStorefront();
      setFeedback({
        type: 'success',
        text: 'Original Rang e Rosh logo restored across Storefront & Admin Dashboard!',
      });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to restore logo' });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const methods = paymentMethodsText
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean);

      if (form.tiktok_pixel_id !== undefined) {
        try {
          if (form.tiktok_pixel_id.trim()) {
            localStorage.setItem('rer_tiktok_pixel_id', form.tiktok_pixel_id.trim());
          } else {
            localStorage.removeItem('rer_tiktok_pixel_id');
          }
        } catch {
          // ignore
        }
      }

      await api.updateSettings({
        ...form,
        payment_methods: methods,
      });
      await refreshStorefront();
      setFeedback({
        type: 'success',
        text: 'Store settings and homepage promotional content updated successfully!',
      });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div className="bg-white border border-[#E5D9C5] p-5 rounded-xs">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8C2D56]">
          Storefront & Dispatch Configuration
        </span>
        <h2 className="font-serif-editorial text-3xl font-bold text-[#161F33]">
          Store Settings & Promotional Content
        </h2>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xs text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-[#2E6F73]/15 text-[#2E6F73] border border-[#2E6F73]/30'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* 1. Brand Identity & Contact Info */}
        <div className="bg-white border border-[#E5D9C5] rounded-xs p-6 space-y-4">
          <h3 className="font-serif-editorial text-2xl font-bold text-[#161F33] border-b border-[#E5D9C5] pb-2">
            1. Store Identity, Logo & WhatsApp Numbers
          </h3>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-2">
            <img
              src={form.logo_url || settings?.logo_url || '/assets/logo/rang-e-rosh-logo-v2.jpg'}
              alt="Store Logo"
              className="w-20 h-20 rounded-full object-contain bg-[#FAF6F0] p-1 border-2 border-[#B8862D]"
            />
            <div className="space-y-2">
              <label className="px-4 py-2 bg-[#3A1042] hover:bg-[#8C2D56] text-white rounded-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingLogo ? 'Uploading...' : 'Upload New Logo'}</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
              <button
                type="button"
                onClick={handleRestoreOriginalLogo}
                className="ml-3 text-[#8C2D56] hover:underline font-medium cursor-pointer"
              >
                Restore Original Rang e Rosh Logo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase tracking-wider mb-1">
                Store Name
              </label>
              <input
                type="text"
                value={form.store_name || ''}
                onChange={(e) => setForm({ ...form, store_name: e.target.value })}
                className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider mb-1">
                Store Tagline
              </label>
              <input
                type="text"
                value={form.store_tagline || ''}
                onChange={(e) => setForm({ ...form, store_tagline: e.target.value })}
                className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider mb-1 text-[#2E6F73]">
                WhatsApp Order Confirmation Number *
              </label>
              <input
                type="text"
                required
                value={form.whatsapp_number || ''}
                onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                placeholder="03130888048"
                className="w-full p-2.5 bg-[#FAF6F0] border border-[#2E6F73] rounded-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider mb-1">
                General Contact Phone
              </label>
              <input
                type="text"
                value={form.contact_phone || ''}
                onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                placeholder="03130888048"
                className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold uppercase tracking-wider mb-1">
                Official Contact Email
              </label>
              <input
                type="email"
                value={form.contact_email || ''}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                placeholder="rangerosh.official@gmail.com"
                className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
              />
            </div>
          </div>
        </div>

        {/* 2. Shipping, Thresholds & Payment Methods */}
        <div className="bg-white border border-[#E5D9C5] rounded-xs p-6 space-y-4">
          <h3 className="font-serif-editorial text-2xl font-bold text-[#161F33] border-b border-[#E5D9C5] pb-2">
            2. Shipping Charges, Inventory Thresholds & Payment Methods
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold uppercase tracking-wider mb-1">
                Standard Shipping Charges (PKR)
              </label>
              <input
                type="number"
                min="0"
                value={form.shipping_charges ?? 250}
                onChange={(e) =>
                  setForm({ ...form, shipping_charges: Number(e.target.value) })
                }
                className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider mb-1">
                Free Shipping Threshold (PKR)
              </label>
              <input
                type="number"
                min="0"
                value={form.free_shipping_threshold ?? 10000}
                onChange={(e) =>
                  setForm({ ...form, free_shipping_threshold: Number(e.target.value) })
                }
                className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider mb-1">
                Default Low-Stock Threshold
              </label>
              <input
                type="number"
                min="1"
                value={form.low_stock_threshold ?? 5}
                onChange={(e) =>
                  setForm({ ...form, low_stock_threshold: Number(e.target.value) })
                }
                className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block font-semibold uppercase tracking-wider mb-1">
                Available Checkout Payment Methods (comma-separated)
              </label>
              <input
                type="text"
                value={paymentMethodsText}
                onChange={(e) => setPaymentMethodsText(e.target.value)}
                placeholder="Cash on Delivery (COD), Bank Transfer (Confirm via WhatsApp)"
                className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
              />
            </div>
          </div>
        </div>

        {/* 3. Homepage Promotional Content */}
        <div className="bg-white border border-[#E5D9C5] rounded-xs p-6 space-y-4">
          <h3 className="font-serif-editorial text-2xl font-bold text-[#161F33] border-b border-[#E5D9C5] pb-2">
            3. Homepage Promotional Content
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block font-semibold uppercase tracking-wider mb-1">
                Top Announcement Bar Text
              </label>
              <input
                type="text"
                value={form.announcement_text || ''}
                onChange={(e) => setForm({ ...form, announcement_text: e.target.value })}
                className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold uppercase tracking-wider mb-1">
                  Hero Badge Text
                </label>
                <input
                  type="text"
                  value={form.hero_badge || ''}
                  onChange={(e) => setForm({ ...form, hero_badge: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider mb-1">
                  Hero Main Headline
                </label>
                <input
                  type="text"
                  value={form.hero_title || ''}
                  onChange={(e) => setForm({ ...form, hero_title: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider mb-1">
                Hero Subtitle
              </label>
              <textarea
                rows={2}
                value={form.hero_subtitle || ''}
                onChange={(e) => setForm({ ...form, hero_subtitle: e.target.value })}
                className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold uppercase tracking-wider mb-1">
                  Promotional Banner Title
                </label>
                <input
                  type="text"
                  value={form.promo_banner_title || ''}
                  onChange={(e) => setForm({ ...form, promo_banner_title: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider mb-1">
                  Promotional Banner Description
                </label>
                <input
                  type="text"
                  value={form.promo_banner_subtitle || ''}
                  onChange={(e) => setForm({ ...form, promo_banner_subtitle: e.target.value })}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Official Social Media Links */}
        <div className="bg-white border border-[#E5D9C5] rounded-xs p-6 space-y-4">
          <h3 className="font-serif-editorial text-2xl font-bold text-[#161F33] border-b border-[#E5D9C5] pb-2">
            4. Social Media Links
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase tracking-wider mb-1">
                Instagram URL
              </label>
              <input
                type="url"
                value={form.instagram_url || ''}
                onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
                className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider mb-1">
                Facebook URL
              </label>
              <input
                type="url"
                value={form.facebook_url || ''}
                onChange={(e) => setForm({ ...form, facebook_url: e.target.value })}
                className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider mb-1">
                YouTube URL
              </label>
              <input
                type="url"
                value={form.youtube_url || ''}
                onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
                className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider mb-1">
                TikTok URL
              </label>
              <input
                type="url"
                value={form.tiktok_url || ''}
                onChange={(e) => setForm({ ...form, tiktok_url: e.target.value })}
                className="w-full p-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider mb-1 text-[#3A1042]">
                TikTok Ads Pixel ID (ttq.load)
              </label>
              <input
                type="text"
                placeholder="e.g. DC4QQU3C77U0A5LSPG3G"
                value={
                  form.tiktok_pixel_id ??
                  ((typeof localStorage !== 'undefined'
                    ? localStorage.getItem('rer_tiktok_pixel_id')
                    : null) ||
                    'DC4QQU3C77U0A5LSPG3G')
                }
                onChange={(e) => setForm({ ...form, tiktok_pixel_id: e.target.value })}
                className="w-full p-2.5 bg-[#FAF6F0] border border-[#3A1042]/40 rounded-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider mb-1 text-[#2E6F73]">
                Meta (Facebook) Pixel ID
              </label>
              <input
                type="text"
                value={form.meta_pixel_id || '2635132979997484'}
                onChange={(e) => setForm({ ...form, meta_pixel_id: e.target.value })}
                className="w-full p-2.5 bg-[#FAF6F0] border border-[#2E6F73]/40 rounded-xs font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 bg-[#3A1042] hover:bg-[#8C2D56] text-white text-xs font-semibold uppercase tracking-[0.16em] rounded-xs flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Save className="w-4 h-4 text-[#D8B572]" />
            <span>{saving ? 'Saving Configuration...' : 'Save All Store Settings'}</span>
          </button>
        </div>
      </form>

      {/* 5. Admin Security & Change Password Section */}
      <div className="bg-white border border-[#E5D9C5] rounded-xs p-6 space-y-4 text-xs">
        <h3 className="font-serif-editorial text-2xl font-bold text-[#161F33] border-b border-[#E5D9C5] pb-2 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-[#B8862D]" />
          <span>5. Admin Password &amp; Security</span>
        </h3>

        {passwordFeedback && (
          <div
            className={`p-3.5 rounded-xs font-semibold flex items-center gap-2 ${
              passwordFeedback.type === 'success'
                ? 'bg-[#2E6F73]/15 text-[#2E6F73] border border-[#2E6F73]/30'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {passwordFeedback.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{passwordFeedback.text}</span>
          </div>
        )}

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setPasswordFeedback(null);
            if (newPassword.trim().length < 6) {
              setPasswordFeedback({
                type: 'error',
                text: 'New password must be at least 6 characters long.',
              });
              return;
            }
            if (newPassword !== confirmNewPassword) {
              setPasswordFeedback({
                type: 'error',
                text: 'New password and confirm password do not match.',
              });
              return;
            }
            setChangingPassword(true);
            try {
              const res = await api.changeAdminPassword({
                current_password: currentPassword,
                new_password: newPassword.trim(),
              });
              setPasswordFeedback({
                type: 'success',
                text: res.message || 'Admin password updated successfully!',
              });
              setCurrentPassword('');
              setNewPassword('');
              setConfirmNewPassword('');
            } catch (err: any) {
              setPasswordFeedback({
                type: 'error',
                text: err.message || 'Failed to update admin password.',
              });
            } finally {
              setChangingPassword(false);
            }
          }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end"
        >
          <div>
            <label className="block font-semibold uppercase tracking-wider mb-1">
              Current Password *
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider mb-1">
              New Password *
            </label>
            <div className="relative">
              <KeyRound className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider mb-1">
              Confirm New Password *
            </label>
            <div className="relative">
              <KeyRound className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs"
              />
            </div>
          </div>

          <div className="sm:col-span-3 flex justify-end pt-1">
            <button
              type="submit"
              disabled={changingPassword}
              className="px-6 py-3 bg-[#2E6F73] hover:bg-[#23585B] text-white text-xs font-semibold uppercase tracking-[0.14em] rounded-xs flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <KeyRound className="w-4 h-4" />
              <span>{changingPassword ? 'Updating Password...' : 'Change Admin Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
