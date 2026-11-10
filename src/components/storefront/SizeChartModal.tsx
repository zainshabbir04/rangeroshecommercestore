import React, { useState } from 'react';
import { X, Ruler, Sparkles, CheckCircle2, Shirt, Scissors } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const SizeChartModal: React.FC = () => {
  const { isSizeChartOpen, setIsSizeChartOpen, settings } = useStore();
  const [unit, setUnit] = useState<'in' | 'cm'>('in');
  const [activeSizeCode, setActiveSizeCode] = useState<'S' | 'M' | 'L' | 'XL'>('M');

  if (!isSizeChartOpen) return null;

  const convert = (inches: number) =>
    unit === 'in' ? `${inches}"` : `${Math.round(inches * 2.54)} cm`;

  const sizeData = [
    {
      code: 'S' as const,
      label: 'Small',
      fitNote: 'UK 8–10',
      badgeClass: 'bg-gradient-to-r from-[#3A1042] to-[#541860] text-[#F7E3B5] border-[#D8B572]/60',
      rowHighlight: 'bg-[#3A1042]/[0.06] border-l-4 border-l-[#3A1042]',
      shirt: { shoulder: 14, chest: 19, waist: 18, hip: 20.5, length: 40, sleeve: 21 },
      trouser: { waistRelaxed: 26, waistStretched: 36, thigh: 12.5, length: 37, bottom: 7.5 },
    },
    {
      code: 'M' as const,
      label: 'Medium',
      fitNote: 'UK 12',
      badgeClass: 'bg-gradient-to-r from-[#8B6217] to-[#B8862D] text-white border-[#F7E3B5]/70',
      rowHighlight: 'bg-[#B8862D]/[0.09] border-l-4 border-l-[#B8862D]',
      shirt: { shoulder: 14.5, chest: 20.5, waist: 19.5, hip: 22, length: 41, sleeve: 21.5 },
      trouser: { waistRelaxed: 28, waistStretched: 38, thigh: 13.5, length: 38, bottom: 8 },
    },
    {
      code: 'L' as const,
      label: 'Large',
      fitNote: 'UK 14',
      badgeClass: 'bg-gradient-to-r from-[#1A4B4E] to-[#2E6F73] text-white border-[#8CE0E5]/60',
      rowHighlight: 'bg-[#2E6F73]/[0.08] border-l-4 border-l-[#2E6F73]',
      shirt: { shoulder: 15.5, chest: 22.5, waist: 21.5, hip: 24, length: 42, sleeve: 22 },
      trouser: { waistRelaxed: 30, waistStretched: 41, thigh: 14.5, length: 39, bottom: 8.5 },
    },
    {
      code: 'XL' as const,
      label: 'Extra Large',
      fitNote: 'UK 16',
      badgeClass: 'bg-gradient-to-r from-[#681B3C] to-[#8C2D56] text-white border-[#F5B8D1]/60',
      rowHighlight: 'bg-[#8C2D56]/[0.08] border-l-4 border-l-[#8C2D56]',
      shirt: { shoulder: 16, chest: 24, waist: 23, hip: 25.5, length: 42.5, sleeve: 22.5 },
      trouser: { waistRelaxed: 32, waistStretched: 44, thigh: 15.5, length: 39.5, bottom: 9 },
    },
  ];

  const selectedSizeObj = sizeData.find((s) => s.code === activeSizeCode) || sizeData[1];
  const logoUrl = settings?.logo_url || '/assets/logo/website-logo.jpg';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={() => setIsSizeChartOpen(false)}
        className="fixed inset-0 bg-[#120416]/75 backdrop-blur-md transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-4xl bg-gradient-to-b from-[#FAF6F0] via-white to-[#F3ECE0] border-2 border-[#D8B572] rounded-3xl shadow-[0_28px_70px_-10px_rgba(36,8,41,0.65)] overflow-hidden max-h-[90vh] flex flex-col">
        {/* Top Shimmer Line */}
        <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-[#3A1042] via-[#D8B572] to-[#8C2D56]" />

        {/* Luxury Header (shrink-0 prevents vertical clipping) */}
        <div className="shrink-0 px-5 py-4 sm:px-7 sm:py-5 bg-gradient-to-r from-[#200626] via-[#3A1042] to-[#1A051E] text-white flex flex-wrap items-center justify-between gap-4 border-b border-[#D8B572]/60">
          <div className="flex items-center gap-4">
            <div className="logo-3d-stage shrink-0">
              <div className="logo-3d-medallion relative w-12 h-12 sm:w-14 sm:h-14 rounded-full p-0.5 bg-white flex items-center justify-center">
                <div className="logo-3d-ring" />
                <img
                  src={logoUrl}
                  alt="Rang e Rosh"
                  className="relative z-10 w-full h-full rounded-full object-cover"
                />
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[#F7E3B5]">
                <Sparkles className="w-3 h-3 text-[#D8B572] animate-pulse" />
                Rang e Rosh • Pret Tailoring Guide
              </span>
              <h2 className="font-serif-editorial text-2xl sm:text-3xl font-bold tracking-wide text-white leading-snug">
                2-Piece Stitched Suits Size Chart
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Pill Unit Toggle */}
            <div className="inline-flex rounded-full p-1 bg-white/10 border border-[#D8B572]/60 text-xs font-bold">
              <button
                type="button"
                onClick={() => setUnit('in')}
                className={`px-3.5 py-1.5 rounded-full cursor-pointer transition-all ${
                  unit === 'in'
                    ? 'bg-gradient-to-r from-[#B8862D] to-[#96681B] text-white shadow-sm'
                    : 'text-[#FAF6F0]/75 hover:text-white'
                }`}
              >
                Inches (")
              </button>
              <button
                type="button"
                onClick={() => setUnit('cm')}
                className={`px-3.5 py-1.5 rounded-full cursor-pointer transition-all ${
                  unit === 'cm'
                    ? 'bg-gradient-to-r from-[#B8862D] to-[#96681B] text-white shadow-sm'
                    : 'text-[#FAF6F0]/75 hover:text-white'
                }`}
              >
                CM
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsSizeChartOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-[#8C2D56] text-white border border-white/20 transition-all cursor-pointer"
              aria-label="Close Size Chart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 min-h-0 p-5 sm:p-7 overflow-y-auto space-y-6">
          {/* Interactive Size Selector Pills + Instant Highlight Card */}
          <div className="bg-white border border-[#D8B572]/55 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-[#8C2D56]" />
                <span className="font-couture-unique text-xs font-bold uppercase tracking-wider text-[#3A1042]">
                  Select Your Size for Quick Preview:
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {sizeData.map((s) => {
                  const isActive = s.code === activeSizeCode;
                  return (
                    <button
                      key={s.code}
                      type="button"
                      onClick={() => setActiveSizeCode(s.code)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer flex flex-col items-center ${
                        isActive
                          ? `${s.badgeClass} scale-105 shadow-md ring-2 ring-[#D8B572]`
                          : 'bg-[#FAF6F0] text-[#161F33] border-[#E5D9C5] hover:border-[#B8862D]'
                      }`}
                    >
                      <span className="font-couture-unique text-sm leading-none">{s.code}</span>
                      <span className="text-[9px] opacity-85 mt-0.5">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Instant Selected Size Measurement Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 pt-3 border-t border-[#E5D9C5]/80">
              {[
                { label: 'Chest (1/2)', val: convert(selectedSizeObj.shirt.chest), color: 'bg-[#F9F3FB] text-[#3A1042] border-[#3A1042]/20' },
                { label: 'Shirt Length', val: convert(selectedSizeObj.shirt.length), color: 'bg-[#FDF9F0] text-[#785312] border-[#B8862D]/30' },
                { label: 'Shoulder', val: convert(selectedSizeObj.shirt.shoulder), color: 'bg-[#F0F9F9] text-[#1D4E52] border-[#2E6F73]/25' },
                { label: 'Hips / Daman', val: convert(selectedSizeObj.shirt.hip), color: 'bg-[#FCF2F6] text-[#6E1E40] border-[#8C2D56]/25' },
                { label: 'Trouser Length', val: convert(selectedSizeObj.trouser.length), color: 'bg-[#F9F3FB] text-[#3A1042] border-[#3A1042]/20' },
                { label: 'Trouser Waist', val: `${convert(selectedSizeObj.trouser.waistRelaxed)}–${convert(selectedSizeObj.trouser.waistStretched)}`, color: 'bg-[#FDF9F0] text-[#785312] border-[#B8862D]/30' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-xl border px-3 py-2 text-center ${stat.color}`}
                >
                  <span className="block text-[9px] font-bold uppercase tracking-wider opacity-75">
                    {stat.label}
                  </span>
                  <span className="font-serif-editorial text-lg font-bold leading-tight">
                    {stat.val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 1. Shirt / Kameez Table */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3A1042] text-[#F7E3B5] text-xs font-bold tracking-wider uppercase">
                <Shirt className="w-3.5 h-3.5 text-[#D8B572]" />
                <span>1. Shirt (Kameez) — Relaxed / Straight Fit</span>
              </div>
              <span className="text-[11px] text-[#8C2D56] font-semibold">
                Flat Garment Measurements ({unit === 'in' ? 'Inches' : 'Centimeters'})
              </span>
            </div>

            <div className="overflow-x-auto bg-white border border-[#D8B572]/55 rounded-2xl shadow-xs">
              <table className="w-full text-center border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-[#240829] via-[#3A1042] to-[#240829] text-[#F7E3B5] uppercase text-[10px] sm:text-[11px] tracking-[0.12em]">
                    <th className="py-3 px-4 text-left">Size</th>
                    <th className="py-3 px-3">Shoulder</th>
                    <th className="py-3 px-3">Chest (1/2)</th>
                    <th className="py-3 px-3">Waist (1/2)</th>
                    <th className="py-3 px-3">Hips / Daman</th>
                    <th className="py-3 px-3">Shirt Length</th>
                    <th className="py-3 px-3">Sleeve</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5D9C5]/80">
                  {sizeData.map((row) => {
                    const isSelected = row.code === activeSizeCode;
                    return (
                      <tr
                        key={row.code}
                        onClick={() => setActiveSizeCode(row.code)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? row.rowHighlight : 'hover:bg-[#FAF6F0]'
                        }`}
                      >
                        <td className="py-3 px-4 text-left">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-7 h-7 rounded-full text-[11px] font-bold flex items-center justify-center border shadow-2xs ${row.badgeClass}`}
                            >
                              {row.code}
                            </span>
                            <div>
                              <span className="font-bold text-[#161F33] block leading-none">
                                {row.label}
                              </span>
                              <span className="text-[10px] text-[#8C2D56] font-medium">
                                {row.fitNote}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-medium text-[#161F33]">
                          {convert(row.shirt.shoulder)}
                        </td>
                        <td className="py-3 px-3 font-bold text-[#3A1042]">
                          {convert(row.shirt.chest)}
                        </td>
                        <td className="py-3 px-3 font-medium text-[#161F33]">
                          {convert(row.shirt.waist)}
                        </td>
                        <td className="py-3 px-3 font-medium text-[#161F33]">
                          {convert(row.shirt.hip)}
                        </td>
                        <td className="py-3 px-3 font-bold text-[#8C2D56]">
                          {convert(row.shirt.length)}
                        </td>
                        <td className="py-3 px-3 font-medium text-[#161F33]">
                          {convert(row.shirt.sleeve)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Stitched Trouser Table */}
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1A4B4E] text-[#D4F8FA] text-xs font-bold tracking-wider uppercase">
              <Scissors className="w-3.5 h-3.5 text-[#8CE0E5]" />
              <span>2. Stitched Trouser — Elasticated Waistband</span>
            </div>

            <div className="overflow-x-auto bg-white border border-[#D8B572]/55 rounded-2xl shadow-xs">
              <table className="w-full text-center border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-[#161F33] via-[#1A4B4E] to-[#161F33] text-[#FAF6F0] uppercase text-[10px] sm:text-[11px] tracking-[0.12em]">
                    <th className="py-3 px-4 text-left">Size</th>
                    <th className="py-3 px-3">Waist (Relaxed)</th>
                    <th className="py-3 px-3">Waist (Stretched)</th>
                    <th className="py-3 px-3">Thigh (1/2)</th>
                    <th className="py-3 px-3">Trouser Length</th>
                    <th className="py-3 px-3">Bottom / Paincha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5D9C5]/80">
                  {sizeData.map((row) => {
                    const isSelected = row.code === activeSizeCode;
                    return (
                      <tr
                        key={row.code}
                        onClick={() => setActiveSizeCode(row.code)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? row.rowHighlight : 'hover:bg-[#FAF6F0]'
                        }`}
                      >
                        <td className="py-3 px-4 text-left">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-7 h-7 rounded-full text-[11px] font-bold flex items-center justify-center border shadow-2xs ${row.badgeClass}`}
                            >
                              {row.code}
                            </span>
                            <span className="font-bold text-[#161F33]">{row.label}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-medium text-[#161F33]">
                          {convert(row.trouser.waistRelaxed)}
                        </td>
                        <td className="py-3 px-3 font-medium text-[#161F33]">
                          {convert(row.trouser.waistStretched)}
                        </td>
                        <td className="py-3 px-3 font-medium text-[#161F33]">
                          {convert(row.trouser.thigh)}
                        </td>
                        <td className="py-3 px-3 font-bold text-[#2E6F73]">
                          {convert(row.trouser.length)}
                        </td>
                        <td className="py-3 px-3 font-medium text-[#161F33]">
                          {convert(row.trouser.bottom)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Compact Multi-Color Fit Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F9F3FB] border border-[#3A1042]/20 flex items-start gap-2.5 text-[#3A1042]">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#3A1042]" />
              <span>
                <strong>Chest & Waist (1/2):</strong> Measured flat across the front. Double for
                full circumference.
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FDF9F0] border border-[#B8862D]/30 flex items-start gap-2.5 text-[#785312]">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#B8862D]" />
              <span>
                <strong>Relaxed Pret Fit:</strong> Graceful, breathable drape with internal seam
                allowance.
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F0F9F9] border border-[#2E6F73]/25 flex items-start gap-2.5 text-[#1D4E52]">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#2E6F73]" />
              <span>
                <strong>Tailoring Tolerance:</strong> Allow ±0.5" variation due to artisanal
                embroidery.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
