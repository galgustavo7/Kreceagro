import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Briefcase,
  Check,
  CheckCircle2,
  CreditCard,
  Eraser,
  Phone,
  QrCode,
  ShieldCheck,
  User,
} from 'lucide-react';
import { DOMAIN_IMAGES } from '../data/initialData';
import {
  BusinessType,
  Coupon,
  CreditCategory,
  CreditRecord,
  MerchantProfile,
  Supplier,
} from '../types/credit';

interface CreditRequestFormViewProps {
  merchant: MerchantProfile;
  suppliers: Supplier[];
  coupons: Coupon[];
  availableLine: number;
  presetCategory?: CreditCategory;
  presetSupplier?: Supplier;
  presetAmount?: number;
  presetWeeks?: number;
  onSubmitCredit: (newCredit: CreditRecord, usedCouponId?: string) => void;
  onDoneNavigate: () => void;
}

const SENIORITY_OPTIONS = [
  'Menos de 6 meses',
  '6 a 12 meses',
  '1 a 2 años',
  '2 a 5 años',
  'Más de 5 años',
];

const PURPOSE_OPTIONS = [
  {
    id: 'Compra de lote avícola (pollo beneficiado y huevos)',
    label: 'Lote Avícola (Pollo y Huevos)',
    category: CreditCategory.AVICOLA,
    img: DOMAIN_IMAGES.poultry,
  },
  {
    id: 'Compra de lote porcícola (pernil, costilla y chuleta)',
    label: 'Lote Porcícola (Cortes de Cerdo)',
    category: CreditCategory.PORCICOLA,
    img: DOMAIN_IMAGES.pork,
  },
  {
    id: 'Abastecimiento mixto avícola y porcícola de alta rotación',
    label: 'Combo Mixto Avícola + Porcícola',
    category: CreditCategory.MIXTO,
    img: DOMAIN_IMAGES.bodega,
  },
  {
    id: 'Adquisición o mejora de cadena de frío (cava / congelador)',
    label: 'Cadena de Frío y Equipamiento',
    category: CreditCategory.CAPITAL,
    img: DOMAIN_IMAGES.bodega,
  },
  {
    id: 'Capital de trabajo para reposición diaria en zona de demanda',
    label: 'Capital de Trabajo / Reposición',
    category: CreditCategory.MIXTO,
    img: DOMAIN_IMAGES.bodega,
  },
];

const COLLATERAL_OPTIONS = [
  'Inventario de mercancía en cava / nevera',
  'Equipos de refrigeración propios (congelador / vitrina)',
  'Pagaré comercial e historial de pagos KreceAgro',
  'Fiador solidario (comerciante aliado)',
  'Vehículo o moto de reparto propio',
];

export const CreditRequestFormView: React.FC<CreditRequestFormViewProps> = ({
  merchant,
  suppliers,
  coupons,
  availableLine,
  presetCategory,
  presetSupplier,
  presetAmount,
  presetWeeks,
  onSubmitCredit,
  onDoneNavigate,
}) => {
  // 1. Información personal del solicitante
  const [fullName, setFullName] = useState(merchant.fullName);
  const [dni, setDni] = useState(merchant.rifOrId);
  const [address, setAddress] = useState(merchant.address);

  // 2. Información del negocio
  const [businessName, setBusinessName] = useState(merchant.businessName);
  const [businessType, setBusinessType] = useState<BusinessType>(merchant.businessType);
  const [seniority, setSeniority] = useState(merchant.seniority);

  // 3. Detalles de la solicitud de crédito
  const [desiredAmount, setDesiredAmount] = useState<string>(
    String(presetAmount || 260)
  );
  const [purpose, setPurpose] = useState<string>(() => {
    const found = PURPOSE_OPTIONS.find((p) => p.category === presetCategory);
    return found ? found.id : PURPOSE_OPTIONS[0].id;
  });
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    presetSupplier?.id || suppliers[0]?.id || ''
  );
  const [weeks, setWeeks] = useState<number>(presetWeeks || 3);
  const [selectedCollateral, setSelectedCollateral] = useState<string[]>([
    COLLATERAL_OPTIONS[0],
    COLLATERAL_OPTIONS[2],
  ]);
  const [includeColdInsurance, setIncludeColdInsurance] = useState<boolean>(true);
  const [selectedCouponId, setSelectedCouponId] = useState<string>('');

  // 4. Datos de contacto
  const [phone, setPhone] = useState(merchant.phone);
  const [email, setEmail] = useState(merchant.email);
  const [referenceContact, setReferenceContact] = useState(
    'Carlos Ramírez · +58 412-7401829'
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedCredit, setSubmittedCredit] = useState<CreditRecord | null>(null);

  useEffect(() => {
    if (presetCategory) {
      const matched = PURPOSE_OPTIONS.find((p) => p.category === presetCategory);
      if (matched) setPurpose(matched.id);
    }
    if (presetSupplier) {
      setSelectedSupplierId(presetSupplier.id);
    }
    if (presetAmount) {
      setDesiredAmount(String(presetAmount));
    }
    if (presetWeeks) {
      setWeeks(presetWeeks);
    }
  }, [presetCategory, presetSupplier, presetAmount, presetWeeks]);

  const activePurposeObj =
    PURPOSE_OPTIONS.find((p) => p.id === purpose) || PURPOSE_OPTIONS[0];
  const currentCategory = activePurposeObj.category;

  const matchingSuppliers = suppliers.filter((s) => {
    if (currentCategory === CreditCategory.CAPITAL) return s.category === 'equipamiento';
    if (currentCategory === CreditCategory.PORCICOLA)
      return s.category === 'porcicola' || s.category === 'mixto';
    if (currentCategory === CreditCategory.AVICOLA)
      return s.category === 'avicola' || s.category === 'mixto';
    return s.category !== 'equipamiento';
  });

  const activeSupplier =
    matchingSuppliers.find((s) => s.id === selectedSupplierId) ||
    matchingSuppliers[0] ||
    suppliers[0];

  const numericAmount = Math.max(0, Number(desiredAmount) || 0);
  const availableCoupons = coupons.filter(
    (c) =>
      c.status === 'available' &&
      (c.categoryFilter === 'all' || c.categoryFilter === currentCategory)
  );
  const activeCoupon = availableCoupons.find((c) => c.id === selectedCouponId);
  const couponDiscount = activeCoupon ? activeCoupon.discountAmount : 0;

  const initialPaid = Math.max(0, Math.round(numericAmount * 0.15) - couponDiscount);
  const insuranceFee =
    includeColdInsurance && currentCategory !== CreditCategory.CAPITAL ? 6 : 0;
  const financedAmount = Math.max(0, numericAmount - Math.round(numericAmount * 0.15) + insuranceFee);
  const weeklyInstallment = weeks > 0 ? Math.ceil(financedAmount / weeks) : financedAmount;
  const isWithinAvailableLine = financedAmount <= availableLine;

  const toggleCollateral = (item: string) => {
    setSelectedCollateral((prev) =>
      prev.includes(item) ? prev.filter((c) => c !== item) : [...prev, item]
    );
  };

  const handleClearForm = () => {
    setFullName('');
    setDni('');
    setAddress('');
    setBusinessName('');
    setSeniority('');
    setDesiredAmount('');
    setSelectedCollateral([]);
    setPhone('');
    setEmail('');
    setReferenceContact('');
    setErrors({});
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 3) {
      nextErrors.fullName = 'Ingresa el nombre completo del solicitante.';
    }
    if (!dni.trim() || dni.trim().length < 5) {
      nextErrors.dni = 'Ingresa un DNI o cédula válida.';
    }
    if (!address.trim() || address.trim().length < 6) {
      nextErrors.address = 'Ingresa la dirección de domicilio o local.';
    }
    if (!businessName.trim()) {
      nextErrors.businessName = 'Ingresa el nombre de tu bodega, abasto o ruta.';
    }
    if (!seniority.trim()) {
      nextErrors.seniority = 'Selecciona la antigüedad del negocio.';
    }
    if (!numericAmount || numericAmount < 50) {
      nextErrors.desiredAmount = 'El monto mínimo de solicitud es $50.';
    }
    if (selectedCollateral.length === 0) {
      nextErrors.collateral = 'Selecciona al menos una garantía ofrecida.';
    }
    if (!phone.trim() || phone.trim().length < 7) {
      nextErrors.phone = 'Ingresa un teléfono de contacto válido.';
    }
    if (!email.trim() || !email.includes('@')) {
      nextErrors.email = 'Ingresa un correo electrónico válido.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const codeNum = Math.floor(1000 + Math.random() * 8999);
    const catPrefix =
      currentCategory === CreditCategory.AVICOLA
        ? 'AV'
        : currentCategory === CreditCategory.PORCICOLA
        ? 'PC'
        : currentCategory === CreditCategory.MIXTO
        ? 'MX'
        : 'EQ';

    const totalWithInstallments = weeklyInstallment * weeks;
    const ratePerKg = activeSupplier?.wholesaleRatePerKg || 2.5;
    const estWeightKg =
      currentCategory === CreditCategory.CAPITAL
        ? undefined
        : Math.round(numericAmount / ratePerKg);

    const installments = Array.from({ length: weeks }).map((_, idx) => {
      const daysAhead = (idx + 1) * 7;
      const due = new Date(Date.now() + daysAhead * 86400000);
      const formatted = due.toLocaleDateString('es-VE', {
        day: '2-digit',
        month: 'short',
      });
      return {
        id: `inst-form-${Date.now()}-${idx + 1}`,
        number: idx + 1,
        amount: weeklyInstallment,
        dueDate: due.toISOString().split('T')[0],
        dueLabel: `En ${daysAhead} días · ${formatted}`,
        paid: false,
      };
    });

    const newRecord: CreditRecord = {
      id: `cred-${Date.now()}`,
      contractCode: `KA-${catPrefix}-2026-${codeNum}`,
      title: `${activePurposeObj.label}${estWeightKg ? ` (${estWeightKg} kg est.)` : ''}`,
      subtitle: activeSupplier.name,
      category: currentCategory,
      supplierId: activeSupplier.id,
      supplierName: activeSupplier.name,
      zone: address,
      totalAmount: totalWithInstallments,
      initialPaid,
      paidAmount: 0,
      remainingAmount: totalWithInstallments,
      totalInstallments: weeks,
      paidInstallments: 0,
      nextDueDate: installments[0]?.dueLabel.split('· ')[1] || '7 días',
      status: 'active',
      approvalStatus: isWithinAvailableLine ? 'aprobado' : 'en_revision',
      coldChainInsured: includeColdInsurance,
      weightKg: estWeightKg,
      estimatedMarginPct: currentCategory === CreditCategory.CAPITAL ? undefined : 38,
      dispatchCode: `DESP-${activeSupplier.code}-${codeNum}`,
      createdAt: 'Hoy',
      installments,
      applicantDetails: {
        fullName: fullName.trim(),
        dni: dni.trim(),
        address: address.trim(),
        businessName: businessName.trim(),
        businessType,
        seniority,
        purpose,
        collateral: selectedCollateral,
        phone: phone.trim(),
        email: email.trim(),
        referenceContact: referenceContact.trim() || undefined,
      },
    };

    onSubmitCredit(newRecord, activeCoupon?.id);
    setSubmittedCredit(newRecord);
  };

  if (submittedCredit) {
    return (
      <div className="max-w-2xl mx-auto pb-24 lg:pb-10">
        <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.08] space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h2 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
              {submittedCredit.approvalStatus === 'aprobado'
                ? 'Solicitud aprobada al instante'
                : 'Solicitud registrada en evaluación prioritaria'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {submittedCredit.approvalStatus === 'aprobado'
                ? `Tu orden de despacho en ${submittedCredit.supplierName} está lista.`
                : 'El monto supera tu línea actual; evaluaremos la ampliación en menos de 2 horas.'}
            </p>
          </div>

          <div className="rounded-2xl p-5 bg-slate-50 dark:bg-[#161D1E] border border-slate-200 dark:border-white/[0.08] flex flex-col items-center gap-3">
            <div className="w-28 h-28 rounded-2xl bg-white p-3 border border-slate-200 flex items-center justify-center">
              <QrCode className="w-20 h-20 text-slate-900" strokeWidth={1.5} />
            </div>
            <p className="font-mono text-sm font-bold text-teal-600 dark:text-[#00D1C1]">
              {submittedCredit.dispatchCode} · {submittedCredit.contractCode}
            </p>
          </div>

          <div className="rounded-2xl p-4 bg-slate-50 dark:bg-[#161D1E] border border-slate-200 dark:border-white/[0.08] text-left text-xs space-y-2 text-slate-600 dark:text-slate-300">
            <p>
              <strong>Solicitante:</strong> {submittedCredit.applicantDetails?.fullName} (DNI:{' '}
              {submittedCredit.applicantDetails?.dni})
            </p>
            <p>
              <strong>Negocio:</strong> {submittedCredit.applicantDetails?.businessName} ·{' '}
              {submittedCredit.applicantDetails?.businessType} (Antigüedad:{' '}
              {submittedCredit.applicantDetails?.seniority})
            </p>
            <p>
              <strong>Propósito:</strong> {submittedCredit.applicantDetails?.purpose}
            </p>
            <p className="tabular-nums">
              <strong>Financiamiento:</strong> ${submittedCredit.totalAmount} en{' '}
              {submittedCredit.totalInstallments} cuotas semanales
            </p>
            <p>
              <strong>Garantías:</strong>{' '}
              {submittedCredit.applicantDetails?.collateral.join(', ')}
            </p>
            <p>
              <strong>Contacto:</strong> {submittedCredit.applicantDetails?.phone} ·{' '}
              {submittedCredit.applicantDetails?.email}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setSubmittedCredit(null)}
              className="flex-1 min-h-[48px] rounded-2xl border border-slate-200 dark:border-white/[0.12] text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              Nueva solicitud
            </button>
            <button
              type="button"
              onClick={onDoneNavigate}
              className="flex-1 min-h-[48px] rounded-2xl bg-teal-600 dark:bg-[#00D1C1] text-white dark:text-[#041413] text-sm font-bold cursor-pointer"
            >
              Ver mis créditos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6 pb-24 lg:pb-10">
      {/* Form Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            Formulario de Solicitud de Crédito
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Completa los 4 bloques para financiar tu lote avícola, porcícola o cadena de frío
          </p>
        </div>

        <button
          type="button"
          onClick={handleClearForm}
          className="min-h-[40px] px-3.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#121718] text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-teal-500/40 flex items-center gap-1.5 cursor-pointer"
        >
          <Eraser className="w-3.5 h-3.5" />
          <span>Limpiar campos</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 columns: 4 Structured Sections */}
        <div className="lg:col-span-8 space-y-5">
          {/* 01. Información personal del solicitante */}
          <section className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.08] space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-white/[0.06] pb-3">
              <User className="w-5 h-5 text-teal-600 dark:text-[#00D1C1]" />
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                01. Información personal del solicitante
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="req-fullname"
                  className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                >
                  Nombre completo *
                </label>
                <input
                  id="req-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors((p) => ({ ...p, fullName: '' }));
                  }}
                  placeholder="Ej. Gustavo Mendoza"
                  className="w-full min-h-[46px] px-4 rounded-xl bg-slate-50 dark:bg-[#161C1D] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.fullName}</span>
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="req-dni"
                  className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                >
                  DNI / Cédula de identidad *
                </label>
                <input
                  id="req-dni"
                  type="text"
                  value={dni}
                  onChange={(e) => {
                    setDni(e.target.value);
                    if (errors.dni) setErrors((p) => ({ ...p, dni: '' }));
                  }}
                  placeholder="Ej. 19.482.310"
                  className="w-full min-h-[46px] px-4 rounded-xl bg-slate-50 dark:bg-[#161C1D] border border-slate-200 dark:border-white/[0.1] font-mono text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {errors.dni && (
                  <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.dni}</span>
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="req-address"
                className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
              >
                Dirección completa (domicilio o punto de venta) *
              </label>
              <input
                id="req-address"
                type="text"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (errors.address) setErrors((p) => ({ ...p, address: '' }));
                }}
                placeholder="Av. / Calle / Sector / Ciudad"
                className="w-full min-h-[46px] px-4 rounded-xl bg-slate-50 dark:bg-[#161C1D] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {errors.address && (
                <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.address}</span>
                </p>
              )}
            </div>
          </section>

          {/* 02. Información del negocio */}
          <section className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.08] space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-white/[0.06] pb-3">
              <Briefcase className="w-5 h-5 text-teal-600 dark:text-[#00D1C1]" />
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                02. Información del negocio
              </h3>
            </div>

            <div>
              <label
                htmlFor="req-bizname"
                className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
              >
                Nombre del negocio *
              </label>
              <input
                id="req-bizname"
                type="text"
                value={businessName}
                onChange={(e) => {
                  setBusinessName(e.target.value);
                  if (errors.businessName)
                    setErrors((p) => ({ ...p, businessName: '' }));
                }}
                placeholder="Ej. Abasto y Bodega La Esquinita"
                className="w-full min-h-[46px] px-4 rounded-xl bg-slate-50 dark:bg-[#161C1D] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {errors.businessName && (
                <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.businessName}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="req-biztype"
                  className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                >
                  Tipo de negocio *
                </label>
                <select
                  id="req-biztype"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                  className="w-full min-h-[46px] px-4 rounded-xl bg-slate-50 dark:bg-[#161C1D] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {Object.values(BusinessType).map((bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="req-seniority"
                  className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                >
                  Antigüedad del negocio *
                </label>
                <select
                  id="req-seniority"
                  value={seniority}
                  onChange={(e) => {
                    setSeniority(e.target.value);
                    if (errors.seniority) setErrors((p) => ({ ...p, seniority: '' }));
                  }}
                  className="w-full min-h-[46px] px-4 rounded-xl bg-slate-50 dark:bg-[#161C1D] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Selecciona antigüedad...</option>
                  {SENIORITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {errors.seniority && (
                  <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.seniority}</span>
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* 03. Detalles de la solicitud de crédito */}
          <section className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.08] space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-white/[0.06] pb-3">
              <CreditCard className="w-5 h-5 text-teal-600 dark:text-[#00D1C1]" />
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                03. Detalles de la solicitud de crédito
              </h3>
            </div>

            {/* Monto deseado */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="req-amount"
                  className="text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Monto deseado (USD) *
                </label>
                <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  Línea disponible: ${availableLine}
                </span>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400">
                  $
                </span>
                <input
                  id="req-amount"
                  type="number"
                  min={50}
                  max={3500}
                  value={desiredAmount}
                  onChange={(e) => {
                    setDesiredAmount(e.target.value);
                    if (errors.desiredAmount)
                      setErrors((p) => ({ ...p, desiredAmount: '' }));
                  }}
                  placeholder="250"
                  className="w-full min-h-[48px] pl-9 pr-4 rounded-xl bg-slate-50 dark:bg-[#161C1D] border border-slate-200 dark:border-white/[0.1] font-mono text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 tabular-nums"
                />
              </div>

              <div className="mt-2.5 flex flex-wrap gap-2">
                {[150, 250, 350, 500].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setDesiredAmount(String(preset));
                      if (errors.desiredAmount)
                        setErrors((p) => ({ ...p, desiredAmount: '' }));
                    }}
                    className={`min-h-[36px] px-3.5 rounded-xl text-xs font-mono font-bold border transition-colors cursor-pointer tabular-nums ${
                      numericAmount === preset
                        ? 'bg-teal-600 dark:bg-[#00D1C1] text-white dark:text-[#041413] border-teal-600 dark:border-[#00D1C1]'
                        : 'bg-slate-50 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/[0.1]'
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
              {errors.desiredAmount && (
                <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.desiredAmount}</span>
                </p>
              )}
            </div>

            {/* Propósito del crédito */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                Propósito del crédito *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PURPOSE_OPTIONS.map((opt) => {
                  const selected = purpose === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPurpose(opt.id)}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-colors cursor-pointer ${
                        selected
                          ? 'border-teal-600 dark:border-[#00D1C1] bg-teal-50/70 dark:bg-teal-500/10'
                          : 'border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#161C1D]'
                      }`}
                    >
                      <img
                        src={opt.img}
                        alt={opt.label}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-xl object-cover shrink-0"
                      />
                      <span className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Proveedor y Plazo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="req-supplier"
                  className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                >
                  Matadero o proveedor destino
                </label>
                <select
                  id="req-supplier"
                  value={activeSupplier?.id || ''}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full min-h-[46px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#161C1D] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white"
                >
                  {matchingSuppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.zone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="req-weeks"
                  className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                >
                  Plan de pago semanal
                </label>
                <select
                  id="req-weeks"
                  value={weeks}
                  onChange={(e) => setWeeks(Number(e.target.value))}
                  className="w-full min-h-[46px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#161C1D] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white tabular-nums"
                >
                  <option value={1}>7 días · 1 cuota única</option>
                  <option value={2}>14 días · 2 cuotas semanales</option>
                  <option value={3}>21 días · 3 cuotas semanales</option>
                  <option value={4}>28 días · 4 cuotas semanales</option>
                  {currentCategory === CreditCategory.CAPITAL && (
                    <option value={8}>56 días · 8 cuotas semanales</option>
                  )}
                </select>
              </div>
            </div>

            {/* Garantías ofrecidas */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                Garantías ofrecidas *
              </label>
              <div className="space-y-2">
                {COLLATERAL_OPTIONS.map((item) => {
                  const checked = selectedCollateral.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        toggleCollateral(item);
                        if (errors.collateral)
                          setErrors((p) => ({ ...p, collateral: '' }));
                      }}
                      className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border flex items-center justify-between gap-3 text-left text-xs font-medium transition-colors cursor-pointer ${
                        checked
                          ? 'border-teal-600 dark:border-[#00D1C1] bg-teal-50/60 dark:bg-teal-500/10 text-slate-900 dark:text-white'
                          : 'border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#161C1D] text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <span>{item}</span>
                      <span
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                          checked
                            ? 'bg-teal-600 dark:bg-[#00D1C1] border-teal-600 dark:border-[#00D1C1] text-white dark:text-[#041413]'
                            : 'border-slate-300 dark:border-white/25'
                        }`}
                      >
                        {checked && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                      </span>
                    </button>
                  );
                })}
              </div>
              {errors.collateral && (
                <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.collateral}</span>
                </p>
              )}
            </div>
          </section>

          {/* 04. Datos de contacto */}
          <section className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.08] space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-white/[0.06] pb-3">
              <Phone className="w-5 h-5 text-teal-600 dark:text-[#00D1C1]" />
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                04. Datos de contacto
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="req-phone"
                  className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                >
                  Teléfono móvil / WhatsApp *
                </label>
                <input
                  id="req-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors((p) => ({ ...p, phone: '' }));
                  }}
                  placeholder="+58 414-5829104"
                  className="w-full min-h-[46px] px-4 rounded-xl bg-slate-50 dark:bg-[#161C1D] border border-slate-200 dark:border-white/[0.1] font-mono text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="req-email"
                  className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                >
                  Correo electrónico *
                </label>
                <input
                  id="req-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((p) => ({ ...p, email: '' }));
                  }}
                  placeholder="comercio@correo.com"
                  className="w-full min-h-[46px] px-4 rounded-xl bg-slate-50 dark:bg-[#161C1D] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="req-reference"
                className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
              >
                Referencia comercial o proveedor conocido (opcional)
              </label>
              <input
                id="req-reference"
                type="text"
                value={referenceContact}
                onChange={(e) => setReferenceContact(e.target.value)}
                placeholder="Nombre y teléfono de contacto de respaldo"
                className="w-full min-h-[46px] px-4 rounded-xl bg-slate-50 dark:bg-[#161C1D] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </section>
        </div>

        {/* Right 4 columns: Live Summary & Submit CTA */}
        <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-4">
          <div className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.08] space-y-4">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Resumen de tu solicitud
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Monto deseado</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  ${numericAmount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Inicial estimada (15%)</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                  ${initialPaid}
                </span>
              </div>
              {currentCategory !== CreditCategory.CAPITAL && (
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setIncludeColdInsurance((p) => !p)}
                    className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Seguro Cadena Frío (+$6)</span>
                  </button>
                  <input
                    type="checkbox"
                    checked={includeColdInsurance}
                    onChange={(e) => setIncludeColdInsurance(e.target.checked)}
                    aria-label="Incluir seguro cadena de frío"
                    className="accent-teal-500 w-4 h-4 cursor-pointer"
                  />
                </div>
              )}

              {availableCoupons.length > 0 && (
                <div className="pt-1">
                  <select
                    value={selectedCouponId}
                    onChange={(e) => setSelectedCouponId(e.target.value)}
                    aria-label="Seleccionar cupón"
                    className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 dark:bg-[#161C1D] border border-slate-200 dark:border-white/[0.1] text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="">Aplicar cupón (opcional)</option>
                    {availableCoupons.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} (-${c.discountAmount})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-between pt-2.5 border-t border-slate-100 dark:border-white/[0.06]">
                <span className="text-slate-500 dark:text-slate-400">Saldo a financiar</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  ${financedAmount}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Cuota semanal ({weeks}x)
                </span>
                <span className="font-mono text-base font-extrabold text-teal-600 dark:text-[#00D1C1] tabular-nums">
                  ${weeklyInstallment}/sem
                </span>
              </div>
            </div>

            <div
              className={`rounded-2xl p-3 text-xs font-medium leading-relaxed ${
                isWithinAvailableLine
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20'
                  : 'bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20'
              }`}
            >
              {isWithinAvailableLine
                ? `Dentro de tu línea disponible ($${availableLine}). Aprobación inmediata con orden QR.`
                : `Supera tu línea disponible ($${availableLine}). Se enviará como solicitud de ampliación prioritaria.`}
            </div>

            <button
              type="submit"
              className="w-full min-h-[50px] rounded-2xl bg-teal-600 hover:bg-teal-500 dark:bg-[#00D1C1] dark:hover:bg-[#1EE0D0] text-white dark:text-[#041413] font-bold text-sm transition-colors cursor-pointer shadow-sm"
            >
              Enviar solicitud de crédito
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
