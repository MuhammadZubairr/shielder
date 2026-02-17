import { Router } from 'express';
import categoryRoutes from './category/category.routes';
import subcategoryRoutes from './subcategory/subcategory.routes';
import productRoutes from './product/product.routes';
import specTemplateRoutes from './spec-template/spec-template.routes';

const router = Router();

router.use('/categories', categoryRoutes);
router.use('/subcategories', subcategoryRoutes);
router.use('/products', productRoutes);
router.use('/spec-templates', specTemplateRoutes);

export default router;
