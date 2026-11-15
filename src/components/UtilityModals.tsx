import React, { useState } from 'react';
import {
  Check,
  Copy,
  FileText,
  HelpCircle,
  QrCode,
  ShieldCheck,
  Snowflake,
  Users,
  X,
} from 'lucide-react';
import { CreditRecord, MerchantProfile } from '../types/credit';

export const ContractModal: React.FC<{
  credit: CreditRecord | null;
  merchant: MerchantProfile;
  onClose: () => void;
}> = ({ credit, merchant, onClose }) => {
  if (!credit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#0E1314] border border-slate-200 dark:border-white/[0.1] p-6 space-y-4 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-teal-600 dark:text-[#00D1C1]" />
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Contrato {credit.contractCode}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar contrato"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="rounded-2xl p-4 bg-slate-50 dark:bg-[#141A1C] border border-slate-200 dark:border-white/[0.08] space-y-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            <strong>Titular comercial:</strong>{' '}
            {credit.applicantDetails?.fullName || merchant.fullName} (DNI:{' '}
            {credit.applicantDetails?.dni || merchant.rifOrId}) ·{' '}
            {credit.applicantDetails?.businessName || merchant.businessName} (
            {credit.applicantDetails?.businessType || merchant.businessType})
          </p>
          {credit.applicantDetails?.seniority && (
            <p>
              <strong>Antigüedad y domicilio:</strong> {credit.applicantDetails.seniority} ·{' '}
              {credit.applicantDetails.address}
            </p>
          )}
          <p>
            <strong>Proveedor autorizado:</strong> {credit.supplierName} ({credit.zone})
          </p>
          <p>
            <strong>Objeto / Propósito:</strong>{' '}
            {credit.applicantDetails?.purpose || credit.title}
          </p>
          <p className="tabular-nums">
            <strong>Condiciones:</strong> Inicial pagada ${credit.initialPaid} · Saldo
            financiado ${credit.totalAmount} en {credit.totalInstallments} cuotas semanales.
          </p>
          {credit.applicantDetails?.collateral && credit.applicantDetails.collateral.length > 0 && (
            <p>
              <strong>Garantías ofrecidas:</strong>{' '}
              {credit.applicantDetails.collateral.join(', ')}
            </p>
          )}
          {credit.applicantDetails?.phone && (
            <p>
              <strong>Contacto registrado:</strong> {credit.applicantDetails.phone} ·{' '}
              {credit.applicantDetails.email}
            </p>
          )}
          <p>
            <strong>Compromiso de cadena de frío:</strong> El comercio declara contar con{' '}
            {merchant.coldChain} para preservar la inocuidad avícola y porcícola.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[46px] rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm cursor-pointer"
        >
          Cerrar documento
        </button>
      </div>
    </div>
  );
};

export const DispatchQrModal: React.FC<{
  credit: CreditRecord | null;
  onClose: () => void;
}> = ({ credit, onClose }) => {
  if (!credit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#0E1314] border border-slate-200 dark:border-white/[0.1] p-6 text-center space-y-4 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Orden de despacho
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar código QR"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-44 h-44 mx-auto rounded-2xl bg-white p-4 border border-slate-200 flex items-center justify-center">
          <QrCode className="w-36 h-36 text-slate-950" strokeWidth={1.5} />
        </div>

        <div>
          <p className="font-mono text-base font-bold text-teal-600 dark:text-[#00D1C1]">
            {credit.dispatchCode}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {credit.supplierName} · {credit.title}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[46px] rounded-2xl bg-teal-600 dark:bg-[#00D1C1] text-white dark:text-[#041413] font-bold text-sm cursor-pointer"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export const ReferralModal: React.FC<{
  isOpen: boolean;
  referralCode: string;
  onClose: () => void;
}> = ({ isOpen, referralCode, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareText = `Te invito a KreceAgro para financiar tus lotes de pollo y cerdo al mayor. Regístrate con mi código *${referralCode}* y gana un cupón de $15 en tu primera reposición.`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#0E1314] border border-slate-200 dark:border-white/[0.1] p-6 space-y-4 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-teal-600 dark:text-[#00D1C1]" />
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Refiere y gana $15
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Comparte tu código con otros bodegueros, charcuterías o revendedores de tu zona.
          Ambos reciben un cupón de $15 cuando retiren su primer lote.
        </p>

        <div className="rounded-2xl p-4 bg-slate-50 dark:bg-[#141A1C] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
          {shareText}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="w-full min-h-[48px] rounded-2xl bg-teal-600 dark:bg-[#00D1C1] text-white dark:text-[#041413] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Mensaje copiado' : 'Copiar invitación y código'}</span>
        </button>
      </div>
    </div>
  );
};

export const HelpModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const faqs = [
    {
      q: '¿Cómo retiro el pollo o cerdo en el matadero?',
      a: 'Al aprobarse tu solicitud se genera un código QR de despacho. Preséntalo en taquilla del proveedor aliado junto con tu inicial del 15%.',
    },
    {
      q: '¿Qué cubre el Seguro de Cadena de Frío?',
      a: 'Si ocurre un corte eléctrico mayor a 6 horas en tu zona que comprometa la mercancía refrigerada, congelamos tu cuota semanal sin recargos y cubrimos hasta el 60% del lote.',
    },
    {
      q: '¿Cómo subo mi línea de crédito hasta $3,500?',
      a: 'Pagando tus cuotas semanales antes de la fecha de vencimiento acumulas puntos KreceAgro y desbloqueas niveles Plata, Oro y Platino.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#0E1314] border border-slate-200 dark:border-white/[0.1] p-6 space-y-4 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-teal-600 dark:text-[#00D1C1]" />
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Centro de Ayuda
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ayuda"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div
              key={i}
              className="rounded-2xl p-4 bg-slate-50 dark:bg-[#141A1C] border border-slate-200 dark:border-white/[0.08]"
            >
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{f.q}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {f.a}
              </p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[46px] rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm cursor-pointer"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};

export const TutorialModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState(0);
  if (!isOpen) return null;

  const slides = [
    {
      title: '1. Tu línea avícola y porcícola siempre lista',
      desc: 'Usa tu cupo rotativo para abastecer pollo beneficiado, cortes de cerdo o equipar tu cava sin descapitalizar tu bodega.',
    },
    {
      title: '2. Retira directo en mataderos aliados',
      desc: 'Selecciona el proveedor más cercano en tu zona de alta demanda y genera tu orden de despacho QR en segundos.',
    },
    {
      title: '3. Paga cuotas semanales con tu venta diaria',
      desc: 'Vende al detal con márgenes del 35% al 45% y liquida tus cuotas por Pago Móvil o con el botón Seleccionar.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#0E1314] border border-slate-200 dark:border-white/[0.1] p-6 space-y-5 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-teal-600 dark:text-[#00D1C1]">
            Tutorial rápido · {step + 1} / {slides.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar tutorial"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-2 space-y-2">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            {slides[step].title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {slides[step].desc}
          </p>
        </div>

        <div className="flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 min-h-[46px] rounded-2xl border border-slate-200 dark:border-white/[0.12] text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              Anterior
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              step < slides.length - 1 ? setStep((s) => s + 1) : onClose()
            }
            className="flex-1 min-h-[46px] rounded-2xl bg-teal-600 dark:bg-[#00D1C1] text-white dark:text-[#041413] text-sm font-bold cursor-pointer"
          >
            {step < slides.length - 1 ? 'Siguiente' : '¡Comenzar!'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ColdChainModal: React.FC<{
  isOpen: boolean;
  merchant: MerchantProfile;
  onClose: () => void;
}> = ({ isOpen, merchant, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#0E1314] border border-slate-200 dark:border-white/[0.1] p-6 space-y-4 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Snowflake className="w-5 h-5 text-teal-600 dark:text-[#00D1C1]" />
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Protección Cadena de Frío
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="rounded-2xl p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900 dark:text-emerald-200 space-y-1 leading-relaxed">
            <p className="font-bold">Cobertura activa para {merchant.businessName}</p>
            <p>Equipo registrado: {merchant.coldChain}</p>
            <p>
              Tus lotes avícolas y porcícolas cuentan con respaldo ante contingencias
              eléctricas y prioridad de despacho refrigerado.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[46px] rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm cursor-pointer"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};
