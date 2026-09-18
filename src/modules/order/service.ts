import { OrderRepository } from './repository';
import { OrderQueryFilters } from './types';
import { ApiError } from '../../utils/ApiError';

export class OrderService {
  private orderRepository: OrderRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
  }

  async createOrder(customerId: number) {
    try {
      return await this.orderRepository.createOrderFromCart(customerId);
    } catch (error: any) {
      if (error.message.includes('Cart is empty') || error.message.includes('out of stock')) {
        throw new ApiError(400, error.message);
      }
      throw error;
    }
  }

  async getOrder(id: number, customerId: number) {
    const order = await this.orderRepository.findById(id, customerId);
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }
    return order;
  }

  async listMyOrders(customerId: number, filters: OrderQueryFilters) {
    return this.orderRepository.list(customerId, filters);
  }

  async getIncomingVendorOrders(vendorId: number) {
    return this.orderRepository.getIncomingVendorOrders(vendorId);
  }

  async approveItem(orderId: number, productId: number, vendorId: number) {
    try {
      return await this.orderRepository.setOrderItemStatus(orderId, productId, vendorId, 'APPROVED');
    } catch (error: any) {
      throw new ApiError(400, error.message);
    }
  }

  async rejectItem(orderId: number, productId: number, vendorId: number) {
    try {
      return await this.orderRepository.setOrderItemStatus(orderId, productId, vendorId, 'REJECTED');
    } catch (error: any) {
      throw new ApiError(400, error.message);
    }
  }
}
