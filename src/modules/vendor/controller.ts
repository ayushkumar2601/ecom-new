import { Request, Response } from 'express';
import { VendorService } from './service';
import { ApiResponse } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';

export class VendorController {
  private vendorService: VendorService;

  constructor() {
    this.vendorService = new VendorService();
  }

  private checkVendor(req: Request) {
    const role = req.headers['x-role'] as string;
    if (role !== 'VENDOR') {
      throw new ApiError(403, 'User is not a vendor');
    }
    return parseInt(req.headers['x-user-id'] as string, 10);
  }

  getPerformance = async (req: Request, res: Response) => {
    const vendorId = this.checkVendor(req);
    const data = await this.vendorService.getPerformance(vendorId);
    res.json(ApiResponse.success(data));
  };
}
