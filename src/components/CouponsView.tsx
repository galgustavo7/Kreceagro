import React from 'react';
import { CheckCircle2, Ticket } from 'lucide-react';
import { Coupon, CreditCategory } from '../types/credit';

interface CouponsViewProps {
  coupons: Coupon[];
  onApplyCoupon: (coupon: Coupon) => void;
}

export const CouponsView: React.FC<CouponsViewProps> = ({
  coupons,
  onApplyCoupon,
}) => {
  const available = coupons.filter((c) => c.status === 'available');
  const used = coupons.filter((c) => c.status === 'used');
  const expired = coupons.filter((c) => c.status === 'expired');

  const renderCouponCard = (coupon: Coupon, canUse: boolean) => (
    <div
      key={coupon.id}
      className="rounded-2xl p-4 bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.08] flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono text-sm font-bold shrink-0 ${
            canUse
              ? 'bg-teal-50 dark:bg-teal-500/15 text-teal-700 dark:text-[#00D1C1]'
              : 'bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400'
          }`}
        >
          ${coupon.discountAmount}
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {coupon.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
            {coupon.description}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 tabular-nums">
            Código: {coupon.code} · Expira el {coupon.expiresAt}
          </p>
        </div>
      </div>

      {canUse ? (
        <button
          type="button"
          onClick={() => onApplyCoupon(coupon)}
          className="min-h-[40px] shrink-0 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 dark:bg-[#00D1C1] dark:hover:bg-[#1EE0D0] text-white dark:text-[#041413] text-xs font-bold transition-colors cursor-pointer"
        >
          Usar ahora
        </button>
      ) : (
        <span className="shrink-0 flex items-center gap-1 text-xs font-medium text-slate-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>Usado</span>
        </span>
      )}
    </div>
  );

  return (
    <div className="space-y-6 pb-24 lg:pb-10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/15 flex items-center justify-center text-teal-600 dark:text-[#00D1C1]">
          <Ticket className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Mis cupones
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Descuentos aplicables a tus lotes avícolas, porcícolas o seguro de frío
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
          Cupones disponibles · {available.length}
        </h3>
        {available.length === 0 ? (
          <div className="rounded-2xl p-6 border border-dashed border-slate-300 dark:border-white/15 text-center text-sm text-slate-500 dark:text-slate-400">
            No tienes cupones disponibles por el momento
          </div>
        ) : (
          <div className="space-y-2.5">
            {available.map((c) => renderCouponCard(c, true))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
          Cupones usados · {used.length}
        </h3>
        {used.length === 0 ? (
          <div className="rounded-2xl p-6 border border-dashed border-slate-300 dark:border-white/15 text-center text-sm text-slate-500 dark:text-slate-400">
            Aún no has usado cupones
          </div>
        ) : (
          <div className="space-y-2.5">
            {used.map((c) => renderCouponCard(c, false))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
          Cupones expirados · {expired.length}
        </h3>
        <div className="rounded-2xl p-6 border border-dashed border-slate-300 dark:border-white/15 text-center text-sm text-slate-500 dark:text-slate-400">
          No tienes cupones expirados
        </div>
      </section>
    </div>
  );
};
