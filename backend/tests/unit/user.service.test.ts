import prisma from '../../src/config/database';
import { userService } from '../../src/services/user.service';
import { AppError } from '../../src/middleware/error.middleware';

jest.mock('../../src/config/database', () => ({
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

describe('User Service', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('list', () => {
    it('returns all users ordered by createdAt', async () => {
      const mockUsers = [
        { id: '1', name: 'Alice', email: 'a@test.com', role: 'AGENT', active: true, avatar: null, createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'Bob', email: 'b@test.com', role: 'CLIENT', active: true, avatar: null, createdAt: new Date(), updatedAt: new Date() },
      ];
      (mockedPrisma.user.findMany as jest.Mock).mockResolvedValueOnce(mockUsers);

      const result = await userService.list();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Alice');
    });
  });

  describe('update', () => {
    it('throws 404 when user does not exist', async () => {
      (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        userService.update('nonexistent-id', { role: 'AGENT' })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('updates and returns user without password', async () => {
      const existing = { id: '1', name: 'Alice', email: 'a@test.com', role: 'CLIENT', active: true, avatar: null, createdAt: new Date(), updatedAt: new Date() };
      const updated = { ...existing, role: 'AGENT' };

      (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(existing);
      (mockedPrisma.user.update as jest.Mock).mockResolvedValueOnce(updated);

      const result = await userService.update('1', { role: 'AGENT' });
      expect(result.role).toBe('AGENT');
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('remove', () => {
    it('throws 404 when user does not exist', async () => {
      (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(userService.remove('ghost')).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('deletes user when found', async () => {
      (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce({ id: '1' });
      (mockedPrisma.user.delete as jest.Mock).mockResolvedValueOnce({ id: '1' });

      await expect(userService.remove('1')).resolves.toBeUndefined();
    });
  });
});
