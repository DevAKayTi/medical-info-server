import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import userRoutes from '../modules/users/user.routes';
import roleRoutes from '../modules/roles/role.routes';
import productRoutes from '../modules/products/product.routes';
import categoryRoutes from '../modules/categories/category.routes';
import brandRoutes from '../modules/brands/brand.routes';
import partnerRoutes from '../modules/partners/partner.routes';
import newsRoutes from '../modules/news/news.routes';
import inquiryRoutes from '../modules/inquiries/inquiry.routes';
import careerRoutes from '../modules/careers/career.routes';
import galleryRoutes from '../modules/gallery/gallery.routes';
import certificationRoutes from '../modules/certifications/certification.routes';
import testimonialRoutes from '../modules/testimonials/testimonial.routes';
import downloadRoutes from '../modules/downloads/download.routes';
import serviceRoutes from '../modules/services/service.routes';
import dashboardRoutes from '../modules/dashboard/dashboard.routes';
import settingsRoutes from '../modules/settings/settings.routes';
import notificationRoutes from '../modules/notifications/notification.routes';

const router = Router();

// ── Health check ───────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'MediSource Global API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    modules: [
      'auth', 'users', 'roles', 'products', 'categories', 'brands', 'partners',
      'news', 'inquiries', 'careers', 'gallery', 'certifications', 'testimonials',
      'downloads', 'services', 'dashboard', 'settings', 'notifications',
    ],
  });
});

// ── Auth ───────────────────────────────────────────────────────
router.use('/auth', authRoutes);

// ── Admin-only modules ─────────────────────────────────────────
router.use('/admin/users', userRoutes);
router.use('/admin/roles', roleRoutes);
router.use('/admin/dashboard', dashboardRoutes);
router.use('/admin/settings', settingsRoutes);
router.use('/admin/notifications', notificationRoutes);

// ── Content modules (public + admin split inside router) ───────
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/partners', partnerRoutes);
router.use('/news', newsRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/careers', careerRoutes);
router.use('/gallery', galleryRoutes);
router.use('/certifications', certificationRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/downloads', downloadRoutes);
router.use('/services', serviceRoutes);

export default router;
