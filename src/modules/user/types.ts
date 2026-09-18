import { Role } from '@prisma/client';

export interface CreateUserDTO {
  name: string;
  email: string;
  role: Role;
}

export interface UserQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
}
