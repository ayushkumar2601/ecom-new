import { Router } from 'express';
import { OrderController } from './controller';
import { validate } from '../../middleware/validate.middleware';
import { catchAsync } from '../../utils/catchAsync';
import { listOrdersSchema } from './validation';

const router = Router();
const orderController = new OrderController();

router.post(
  '/',
  catchAsync(orderController.createOrder)
);

router.get(
  '/',
  validate(listOrdersSchema),
  catchAsync(orderController.listMyOrders)
);

router.get(
  '/:id',
  catchAsync(orderController.getOrder)
);

// Vendor Routes
router.get(
  '/vendor/incoming',
  catchAsync(orderController.getIncomingVendorOrders)
);

router.patch(
  '/:orderId/items/:productId/approve',
  catchAsync(orderController.approveItem)
);

router.patch(
  '/:orderId/items/:productId/reject',
  catchAsync(orderController.rejectItem)
);

export default router;
