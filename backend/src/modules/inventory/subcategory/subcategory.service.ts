import { prisma } from '@/config/database';
import { ApiError } from '@/common/errors/api.error';
import { PaginationParams, createPaginatedResponse } from '@/common/utils/pagination';

export interface SubcategoryFilters {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
}

export class SubcategoryService {
  /**
   * Create a new subcategory with translations
   */
  async create(data: { name: string; description?: string; categoryId: string; image?: string; isActive?: boolean }) {
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new ApiError('Parent category not found', 404);
    }

    // Check for duplicate name in same category (locale: en)
    const existing = await prisma.subcategoryTranslation.findFirst({
      where: {
        name: data.name,
        locale: 'en',
        subcategory: {
          categoryId: data.categoryId,
        },
      },
    });

    if (existing) {
      throw new ApiError('Subcategory with this name already exists in this category', 400);
    }

    return await prisma.subcategory.create({
      data: {
        categoryId: data.categoryId,
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
        category: {
          include: {
            translations: { where: { locale: 'en' } }
          }
        }
      },
    });
  }

  /**
   * List subcategories with translations and pagination
   */
  async list(filters: SubcategoryFilters, pagination: PaginationParams, locale: string = 'en') {
    const where: any = {};

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.search) {
      where.translations = {
        some: {
          name: { contains: filters.search, mode: 'insensitive' },
          locale,
        },
      };
    }

    const [total, subcategories] = await Promise.all([
      prisma.subcategory.count({ where }),
      prisma.subcategory.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        include: {
          translations: {
            where: { locale },
          },
          category: {
            include: {
              translations: { where: { locale } }
            }
          },
          _count: {
            select: { products: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Flatten translations for the frontend
    const formattedSubcategories = subcategories.map((sub) => ({
      ...sub,
      name: sub.translations[0]?.name || '',
      description: sub.translations[0]?.description || '',
      categoryName: sub.category.translations[0]?.name || 'Unknown Category'
    }));

    return createPaginatedResponse(formattedSubcategories, total, pagination.page, pagination.limit);
  }

  /**
   * Get subcategory summary
   */
  async getSummary() {
    const [total, active, disabled] = await Promise.all([
      prisma.subcategory.count(),
      prisma.subcategory.count({ where: { isActive: true } }),
      prisma.subcategory.count({ where: { isActive: false } }),
    ]);

    return {
      totalSubcategories: total,
      activeSubcategories: active,
      disabledSubcategories: disabled,
    };
  }

  /**
   * Get single subcategory
   */
  async getById(id: string, locale: string = 'en') {
    const subcategory = await prisma.subcategory.findUnique({
      where: { id },
      include: {
        translations: { where: { locale } },
        category: {
          include: {
            translations: { where: { locale } }
          }
        },
        _count: {
          select: { products: true }
        }
      },
    });

    if (!subcategory) {
      throw new ApiError('Subcategory not found', 404);
    }

    return {
      ...subcategory,
      name: subcategory.translations[0]?.name || '',
      description: subcategory.translations[0]?.description || '',
      categoryName: subcategory.category.translations[0]?.name || 'Unknown Category'
    };
  }

  /**
   * Update subcategory
   */
  async update(id: string, data: { name?: string; description?: string; categoryId?: string; image?: string; isActive?: boolean }) {
    const subcategory = await prisma.subcategory.findUnique({
      where: { id },
    });

    if (!subcategory) {
      throw new ApiError('Subcategory not found', 404);
    }

    // Check if new category exists if provided
    if (data.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
      if (!category) throw new ApiError('Parent category not found', 404);
    }

    // Update translations if name or description provided
    if (data.name || data.description) {
      await prisma.subcategoryTranslation.upsert({
        where: {
          subcategoryId_locale: { subcategoryId: id, locale: 'en' },
        },
        update: {
          name: data.name,
          description: data.description,
        },
        create: {
          subcategoryId: id,
          locale: 'en',
          name: data.name || '',
          description: data.description,
        },
      });
    }

    return await prisma.subcategory.update({
      where: { id },
      data: {
        categoryId: data.categoryId,
        image: data.image,
        isActive: data.isActive,
      },
      include: {
        translations: { where: { locale: 'en' } },
      },
    });
  }

  /**
   * Delete subcategory
   */
  async delete(id: string) {
    const subcategory = await prisma.subcategory.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true } },
      },
    });

    if (!subcategory) {
      throw new ApiError('Subcategory not found', 404);
    }

    if (subcategory._count.products > 0) {
      throw new ApiError('Cannot delete subcategory that contains products', 400);
    }

    return await prisma.subcategory.delete({
      where: { id },
    });
  }
}

export const subcategoryService = new SubcategoryService();
