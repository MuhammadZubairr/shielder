// ─── Shared types for the Admin Products module ──────────────────────────────

export type StockStatusType = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface ProductTranslation {
  locale: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  /** Convenience field: name for the current UI locale (set by backend) */
  name?: string;
  /** Bilingual fields – only present when product is fetched individually via getById */
  nameEn?: string;
  nameAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  /** All translations (present when fetched via getById without locale filter) */
  translations?: ProductTranslation[];
  price: number;
  stock: number;
  minimumStockThreshold: number;
  isActive: boolean;
  status?: string;
  createdAt: string;
  updatedAt: string;
  categoryId: string;
  subcategoryId: string;
  mainImage?: string | null;
  sku?: string;
  filterNumber?: string;
  alternateNumbers?: string;
  filterType?: string;
  material?: string;
  dimensions?: string;
  category: {
    id: string;
    nameEn?: string;
    nameAr?: string;
    translations?: { locale: string; name: string }[];
  };
  subcategory: {
    id: string;
    nameEn?: string;
    nameAr?: string;
    translations?: { locale: string; name: string }[];
  };
}

export interface ProductSummary {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

export interface ProductFormData {
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  sku: string;
  price: string;
  stock: string;
  minimumStockThreshold: string;
  categoryId: string;
  subcategoryId: string;
  isActive: boolean;
  filterNumber: string;
  alternateNumbers: string;
  filterType: string;
  material: string;
  dimensions: string;
}

export const EMPTY_PRODUCT_FORM: ProductFormData = {
  nameEn: '',
  nameAr: '',
  descriptionEn: '',
  descriptionAr: '',
  sku: '',
  price: '',
  stock: '',
  minimumStockThreshold: '10',
  categoryId: '',
  subcategoryId: '',
  isActive: true,
  filterNumber: '',
  alternateNumbers: '',
  filterType: '',
  material: '',
  dimensions: '',
};

/** Compute derived stock status from stock + threshold */
export function getStockStatus(stock: number, threshold: number): StockStatusType {
  if (stock <= 0) return 'OUT_OF_STOCK';
  if (stock <= threshold) return 'LOW_STOCK';
  return 'IN_STOCK';
}

/** Light shape returned by category/subcategory dropdowns */
export interface DropdownOption {
  id: string;
  nameEn: string;
  nameAr: string;
  name?: string;
}
