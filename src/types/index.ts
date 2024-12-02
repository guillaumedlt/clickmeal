import { Timestamp } from 'firebase/firestore';

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  maxUses?: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  active: boolean;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categories: string[];
  available: boolean;
  type: ProductType;
  availableInFormula: boolean;
  isNew: boolean;
  isFeatured: boolean;
  featuredOrder?: number;
  createdAt: Date;
  order: number;
}

export type ProductType = 'starter' | 'main' | 'dessert';

export interface Category {
  id: string;
  name: string;
  emoji: string;
  order: number;
}

export interface Formula {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  type: 'starter_main' | 'main_dessert' | 'complete';
  available: boolean;
  createdAt: Date;
  order: number;
  starterIds?: string[];
  mainIds?: string[];
  dessertIds?: string[];
}

export interface OrderProduct {
  id: string;
  name: string;
  quantity: number;
  price: number;
  isFormula?: boolean;
  formulaDetails?: {
    starterId?: string;
    mainId?: string;
    dessertId?: string;
  };
}

export interface Order {
  id: string;
  userId: string;
  companyId: string;
  products: OrderProduct[];
  total: number;
  deliveryDate: Timestamp;
  status: 'pending' | 'confirmed' | 'delivered';
  createdAt: Timestamp;
  company?: {
    name: string;
    address: string;
  };
  user?: {
    email: string;
  };
}