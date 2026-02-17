import { prisma } from '@/config/database';
import { ApiError } from '@/common/errors/api.error';
import { CategorySpecTemplate } from '@prisma/client';

export class SpecTemplateService {
  async create(data: {
    categoryId: string;
    subcategoryId?: string | null;
    specKey: string;
    isRequired: boolean;
  }): Promise<CategorySpecTemplate> {
    // Check if duplicate specKey for this category/subcategory
    const existing = await prisma.categorySpecTemplate.findFirst({
      where: {
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId || null,
        specKey: data.specKey,
      },
    });

    if (existing) {
      throw new ApiError('Specification template for this key already exists in this category', 400);
    }

    return await prisma.categorySpecTemplate.create({
      data: {
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId || null,
        specKey: data.specKey,
        isRequired: data.isRequired,
      },
    });
  }

  async getByCategory(categoryId: string, subcategoryId?: string | null): Promise<CategorySpecTemplate[]> {
    return await prisma.categorySpecTemplate.findMany({
      where: {
        categoryId,
        OR: [
          { subcategoryId: subcategoryId || null },
          { subcategoryId: null }
        ]
      },
      orderBy: { specKey: 'asc' }
    });
  }

  async delete(id: string): Promise<CategorySpecTemplate> {
    return await prisma.categorySpecTemplate.delete({
      where: { id },
    });
  }

  async update(id: string, data: Partial<CategorySpecTemplate>): Promise<CategorySpecTemplate> {
    return await prisma.categorySpecTemplate.update({
      where: { id },
      data,
    });
  }
}

export const specTemplateService = new SpecTemplateService();
