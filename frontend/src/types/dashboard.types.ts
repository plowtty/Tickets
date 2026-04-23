import { Priority, Ticket, TicketStatus } from './ticket.types';

export interface StatusMetric {
  status: TicketStatus;
  count: number;
}

export interface PriorityMetric {
  priority: Priority;
  count: number;
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  byStatus: StatusMetric[];
  byPriority: PriorityMetric[];
  recentTickets: Array<
    Ticket & {
      createdBy?: { id: string; name: string };
      assignedTo?: { id: string; name: string } | null;
    }
  >;
}

export interface AgentDashboardStat {
  id: string;
  name: string;
  email: string;
  totalAssigned: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  critical: number;
}
