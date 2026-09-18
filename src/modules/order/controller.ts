import { Request, Response } from 'express';
import { OrderService } from './service';
import { ApiResponse } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  private getCustomerId(req: Request) {
    return parseInt(req.headers['x-user-id'] as string, 10);
  }

  createOrder = async (req: Request, res: Response) => {
    const customerId = this.getCustomerId(req);
    const order = await this.orderService.createOrder(customerId);
    res.status(201).json(ApiResponse.success(order));
  };

  getOrder = async (req: Request, res: Response) => {
    const customerId = this.getCustomerId(req);
    const id = parseInt(req.params.id as string, 10);
    const order = await this.orderService.getOrder(id, customerId);
    res.json(ApiResponse.success(order));
  };

  listMyOrders = async (req: Request, res: Response) => {
    const customerId = this.getCustomerId(req);
    const filters = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      status: req.query.status as string | undefined,
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
      sortBy: req.query.sortBy as string | undefined,
      order: req.query.order as string | undefined,
    };

    const { orders, total } = await this.orderService.listMyOrders(customerId, filters);

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  };

  private checkVendor(req: Request) {
    const role = req.headers['x-role'] as string;
    if (role !== 'VENDOR') {
      throw new ApiError(403, 'User is not a vendor');
    }
    return parseInt(req.headers['x-user-id'] as string, 10);
  }

  getIncomingVendorOrders = async (req: Request, res: Response) => {
    const vendorId = this.checkVendor(req);
    const orders = await this.orderService.getIncomingVendorOrders(vendorId);
    res.json(ApiResponse.success(orders));
  };

  approveItem = async (req: Request, res: Response) => {
    const vendorId = this.checkVendor(req);
    const orderId = parseInt(req.params.orderId as string, 10);
    const productId = parseInt(req.params.productId as string, 10);
    const result = await this.orderService.approveItem(orderId, productId, vendorId);
    res.json(ApiResponse.success(result, { message: 'Item approved' }));
  };

  rejectItem = async (req: Request, res: Response) => {
    const vendorId = this.checkVendor(req);
    const orderId = parseInt(req.params.orderId as string, 10);
    const productId = parseInt(req.params.productId as string, 10);
    const result = await this.orderService.rejectItem(orderId, productId, vendorId);
    res.json(ApiResponse.success(result, { message: 'Item rejected' }));
  };
}
