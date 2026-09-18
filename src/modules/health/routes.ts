import { Router } from 'express';
import { HealthController } from './controller';
import { catchAsync } from '../../utils/catchAsync';

const router = Router();
const healthController = new HealthController();

router.get('/health', catchAsync(healthController.getHealth));
router.get('/metrics', healthController.getMetrics);

export default router;
