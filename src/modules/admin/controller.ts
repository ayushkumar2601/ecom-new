import { Request, Response } from 'express';
import { AdminService } from './service';
import { ApiResponse } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  private checkAdmin(req: Request) {
    const role = req.headers['x-role'] as string;
    if (role !== 'ADMIN') {
      throw new ApiError(403, 'User is not an admin');
    }
  }

  listUsers = async (req: Request, res: Response) => {
    this.checkAdmin(req);
    const filters = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      role: req.query.role as string,
      isBlocked: req.query.isBlocked as string,
      search: req.query.search as string,
    };
    
    const { users, total } = await this.adminService.listUsers(filters);
    
    res.json({
      success: true,
      data: users,
      meta: {
        page: filters.page || 1,
        limit: filters.limit || 10,
        total,
      }
    });
  };

  blockUser = async (req: Request, res: Response) => {
    this.checkAdmin(req);
    const id = parseInt(req.params.id as string, 10);
    const user = await this.adminService.blockUser(id);
    res.json(ApiResponse.success(user));
  };

  unblockUser = async (req: Request, res: Response) => {
    this.checkAdmin(req);
    const id = parseInt(req.params.id as string, 10);
    const user = await this.adminService.unblockUser(id);
    res.json(ApiResponse.success(user));
  };

  getOverviewAnalytics = async (req: Request, res: Response) => {
    this.checkAdmin(req);
    const data = await this.adminService.getOverviewAnalytics();
    res.json(ApiResponse.success(data));
  };

  getVendorAnalytics = async (req: Request, res: Response) => {
    this.checkAdmin(req);
    const vendorId = parseInt(req.params.vendorId as string, 10);
    const data = await this.adminService.getVendorAnalytics(vendorId);
    res.json(ApiResponse.success(data));
  };

  getRepeatCustomers = async (req: Request, res: Response) => {
    this.checkAdmin(req);
    const threshold = parseInt((req.query.threshold as string) || '2', 10);
    const data = await this.adminService.getRepeatCustomers(threshold);
    res.json(ApiResponse.success(data));
  };
}
