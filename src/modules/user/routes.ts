import { Router } from 'express';
import { UserController } from './controller';
import { validate } from '../../middleware/validate.middleware';
import { catchAsync } from '../../utils/catchAsync';
import { createUserSchema, listUsersSchema } from './validation';

const router = Router();
const userController = new UserController();

router.post(
  '/',
  validate(createUserSchema),
  catchAsync(userController.createUser)
);

router.get(
  '/',
  validate(listUsersSchema),
  catchAsync(userController.listUsers)
);

router.get(
  '/:id',
  catchAsync(userController.getUser)
);

export default router;
