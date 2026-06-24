import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import userRoutes from '../modules/users/user.routes';
import productRoutes from '../modules/products/product.routes';
import newsRoutes from '../modules/news/news.routes';
import inquiryRoutes from '../modules/inquiries/inquiry.routes';
import careerRoutes from '../modules/careers/career.routes';
import galleryRoutes from '../modules/gallery/gallery.routes';
import dashboardRoutes from '../modules/dashboard/dashboard.routes';
import settingsRoutes from '../modules/settings/settings.routes';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'MediSource API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Auth
router.use('/auth', authRoutes);

// Admin modules
router.use('/admin/users', userRoutes);
router.use('/admin/dashboard', dashboardRoutes);
router.use('/admin/settings', settingsRoutes);

// Content modules (public + admin split inside each router)
router.use('/products', productRoutes);
router.use('/news', newsRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/careers', careerRoutes);
router.use('/gallery', galleryRoutes);

export default router;
