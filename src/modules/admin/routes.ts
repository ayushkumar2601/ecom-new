import { Router } from 'express';
import { AdminController } from './controller';
import { catchAsync } from '../../utils/catchAsync';

const router = Router();
const adminController = new AdminController();

// User Management
router.get('/users', catchAsync(adminController.listUsers));
router.patch('/users/:id/block', catchAsync(adminController.blockUser));
router.patch('/users/:id/unblock', catchAsync(adminController.unblockUser));

// Analytics
router.get('/analytics/overview', catchAsync(adminController.getOverviewAnalytics));
router.get('/analytics/vendors/:vendorId', catchAsync(adminController.getVendorAnalytics));
router.get('/analytics/repeat-customers', catchAsync(adminController.getRepeatCustomers));

export default router;
