import { prisma } from '@/config/database';
import { ApiError } from '@/common/errors/api.error';
import { PaginationParams, createPaginatedResponse } from '@/common/utils/pagination';

export interface CategoryFilters {
  search?: string;
  isActive?: boolean;
}

export class CategoryService {
  /**
   * Create a new category with translations
   */
  async create(data: { name: string; description?: string; image?: string; isActive?: boolean }) {
    // Check for duplicate name in default locale (en)
    const existing = await prisma.categoryTranslation.findFirst({
      where: {
        name: data.name,
        locale: 'en',
      },
    });

    if (existing) {
      throw new ApiError('Category with this name already exists', 400);
    }

    return await prisma.category.create({
      data: {
        image: data.image,
        isActive: data.isActive ?? true,
        translations: {
          create: {
            name: data.name,
            description: data.description,
            locale: 'en',
          },
        },
      },
      include: {
        translations: true,
      },
    });
  }

  /**
   * List categories with translations and pagination
   */
  async list(filters: CategoryFilters, pagination: PaginationParams, locale: string = 'en') {
    const where: any = {};

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where.translations = {
        some: {
          name: { contains: filters.search, mode: 'insensitive' },
          locale,
        },
      };
    }

    const [total, categories] = await Promise.all([
      prisma.category.count({ where }),
      prisma.category.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        include: {
          translations: {
            where: { locale },
          },
          _count: {
            select: { subcategories: true, products: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Flatten translations for the frontend
    const formattedCategories = categories.map((cat) => ({
      ...cat,
      name: cat.translations[0]?.name || '',
      description: cat.translations[0]?.description || '',
    }));

    return createPaginatedResponse(formattedCategories, total, pagination.page, pagination.limit);
  }

  /**
   * Get category summary
   */
  async getSummary() {
    const [total, active, disabled] = await Promise.all([
      prisma.category.count(),
      prisma.category.count({ where: { isActive: true } }),
      prisma.category.count({ where: { isActive: false } }),
    ]);

    return {
      totalCategories: total,
      activeCategories: active,
      disabledCategories: disabled,
    };
  }

  /**
   * Get category by ID
   */
  async getById(id: string, locale: string = 'en') {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        translations: {
          where: { locale },
        },
        _count: {
          select: { subcategories: true, products: true },
        },
      },
    });

    if (!category) {
      throw new ApiError('Category not found', 404);
    }

    return {
      ...category,
      name: category.translations[0]?.name || '',
      description: category.translations[0]?.description || '',
    };
  }

  /**
   * Update category
   */
  async update(id: string, data: { name?: string; description?: string; image?: string; isActive?: boolean }) {
    // Check if category exists
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new ApiError('Category not found', 404);
    }

    if (data.name) {
      const existing = await prisma.categoryTranslation.findFirst({
        where: {
          name: data.name,
          locale: 'en',
          NOT: { categoryId: id },
        },
      });

      if (existing) {
        throw new ApiError('Category with this name already exists', 400);
      }
    }

    return await prisma.category.update({
      where: { id },
      data: {
        image: data.image,
        isActive: data.isActive,
        translations: data.name || data.description ? {
          upsert: {
            where: { categoryId_locale: { categoryId: id, locale: 'en' } },
            create: { name: data.name || '', description: data.description, locale: 'en' },
            update: { name: data.name, description: data.description },
          },
        } : undefined,
      },
      include: {
        translations: true,
      },
    });
  }

  /**
   * Delete category
   */
  async delete(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { subcategories: true, products: true },
        },
      },
    });

    if (!category) {
      throw new ApiError('Category not found', 404);
    }

    if (category._count.subcategories > 0 || category._count.products > 0) {
      throw new ApiError('Cannot delete category with associated subcategories or products', 400);
    }

    return await prisma.category.delete({
      where: { id },
    });
  }
}

export const categoryService = new CategoryService();

