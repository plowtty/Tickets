import prisma from '../../src/config/database';
import { authService } from '../../src/services/auth.service';
import { AppError } from '../../src/middleware/error.middleware';

// Mock Prisma to avoid real DB calls in unit tests
jest.mock('../../src/config/database', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Auth Service', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('throws 409 when email already exists', async () => {
      (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1', email: 'test@test.com' });

      await expect(
        authService.register({ name: 'Test', email: 'test@test.com', password: 'Password123' })
      ).rejects.toThrow(AppError);

      await expect(
        authService.register({ name: 'Test', email: 'test@test.com', password: 'Password123' })
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it('returns user without password on success', async () => {
      (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (mockedPrisma.user.create as jest.Mock).mockResolvedValueOnce({
        id: 'abc',
        name: 'New User',
        email: 'new@test.com',
        role: 'CLIENT',
        avatar: null,
        active: true,
        createdAt: new Date(),
      });

      const result = await authService.register({
        name: 'New User',
        email: 'new@test.com',
        password: 'Password123',
      });

      expect(result.user).not.toHaveProperty('password');
      expect(result.user.email).toBe('new@test.com');
      expect(typeof result.accessToken).toBe('string');
      expect(typeof result.refreshToken).toBe('string');
    });
  });

  describe('login', () => {
    it('throws 401 when user is not found', async () => {
      (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        authService.login({ email: 'ghost@test.com', password: 'Password123' })
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('throws 401 when user is inactive', async () => {
      (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '1',
        email: 'user@test.com',
        active: false,
        password: 'hashed',
      });

      await expect(
        authService.login({ email: 'user@test.com', password: 'Password123' })
      ).rejects.toMatchObject({ statusCode: 401 });
    });
  });
});
