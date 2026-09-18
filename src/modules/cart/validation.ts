import { z } from 'zod';

export const addCartItemSchema = z.object({
  body: z.object({
    productId: z.number().int().positive('Product ID must be valid'),
    quantity: z.number().int().positive('Quantity must be greater than 0'),
  }),
});

export const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().positive('Quantity must be greater than 0'),
  }),
});
