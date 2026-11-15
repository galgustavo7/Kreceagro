import React, { useState } from 'react';
import { CheckCircle2, Landmark, Smartphone, Store, X } from 'lucide-react';
import { CreditRecord, Installment } from '../types/credit';

interface PaymentModalProps {
  items: Array<{ credit: CreditRecord; installment: Installment }>;
  onClose: () => void;
  onConfirmPayment: (
    paidItems: Array<{ creditId: string; installmentId: string; amount: number }>
  ) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  items,
  onClose,
  onConfirmPayment,
}) => {
  const [method, setMethod] = useState<'pago_movil' | 'transferencia' | 'punto'>(
    'pago_movil'
  );
  const [reference, setReference] = useState('482910');
  const [done, setDone] = useState(false);

  if (items.length === 0) return null;

  const totalToPay = items.reduce((acc, i) => acc + i.installment.amount, 0);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmPayment(
      items.map((item) => ({
        creditId: item.credit.id,
        installmentId: item.installment.id,
        amount: item.installment.amount,
      }))
    );
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pago de cuotas"
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#0E1314] border border-slate-200 dark:border-white/[0.1] p-6 space-y-5 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {done ? 'Pago registrado' : 'Pagar cuotas'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar pago"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="py-4 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <p className="font-display text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                ${totalToPay} acreditados
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
                Tu línea disponible ha sido liberada y sumaste +{items.length * 18} puntos.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-[48px] rounded-2xl bg-teal-600 dark:bg-[#00D1C1] text-white dark:text-[#041413] font-bold text-sm cursor-pointer"
            >
              Listo
            </button>
          </div>
        ) : (
          <form onSubmit={handlePay} className="space-y-4">
            <div className="rounded-2xl p-3.5 bg-slate-50 dark:bg-[#141A1C] border border-slate-200 dark:border-white/[0.08] space-y-2 max-h-40 overflow-y-auto">
              {items.map(({ credit, installment }) => (
                <div
                  key={`${credit.id}-${installment.id}`}
                  className="flex items-center justify-between text-xs gap-2"
                >
                  <span className="text-slate-700 dark:text-slate-200 truncate">
                    {credit.title} (Cuota {installment.number})
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums shrink-0">
                    ${installment.amount}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between text-sm font-bold">
                <span className="text-slate-900 dark:text-white">Total a pagar</span>
                <span className="font-mono text-teal-600 dark:text-[#00D1C1] tabular-nums">
                  ${totalToPay}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'pago_movil', label: 'Pago Móvil', icon: <Smartphone className="w-4 h-4" /> },
                { id: 'transferencia', label: 'Banco', icon: <Landmark className="w-4 h-4" /> },
                { id: 'punto', label: 'Matadero', icon: <Store className="w-4 h-4" /> },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id as 'pago_movil' | 'transferencia' | 'punto')}
                  className={`min-h-[56px] p-2 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-semibold cursor-pointer ${
                    method === m.id
                      ? 'border-teal-600 dark:border-[#00D1C1] bg-teal-50 dark:bg-teal-500/12 text-teal-700 dark:text-[#00D1C1]'
                      : 'border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {m.icon}
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            {method === 'pago_movil' && (
              <div className="rounded-xl p-3 bg-slate-50 dark:bg-white/[0.03] text-xs text-slate-600 dark:text-slate-300 space-y-1 tabular-nums">
                <p>Banco: Mercantil (0105) · Teléfono: 0414-5550192 · RIF: J-501829310</p>
              </div>
            )}

            <div>
              <label
                htmlFor="payment-ref"
                className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1"
              >
                Últimos 6 dígitos de referencia
              </label>
              <input
                id="payment-ref"
                type="text"
                required
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#141A1C] border border-slate-200 dark:border-white/[0.1] font-mono text-sm text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] rounded-2xl bg-teal-600 hover:bg-teal-500 dark:bg-[#00D1C1] dark:hover:bg-[#1EE2D2] text-white dark:text-[#041413] font-bold text-sm cursor-pointer tabular-nums"
            >
              Confirmar pago de ${totalToPay}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
