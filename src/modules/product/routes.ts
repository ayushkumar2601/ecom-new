import { Router } from 'express';
import { ProductController } from './controller';
import { validate } from '../../middleware/validate.middleware';
import { catchAsync } from '../../utils/catchAsync';
import { createProductSchema, updateProductSchema, listProductsSchema } from './validation';

const router = Router();
const productController = new ProductController();

router.post(
  '/',
  validate(createProductSchema),
  catchAsync(productController.createProduct)
);

router.get(
  '/',
  validate(listProductsSchema),
  catchAsync(productController.listProducts)
);

router.get(
  '/:id',
  catchAsync(productController.getProduct)
);

router.put(
  '/:id',
  validate(updateProductSchema),
  catchAsync(productController.updateProduct)
);

router.delete(
  '/:id',
  catchAsync(productController.deleteProduct)
);

export default router;
