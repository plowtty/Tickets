import prisma from '../../src/config/database';
import { ticketService } from '../../src/services/ticket.service';
import { AppError } from '../../src/middleware/error.middleware';

jest.mock('../../src/config/database', () => ({
  ticket: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
}));

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Ticket Service', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getById', () => {
    it('throws 404 when ticket does not exist', async () => {
      (mockedPrisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        ticketService.getById('nonexistent-id', 'user-1', 'ADMIN')
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('throws 403 when client tries to read another user ticket', async () => {
      (mockedPrisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'ticket-1',
        createdById: 'other-user',
        assignedToId: null,
        comments: [],
        history: [],
        createdBy: {},
        assignedTo: null,
        _count: { comments: 0 },
      });

      await expect(
        ticketService.getById('ticket-1', 'my-user', 'CLIENT')
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it('returns ticket when admin reads any ticket', async () => {
      const mockTicket = {
        id: 'ticket-1',
        createdById: 'other-user',
        assignedToId: null,
        comments: [],
        history: [],
        createdBy: { id: 'other-user', name: 'Other', email: 'other@test.com', role: 'CLIENT' },
        assignedTo: null,
        _count: { comments: 0 },
      };

      (mockedPrisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce(mockTicket);

      const result = await ticketService.getById('ticket-1', 'admin-user', 'ADMIN');
      expect(result.id).toBe('ticket-1');
    });
  });

  describe('remove', () => {
    it('throws 404 when ticket to delete does not exist', async () => {
      (mockedPrisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(ticketService.remove('nonexistent-id')).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('deletes ticket when it exists', async () => {
      (mockedPrisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'ticket-1' });
      (mockedPrisma.ticket.delete as jest.Mock).mockResolvedValueOnce({ id: 'ticket-1' });

      await expect(ticketService.remove('ticket-1')).resolves.toBeUndefined();
    });
  });

  describe('create', () => {
    it('throws 403 when client tries to assign at creation', async () => {
      (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'agent-1',
        role: 'AGENT',
      });

      await expect(
        ticketService.create(
          { title: 'T', description: 'D', priority: 'LOW', assignedToId: 'agent-1' },
          'client-1',
          'CLIENT'
        )
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });
});
