import { Router } from 'express';
import { VendorController } from './controller';
import { catchAsync } from '../../utils/catchAsync';

const router = Router();
const vendorController = new VendorController();

router.get('/analytics/performance', catchAsync(vendorController.getPerformance));

export default router;
