import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { PERMISSIONS } from '../../constants/permissions';

const router = Router();

router.use(authenticate, authorize(PERMISSIONS.DASHBOARD_VIEW));

router.get('/stats', dashboardController.getStats);
router.get('/inquiry-trend', dashboardController.getInquiryTrend);
router.get('/products-by-category', dashboardController.getProductsByCategory);
router.get('/recent-activity', dashboardController.getRecentActivity);

export default router;
