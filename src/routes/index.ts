import { Router } from 'express';
import userRoutes from '../modules/user/routes';
import productRoutes from '../modules/product/routes';
import cartRoutes from '../modules/cart/routes';
import orderRoutes from '../modules/order/routes';

import adminRoutes from '../modules/admin/routes';
import vendorRoutes from '../modules/vendor/routes';
import healthRoutes from '../modules/health/routes';

const router = Router();

router.use('/', healthRoutes);

router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);
router.use('/vendor', vendorRoutes);

export default router;
