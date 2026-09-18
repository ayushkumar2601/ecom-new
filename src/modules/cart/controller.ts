import { Request, Response } from 'express';
import { CartService } from './service';
import { ApiResponse } from '../../utils/ApiResponse';

export class CartController {
  private cartService: CartService;

  constructor() {
    this.cartService = new CartService();
  }

  private getCustomerId(req: Request) {
    return parseInt(req.headers['x-user-id'] as string, 10);
  }

  getCart = async (req: Request, res: Response) => {
    const customerId = this.getCustomerId(req);
    const cart = await this.cartService.getCart(customerId);
    res.json(ApiResponse.success(cart));
  };

  addItem = async (req: Request, res: Response) => {
    const customerId = this.getCustomerId(req);
    const cart = await this.cartService.addItem(customerId, req.body);
    res.json(ApiResponse.success(cart));
  };

  updateItemQuantity = async (req: Request, res: Response) => {
    const customerId = this.getCustomerId(req);
    const productId = parseInt(req.params.productId as string, 10);
    const cart = await this.cartService.updateItemQuantity(customerId, productId, req.body);
    res.json(ApiResponse.success(cart));
  };

  removeItem = async (req: Request, res: Response) => {
    const customerId = this.getCustomerId(req);
    const productId = parseInt(req.params.productId as string, 10);
    const cart = await this.cartService.removeItem(customerId, productId);
    res.json(ApiResponse.success(cart));
  };

  clearCart = async (req: Request, res: Response) => {
    const customerId = this.getCustomerId(req);
    await this.cartService.clearCart(customerId);
    res.json(ApiResponse.success(null, { message: 'Cart cleared' }));
  };
}
