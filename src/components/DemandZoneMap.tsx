import React, { useState } from 'react';
import { MapPin, Navigation, Phone } from 'lucide-react';
import { Supplier } from '../types/credit';

interface DemandZoneMapProps {
  suppliers: Supplier[];
  onSelectSupplier: (supplier: Supplier) => void;
  compact?: boolean;
}

export const DemandZoneMap: React.FC<DemandZoneMapProps> = ({
  suppliers,
  onSelectSupplier,
  compact = false,
}) => {
  const [selectedId, setSelectedId] = useState<string>(suppliers[0]?.id || '');
  const activeSupplier = suppliers.find((s) => s.id === selectedId) || suppliers[0];

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.08] bg-slate-100 dark:bg-[#11191D] relative">
      <div className={`relative w-full ${compact ? 'h-48' : 'h-64 sm:h-72'} overflow-hidden`}>
        {/* Stylized local vector map of Barinas / zonas de alta demanda */}
        <svg
          viewBox="0 0 400 220"
          className="w-full h-full object-cover select-none"
          aria-label="Mapa interactivo de zonas de alta demanda y mataderos aliados"
        >
          <defs>
            <radialGradient id="demandZoneGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00D1C1" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#00D1C1" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width="400" height="220" className="fill-slate-200 dark:fill-[#132029]" />

          {/* Urban blocks */}
          <g className="fill-slate-300/60 dark:fill-[#1A2B36]">
            <rect x="20" y="18" width="68" height="44" rx="4" />
            <rect x="104" y="16" width="84" height="36" rx="4" />
            <rect x="205" y="18" width="76" height="42" rx="4" />
            <rect x="296" y="14" width="82" height="52" rx="4" />
            <rect x="24" y="78" width="58" height="52" rx="4" />
            <rect x="98" y="68" width="90" height="60" rx="4" />
            <rect x="208" y="76" width="74" height="54" rx="4" />
            <rect x="300" y="82" width="78" height="48" rx="4" />
            <rect x="26" y="148" width="74" height="54" rx="4" />
            <rect x="116" y="146" width="80" height="56" rx="4" />
            <rect x="214" y="146" width="78" height="54" rx="4" />
            <rect x="308" y="146" width="70" height="56" rx="4" />
          </g>

          {/* Main avenues */}
          <g className="stroke-white/70 dark:stroke-[#233947]" strokeWidth="3" fill="none">
            <path d="M0 64 Q 140 54, 240 66 T 400 72" />
            <path d="M0 138 L 400 138" />
            <path d="M92 0 L 98 220" />
            <path d="M196 0 Q 204 110, 198 220" />
            <path d="M292 0 L 296 220" />
          </g>

          {/* High-demand zone heat areas */}
          <circle cx="185" cy="118" r="56" fill="url(#demandZoneGlow)" />
          <circle cx="296" cy="92" r="46" fill="url(#demandZoneGlow)" />

          {/* Zone labels */}
          <g className="fill-slate-600 dark:fill-slate-400 text-[9px] font-medium">
            <text x="112" y="42">Cuatricentenaria</text>
            <text x="208" y="112">Mercado La Carolina</text>
            <text x="298" y="44">Zona Industrial</text>
            <text x="36" y="176">Alto Barinas</text>
          </g>
        </svg>

        {/* Supplier pins */}
        {suppliers.slice(0, 6).map((sup) => {
          const isSelected = activeSupplier?.id === sup.id;
          return (
            <button
              key={sup.id}
              type="button"
              onClick={() => setSelectedId(sup.id)}
              style={{ left: `${sup.mapX}%`, top: `${sup.mapY}%` }}
              aria-label={`Ver proveedor ${sup.name}`}
              className={`absolute -translate-x-1/2 -translate-y-1/2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full transition-transform cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                isSelected ? 'scale-115 z-20' : 'z-10 hover:scale-105'
              }`}
            >
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shadow-md border-2 ${
                  isSelected
                    ? 'bg-teal-600 dark:bg-[#00D1C1] text-white dark:text-[#041413] border-white dark:border-slate-950'
                    : 'bg-white dark:bg-[#18242A] text-slate-800 dark:text-teal-300 border-teal-500/70'
                }`}
              >
                {sup.code}
              </span>
            </button>
          );
        })}

        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-[#0C1214]/90 backdrop-blur-sm border border-slate-200 dark:border-white/10 text-[11px] font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
          <Navigation className="w-3 h-3 text-teal-600 dark:text-[#00D1C1]" />
          <span>Zonas de alta demanda · Barinas</span>
        </div>
      </div>

      {activeSupplier && (
        <div className="p-3.5 bg-white dark:bg-[#121718] border-t border-slate-200 dark:border-white/[0.07] flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {activeSupplier.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {activeSupplier.zone} · {activeSupplier.distanceKm} km · {activeSupplier.priceHighlight}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectSupplier(activeSupplier)}
            className="min-h-[40px] shrink-0 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 dark:bg-[#00D1C1] dark:hover:bg-[#1CE0D0] text-white dark:text-[#041413] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Solicitar lote</span>
          </button>
        </div>
      )}
    </div>
  );
};
