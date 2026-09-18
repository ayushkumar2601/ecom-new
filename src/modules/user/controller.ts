import { Request, Response } from 'express';
import { UserService } from './service';
import { ApiResponse } from '../../utils/ApiResponse';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  createUser = async (req: Request, res: Response) => {
    const user = await this.userService.createUser(req.body);
    res.status(201).json(ApiResponse.success(user));
  };

  getUser = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const user = await this.userService.getUser(id);
    res.json(ApiResponse.success(user));
  };

  listUsers = async (req: Request, res: Response) => {
    const filters = {
      page: req.query.page as number | undefined,
      limit: req.query.limit as number | undefined,
      search: req.query.search as string | undefined,
      role: req.query.role as any,
    };

    const { users, total } = await this.userService.listUsers(filters);

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  };
}
