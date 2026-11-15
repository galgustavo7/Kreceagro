import React, { useMemo, useState } from 'react';
import {
  ArrowDownAZ,
  Clock,
  Map as MapIcon,
  MapPin,
  Phone,
  Search,
  ShoppingBag,
} from 'lucide-react';
import { CreditCategory, Supplier } from '../types/credit';
import { DemandZoneMap } from './DemandZoneMap';

interface SuppliersViewProps {
  suppliers: Supplier[];
  onRequestAtSupplier: (category: CreditCategory, supplier: Supplier) => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
  onRequestAtSupplier,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'distance' | 'az'>('distance');
  const [showMap, setShowMap] = useState(true);

  const cities = useMemo(
    () => Array.from(new Set(suppliers.map((s) => s.city))),
    [suppliers]
  );

  const filteredSuppliers = useMemo(() => {
    return suppliers
      .filter((sup) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          sup.name.toLowerCase().includes(q) ||
          sup.zone.toLowerCase().includes(q) ||
          sup.products.some((p) => p.toLowerCase().includes(q));
        const matchesCity = selectedCity === 'all' || sup.city === selectedCity;
        const matchesCat =
          selectedCategory === 'all' || sup.category === selectedCategory;
        const matchesOpen = !onlyOpen || sup.isOpen;
        return matchesQuery && matchesCity && matchesCat && matchesOpen;
      })
      .sort((a, b) =>
        sortBy === 'distance'
          ? a.distanceKm - b.distanceKm
          : a.name.localeCompare(b.name)
      );
  }, [suppliers, searchQuery, selectedCity, selectedCategory, onlyOpen, sortBy]);

  const mapCategoryToCredit = (cat: Supplier['category']): CreditCategory => {
    if (cat === 'porcicola') return CreditCategory.PORCICOLA;
    if (cat === 'equipamiento') return CreditCategory.CAPITAL;
    if (cat === 'mixto') return CreditCategory.MIXTO;
    return CreditCategory.AVICOLA;
  };

  return (
    <div className="space-y-5 pb-24 lg:pb-10">
      {/* Search & Dropdowns */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar matadero, granja, corte o zona..."
            aria-label="Buscar proveedor aliado"
            className="w-full min-h-[48px] pl-11 pr-4 rounded-2xl bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            aria-label="Filtrar por ciudad"
            className="w-full min-h-[46px] px-4 rounded-2xl bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">Todas las ciudades</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filtrar por rubro"
            className="w-full min-h-[46px] px-4 rounded-2xl bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">Todos los rubros</option>
            <option value="avicola">Avícola (Pollo y huevos)</option>
            <option value="porcicola">Porcícola (Cerdo en canal / cortes)</option>
            <option value="mixto">Mixto Avícola + Porcícola</option>
            <option value="equipamiento">Cadena de Frío / Cava</option>
          </select>
        </div>

        {/* Sort & Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyOpen((prev) => !prev)}
              className={`min-h-[38px] px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                onlyOpen
                  ? 'bg-teal-600 dark:bg-[#00D1C1] text-white dark:text-[#041413] border-teal-600 dark:border-[#00D1C1]'
                  : 'bg-white dark:bg-[#121718] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/[0.1]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Abiertos</span>
            </button>

            <button
              type="button"
              onClick={() => setSortBy('az')}
              className={`min-h-[38px] px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                sortBy === 'az'
                  ? 'bg-teal-600 dark:bg-[#00D1C1] text-white dark:text-[#041413] border-teal-600 dark:border-[#00D1C1]'
                  : 'bg-white dark:bg-[#121718] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/[0.1]'
              }`}
            >
              <ArrowDownAZ className="w-3.5 h-3.5" />
              <span>A-Z</span>
            </button>

            <button
              type="button"
              onClick={() => setSortBy('distance')}
              className={`min-h-[38px] px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                sortBy === 'distance'
                  ? 'bg-teal-600 dark:bg-[#00D1C1] text-white dark:text-[#041413] border-teal-600 dark:border-[#00D1C1]'
                  : 'bg-white dark:bg-[#121718] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/[0.1]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Distancia</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowMap((prev) => !prev)}
              className="min-h-[38px] px-3 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#121718] text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
            >
              <MapIcon className="w-3.5 h-3.5 text-teal-600 dark:text-[#00D1C1]" />
              <span>{showMap ? 'Ocultar mapa' : 'Ver mapa'}</span>
            </button>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
              {filteredSuppliers.length} aliados
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Map */}
      {showMap && filteredSuppliers.length > 0 && (
        <DemandZoneMap
          suppliers={filteredSuppliers}
          onSelectSupplier={(sup) =>
            onRequestAtSupplier(mapCategoryToCredit(sup.category), sup)
          }
        />
      )}

      {/* Suppliers List */}
      {filteredSuppliers.length === 0 ? (
        <div className="rounded-2xl p-8 bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.08] text-center text-sm text-slate-500 dark:text-slate-400">
          No encontramos mataderos o distribuidores con esos filtros.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {filteredSuppliers.map((sup) => (
            <div
              key={sup.id}
              className="rounded-2xl p-4 bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.08] flex flex-col justify-between gap-3.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-[#082A2A] border border-teal-200 dark:border-teal-500/30 flex items-center justify-center text-sm font-extrabold text-teal-700 dark:text-[#00D1C1] shrink-0">
                    {sup.code}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-mono text-slate-400 truncate">
                      {sup.handle}
                    </p>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {sup.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
                      {sup.zone} · {sup.distanceKm} km · Demanda {sup.demandLevel}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-xs font-semibold whitespace-nowrap shrink-0 ${
                    sup.isOpen
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {sup.isOpen ? 'Abierto' : 'Cerrado'}
                </span>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-semibold text-teal-700 dark:text-[#00D1C1]">
                  {sup.priceHighlight}
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-500 dark:text-slate-400">
                  {sup.products.slice(0, 2).join(', ')}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                <a
                  href={`tel:${sup.phone.replace(/\s+/g, '')}`}
                  className="min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-white/[0.1] text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.05] flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-[#00D1C1]" />
                  <span>{sup.phone}</span>
                </a>

                <button
                  type="button"
                  onClick={() =>
                    onRequestAtSupplier(mapCategoryToCredit(sup.category), sup)
                  }
                  className="min-h-[40px] px-4 rounded-xl bg-teal-600 hover:bg-teal-500 dark:bg-[#00D1C1] dark:hover:bg-[#1BE3D3] text-white dark:text-[#041413] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Pedir con crédito</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
