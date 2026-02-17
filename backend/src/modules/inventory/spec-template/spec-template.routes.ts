import { Router } from 'express';
import { specTemplateController } from './spec-template.controller';
import { authenticate } from '@/modules/auth/auth.middleware';
import { requireAdmin } from '@/common/middleware/rbac.middleware';

const router = Router();

router.post('/', authenticate, requireAdmin, specTemplateController.create);
router.get('/', specTemplateController.getByCategory);
router.get('/category/:categoryId', specTemplateController.getByCategory);
router.delete('/:id', authenticate, requireAdmin, specTemplateController.delete);

export default router;
