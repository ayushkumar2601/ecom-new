import { Router } from 'express';
import { CartController } from './controller';
import { validate } from '../../middleware/validate.middleware';
import { catchAsync } from '../../utils/catchAsync';
import { addCartItemSchema, updateCartItemSchema } from './validation';

const router = Router();
const cartController = new CartController();

router.get(
  '/',
  catchAsync(cartController.getCart)
);

router.post(
  '/items',
  validate(addCartItemSchema),
  catchAsync(cartController.addItem)
);

router.put(
  '/items/:productId',
  validate(updateCartItemSchema),
  catchAsync(cartController.updateItemQuantity)
);

router.delete(
  '/items/:productId',
  catchAsync(cartController.removeItem)
);

router.delete(
  '/',
  catchAsync(cartController.clearCart)
);

export default router;
