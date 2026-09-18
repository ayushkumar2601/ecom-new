import { CartRepository } from './repository';
import { AddCartItemDTO, UpdateCartItemDTO } from './types';
import { ProductRepository } from '../product/repository';
import { ApiError } from '../../utils/ApiError';

export class CartService {
  private cartRepository: CartRepository;
  private productRepository: ProductRepository;

  constructor() {
    this.cartRepository = new CartRepository();
    this.productRepository = new ProductRepository();
  }

  async getCart(customerId: number) {
    return this.cartRepository.getByCustomerId(customerId);
  }

  async addItem(customerId: number, data: AddCartItemDTO) {
    const product = await this.productRepository.findById(data.productId);
    if (!product || !product.isActive) {
      throw new ApiError(404, 'Product not found or inactive');
    }

    if (product.stock < data.quantity) {
      throw new ApiError(400, 'Not enough stock available');
    }

    await this.cartRepository.addItem(customerId, product.id, data.quantity, product.price);
    
    return this.getCart(customerId);
  }

  async updateItemQuantity(customerId: number, productId: number, data: UpdateCartItemDTO) {
    const cart = await this.getCart(customerId);
    if (!cart) {
      throw new ApiError(404, 'Cart not found');
    }

    // Checking if item exists in cart
    const itemExists = cart.items.find((item) => item.productId === productId);
    if (!itemExists) {
      throw new ApiError(404, 'Product not in cart');
    }

    const product = await this.productRepository.findById(productId);
    if (!product || product.stock < data.quantity) {
      throw new ApiError(400, 'Not enough stock available');
    }

    await this.cartRepository.updateItemQuantity(customerId, productId, data.quantity);
    
    return this.getCart(customerId);
  }

  async removeItem(customerId: number, productId: number) {
    const cart = await this.getCart(customerId);
    if (!cart || cart.items.length === 0) throw new ApiError(404, 'Cart not found');
    
    await this.cartRepository.removeItem(customerId, productId);
    return this.getCart(customerId);
  }

  async clearCart(customerId: number) {
    await this.cartRepository.clearCart(customerId);
    return { message: 'Cart cleared' };
  }
}
