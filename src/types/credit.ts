export enum CreditCategory {
  AVICOLA = 'avicola',
  PORCICOLA = 'porcicola',
  MIXTO = 'mixto',
  CAPITAL = 'capital',
}

export enum BusinessType {
  BODEGA = 'Bodega de Barrio',
  ABASTO = 'Abasto / Charcutería',
  REVENDEDOR = 'Revendedor / Ruta',
  FRIGORIFICO = 'Mini Frigorífico',
}

export enum ColdChainType {
  CAVA_CUARTO = 'Cava cuarto propia',
  CONGELADOR = 'Congelador horizontal / vitrina',
  VENTA_DIARIA = 'Venta diaria con hielo / rotación 24h',
}

export type AppView =
  | 'inicio'
  | 'solicitar'
  | 'creditos'
  | 'proveedores'
  | 'niveles'
  | 'simulador'
  | 'cupones';

export interface Installment {
  id: string;
  number: number;
  amount: number;
  dueDate: string;
  dueLabel: string;
  paid: boolean;
  paidDate?: string;
}

export interface CreditRecord {
  id: string;
  contractCode: string;
  title: string;
  subtitle: string;
  category: CreditCategory;
  supplierId: string;
  supplierName: string;
  zone: string;
  totalAmount: number;
  initialPaid: number;
  paidAmount: number;
  remainingAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  nextDueDate: string;
  status: 'active' | 'completed';
  approvalStatus?: 'aprobado' | 'en_revision';
  coldChainInsured: boolean;
  weightKg?: number;
  estimatedMarginPct?: number;
  dispatchCode: string;
  createdAt: string;
  installments: Installment[];
  applicantDetails?: {
    fullName: string;
    dni: string;
    address: string;
    businessName: string;
    businessType: string;
    seniority: string;
    purpose: string;
    collateral: string[];
    phone: string;
    email: string;
    referenceContact?: string;
  };
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  handle: string;
  category: 'avicola' | 'porcicola' | 'mixto' | 'equipamiento';
  zone: string;
  city: string;
  distanceKm: number;
  isOpen: boolean;
  hours: string;
  phone: string;
  priceHighlight: string;
  wholesaleRatePerKg: number;
  suggestedRetailPerKg: number;
  demandLevel: 'Muy Alta' | 'Alta' | 'Media';
  mapX: number;
  mapY: number;
  products: string[];
}

export interface LevelTier {
  id: string;
  name: string;
  minPoints: number;
  minLine: number;
  maxLotLimit: number;
  maxInstallmentsLot: number;
  maxInstallmentsLine: number;
  benefits: string[];
  accentGradient: string;
}

export interface Coupon {
  id: string;
  title: string;
  description: string;
  discountAmount: number;
  categoryFilter: CreditCategory | 'all';
  expiresAt: string;
  status: 'available' | 'used' | 'expired';
  code: string;
}

export interface MerchantProfile {
  firstName: string;
  fullName: string;
  initials: string;
  businessName: string;
  businessType: BusinessType;
  rifOrId: string;
  address: string;
  seniority: string;
  phone: string;
  email: string;
  zone: string;
  coldChain: ColdChainType;
  points: number;
  tierName: string;
  creditLimit: number;
  referralCode: string;
}
