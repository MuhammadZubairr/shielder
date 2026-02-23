// ─── Shared types for the Admin Categories module ─────────────────────────────

export interface Category {
  id: string;
  image: string | null;
  isActive: boolean;
  createdAt: string;
  // Locale-resolved (set by backend based on Accept-Language header)
  name: string;
  description: string;
  // Bilingual fields (always returned by admin endpoints)
  nameEn: string;
  descriptionEn: string;
  nameAr: string;
  descriptionAr: string;
  _count: {
    subcategories: number;
    products: number;
  };
}

export interface CategorySummary {
  totalCategories: number;
  activeCategories: number;
  disabledCategories: number;
}

export interface CategoryFormData {
  nameEn: string;
  descriptionEn: string;
  nameAr: string;
  descriptionAr: string;
  isActive: boolean;
}

export const EMPTY_FORM: CategoryFormData = {
  nameEn: '',
  descriptionEn: '',
  nameAr: '',
  descriptionAr: '',
  isActive: true,
};
