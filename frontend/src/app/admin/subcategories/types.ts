// ─── Shared types for the Admin Subcategories module ─────────────────────────

export interface Subcategory {
  id: string;
  image: string | null;
  isActive: boolean;
  createdAt: string;
  categoryId: string;
  /** Locale-resolved display name (set by backend) */
  name: string;
  description: string;
  /** Bilingual fields — always returned by admin endpoints */
  nameEn: string;
  descriptionEn: string;
  nameAr: string;
  descriptionAr: string;
  /** Locale-resolved parent category name (flattened by backend) */
  categoryName: string;
  category: {
    id: string;
    nameEn?: string;
    nameAr?: string;
    translations: { locale: string; name: string }[];
  };
  _count: {
    products: number;
  };
}

export interface SubcategorySummary {
  totalSubcategories: number;
  activeSubcategories: number;
  disabledSubcategories: number;
}

export interface SubcategoryFormData {
  categoryId: string;
  nameEn: string;
  descriptionEn: string;
  nameAr: string;
  descriptionAr: string;
  isActive: boolean;
}

export const EMPTY_FORM: SubcategoryFormData = {
  categoryId: '',
  nameEn: '',
  descriptionEn: '',
  nameAr: '',
  descriptionAr: '',
  isActive: true,
};

/** Light shape returned by GET /inventory/categories for the dropdown. */
export interface CategoryOption {
  id: string;
  nameEn: string;
  nameAr: string;
  name: string;
}
