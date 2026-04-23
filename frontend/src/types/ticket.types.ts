import { User } from './user.types';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TicketFilters {
  status?: TicketStatus;
  priority?: Priority;
  assignedToId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  createdById: string;
  assignedToId?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: User;
  assignedTo?: User | null;
  _count?: {
    comments: number;
  };
}

export interface TicketComment {
  id: string;
  body: string;
  authorId: string;
  ticketId: string;
  createdAt: string;
  updatedAt: string;
  author: User;
}

export interface TicketHistoryItem {
  id: string;
  field: string;
  oldValue?: string | null;
  newValue?: string | null;
  ticketId: string;
  changedById: string;
  createdAt: string;
  changedBy: User;
}

export interface TicketDetail extends Ticket {
  comments: TicketComment[];
  history: TicketHistoryItem[];
}
