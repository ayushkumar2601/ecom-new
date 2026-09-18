import { UserService } from '../../src/modules/user/service';
import { UserRepository } from '../../src/modules/user/repository';

jest.mock('../../src/modules/user/repository');

describe('UserService', () => {
  let userService: UserService;
  let userRepositoryMock: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepositoryMock = new UserRepository() as jest.Mocked<UserRepository>;
    userService = new UserService();
    (userService as any).userRepository = userRepositoryMock;
  });

  describe('getUser', () => {
    it('should return a user if found', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com', role: 'CUSTOMER', isBlocked: false, createdAt: new Date(), updatedAt: new Date() };
      userRepositoryMock.findById.mockResolvedValue(mockUser as any);

      const user = await userService.getUser(1);
      expect(user).toEqual(mockUser);
      expect(userRepositoryMock.findById).toHaveBeenCalledWith(1);
    });

    it('should throw an error if user not found', async () => {
      userRepositoryMock.findById.mockResolvedValue(null);

      await expect(userService.getUser(1)).rejects.toThrow('User not found');
    });
  });
});
