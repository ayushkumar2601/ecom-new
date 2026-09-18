import { Request, Response } from 'express';
import { ProductService } from './service';
import { ApiResponse } from '../../utils/ApiResponse';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  createProduct = async (req: Request, res: Response) => {
    // Assuming x-user-id is passed for the vendorId
    const vendorId = parseInt(req.headers['x-user-id'] as string, 10);
    const data = { ...req.body, vendorId };
    
    const product = await this.productService.createProduct(data);
    res.status(201).json(ApiResponse.success(product));
  };

  updateProduct = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const product = await this.productService.updateProduct(id, req.body);
    res.json(ApiResponse.success(product));
  };

  deleteProduct = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    await this.productService.deleteProduct(id);
    res.json(ApiResponse.success(null, { message: 'Product deleted successfully' }));
  };

  getProduct = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const product = await this.productService.getProduct(id);
    res.json(ApiResponse.success(product));
  };

  listProducts = async (req: Request, res: Response) => {
    const filters = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      search: req.query.search as string | undefined,
      category: req.query.category as string | undefined,
      vendorId: req.query.vendorId ? parseInt(req.query.vendorId as string, 10) : undefined,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      sortBy: req.query.sortBy as string | undefined,
      order: req.query.order as string | undefined,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
    };

    const { products, total } = await this.productService.listProducts(filters);

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  };
}
