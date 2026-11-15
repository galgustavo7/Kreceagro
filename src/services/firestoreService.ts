import { User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { INITIAL_COUPONS } from '../data/initialData';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  BusinessType,
  ColdChainType,
  Coupon,
  CreditRecord,
  MerchantProfile,
} from '../types/credit';

export interface RegistrationExtras {
  fullName?: string;
  dni?: string;
  address?: string;
  businessName?: string;
  businessType?: BusinessType;
  seniority?: string;
  phone?: string;
  zone?: string;
}

function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'KA';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export async function ensureMerchantBootstrap(
  user: User,
  extras?: RegistrationExtras
): Promise<void> {
  const userPath = `users/${user.uid}`;
  const privatePath = `users/${user.uid}/private/info`;

  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      return;
    }

    const fullName = (
      extras?.fullName ||
      user.displayName ||
      user.email?.split('@')[0] ||
      'Emprendedor'
    ).slice(0, 120);

    const firstName = (fullName.split(' ')[0] || 'Emprendedor').slice(0, 80);
    const initials = deriveInitials(fullName);
    const businessName = (
      extras?.businessName || `Comercio ${firstName}`
    ).slice(0, 120);
    const businessType = extras?.businessType || BusinessType.BODEGA;
    const zone = (extras?.zone || 'Cuatricentenaria · Barinas').slice(0, 120);
    const referralCode = user.uid.slice(0, 8).toLowerCase();

    const batch = writeBatch(db);

    batch.set(userRef, {
      uid: user.uid,
      firstName,
      initials,
      businessName,
      businessType,
      zone,
      coldChain: ColdChainType.CONGELADOR,
      points: 150,
      tierName: 'Plata',
      creditLimit: 550,
      referralCode,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const privateRef = doc(db, 'users', user.uid, 'private', 'info');
    batch.set(privateRef, {
      uid: user.uid,
      fullName,
      dni: (extras?.dni || 'Por completar').slice(0, 32),
      address: (extras?.address || zone).slice(0, 220),
      seniority: (extras?.seniority || '1 a 2 años').slice(0, 60),
      phone: (extras?.phone || '+58 414-0000000').slice(0, 32),
      email: (user.email || 'sin-correo@kreceagro.app').slice(0, 140),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Provision starter coupons for the new merchant
    for (const coupon of INITIAL_COUPONS.filter((c) => c.status === 'available')) {
      const couponRef = doc(db, 'users', user.uid, 'coupons', coupon.id);
      batch.set(couponRef, {
        id: coupon.id,
        ownerId: user.uid,
        title: coupon.title,
        description: coupon.description,
        discountAmount: coupon.discountAmount,
        categoryFilter: coupon.categoryFilter,
        expiresAt: coupon.expiresAt,
        status: 'available',
        code: coupon.code,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${userPath} / ${privatePath}`);
  }
}

export function subscribeMerchantData(
  userId: string,
  onProfile: (profile: Partial<MerchantProfile>) => void,
  onCredits: (credits: CreditRecord[]) => void,
  onCoupons: (coupons: Coupon[]) => void
): () => void {
  const userPath = `users/${userId}`;
  const privatePath = `users/${userId}/private/info`;
  const creditsPath = `users/${userId}/credits`;
  const couponsPath = `users/${userId}/coupons`;

  const unsubUser = onSnapshot(
    doc(db, 'users', userId),
    (snapshot) => {
      if (snapshot.exists()) {
        const d = snapshot.data();
        onProfile({
          firstName: d.firstName,
          initials: d.initials,
          businessName: d.businessName,
          businessType: d.businessType as BusinessType,
          zone: d.zone,
          coldChain: d.coldChain as ColdChainType,
          points: d.points,
          tierName: d.tierName,
          creditLimit: d.creditLimit,
          referralCode: d.referralCode,
        });
      }
    },
    (err) => handleFirestoreError(err, OperationType.GET, userPath)
  );

  const unsubPrivate = onSnapshot(
    doc(db, 'users', userId, 'private', 'info'),
    (snapshot) => {
      if (snapshot.exists()) {
        const d = snapshot.data();
        onProfile({
          fullName: d.fullName,
          rifOrId: d.dni,
          address: d.address,
          seniority: d.seniority,
          phone: d.phone,
          email: d.email,
        });
      }
    },
    (err) => handleFirestoreError(err, OperationType.GET, privatePath)
  );

  const creditsQuery = query(
    collection(db, 'users', userId, 'credits'),
    where('ownerId', '==', userId)
  );
  const unsubCredits = onSnapshot(
    creditsQuery,
    (snapshot) => {
      const list: CreditRecord[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: d.id,
          contractCode: d.contractCode,
          title: d.title,
          subtitle: d.subtitle,
          category: d.category,
          supplierId: d.supplierId,
          supplierName: d.supplierName,
          zone: d.zone,
          totalAmount: d.totalAmount,
          initialPaid: d.initialPaid,
          paidAmount: d.paidAmount,
          remainingAmount: d.remainingAmount,
          totalInstallments: d.totalInstallments,
          paidInstallments: d.paidInstallments,
          nextDueDate: d.nextDueDate,
          status: d.status,
          approvalStatus: d.approvalStatus,
          coldChainInsured: d.coldChainInsured,
          weightKg: d.weightKg,
          estimatedMarginPct: d.estimatedMarginPct,
          dispatchCode: d.dispatchCode,
          createdAt: d.createdAtLabel || 'Hoy',
          installments: d.installments || [],
          applicantDetails: d.applicantDetails,
        };
      });
      onCredits(list);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, creditsPath)
  );

  const couponsQuery = query(
    collection(db, 'users', userId, 'coupons'),
    where('ownerId', '==', userId)
  );
  const unsubCoupons = onSnapshot(
    couponsQuery,
    (snapshot) => {
      const list: Coupon[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: d.id,
          title: d.title,
          description: d.description,
          discountAmount: d.discountAmount,
          categoryFilter: d.categoryFilter,
          expiresAt: d.expiresAt,
          status: d.status,
          code: d.code,
        };
      });
      onCoupons(list);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, couponsPath)
  );

  return () => {
    unsubUser();
    unsubPrivate();
    unsubCredits();
    unsubCoupons();
  };
}

export async function createCreditInFirestore(
  userId: string,
  credit: CreditRecord,
  newPoints: number,
  newTierName: string,
  usedCouponId?: string
): Promise<void> {
  const creditPath = `users/${userId}/credits/${credit.id}`;
  try {
    const batch = writeBatch(db);
    const creditRef = doc(db, 'users', userId, 'credits', credit.id);

    const payload: Record<string, unknown> = {
      id: credit.id,
      ownerId: userId,
      contractCode: credit.contractCode.slice(0, 40),
      title: credit.title.slice(0, 160),
      subtitle: credit.subtitle.slice(0, 160),
      category: credit.category,
      supplierId: credit.supplierId.slice(0, 64),
      supplierName: credit.supplierName.slice(0, 140),
      zone: credit.zone.slice(0, 220),
      totalAmount: credit.totalAmount,
      initialPaid: credit.initialPaid,
      paidAmount: credit.paidAmount,
      remainingAmount: credit.remainingAmount,
      totalInstallments: credit.totalInstallments,
      paidInstallments: credit.paidInstallments,
      nextDueDate: credit.nextDueDate.slice(0, 40),
      status: credit.status,
      coldChainInsured: credit.coldChainInsured,
      dispatchCode: credit.dispatchCode.slice(0, 40),
      createdAtLabel: credit.createdAt.slice(0, 40),
      installments: credit.installments.slice(0, 12),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (credit.approvalStatus) payload.approvalStatus = credit.approvalStatus;
    if (typeof credit.weightKg === 'number') payload.weightKg = credit.weightKg;
    if (typeof credit.estimatedMarginPct === 'number')
      payload.estimatedMarginPct = credit.estimatedMarginPct;
    if (credit.applicantDetails) payload.applicantDetails = credit.applicantDetails;

    batch.set(creditRef, payload);

    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
      points: newPoints,
      tierName: newTierName,
      updatedAt: serverTimestamp(),
    });

    if (usedCouponId) {
      const couponRef = doc(db, 'users', userId, 'coupons', usedCouponId);
      batch.update(couponRef, {
        status: 'used',
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, creditPath);
  }
}

export async function updateCreditInFirestore(
  userId: string,
  credit: CreditRecord,
  newPoints?: number,
  newTierName?: string
): Promise<void> {
  const creditPath = `users/${userId}/credits/${credit.id}`;
  try {
    const batch = writeBatch(db);
    const creditRef = doc(db, 'users', userId, 'credits', credit.id);

    batch.update(creditRef, {
      installments: credit.installments.slice(0, 12),
      paidInstallments: credit.paidInstallments,
      paidAmount: credit.paidAmount,
      remainingAmount: credit.remainingAmount,
      nextDueDate: credit.nextDueDate.slice(0, 40),
      status: credit.status,
      coldChainInsured: credit.coldChainInsured,
      updatedAt: serverTimestamp(),
    });

    if (typeof newPoints === 'number' && newTierName) {
      const userRef = doc(db, 'users', userId);
      batch.update(userRef, {
        points: newPoints,
        tierName: newTierName,
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, creditPath);
  }
}

export async function updateMerchantProfileInFirestore(
  userId: string,
  merchant: MerchantProfile
): Promise<void> {
  const userPath = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      businessName: merchant.businessName.slice(0, 120),
      businessType: merchant.businessType,
      zone: merchant.zone.slice(0, 120),
      coldChain: merchant.coldChain,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, userPath);
  }
}
