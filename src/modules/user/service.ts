import { UserRepository } from './repository';
import { CreateUserDTO, UserQueryFilters } from './types';
import { ApiError } from '../../utils/ApiError';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(data: CreateUserDTO) {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ApiError(409, 'Email already exists');
    }

    return this.userRepository.create(data);
  }

  async getUser(id: number) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  async listUsers(filters: UserQueryFilters) {
    return this.userRepository.list(filters);
  }
}
