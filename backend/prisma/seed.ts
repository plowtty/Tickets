import { PrismaClient, Role, TicketStatus, Priority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Limpiar datos existentes
  await prisma.ticketHistory.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();

  // ─── Usuarios ─────────────────────────────────────────────────────────────
  const password = await bcrypt.hash('Password123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@helpdesk.com',
      password,
      role: Role.ADMIN,
    },
  });

  const agent1 = await prisma.user.create({
    data: {
      name: 'Agent Alice',
      email: 'alice@helpdesk.com',
      password,
      role: Role.AGENT,
    },
  });

  const agent2 = await prisma.user.create({
    data: {
      name: 'Agent Bob',
      email: 'bob@helpdesk.com',
      password,
      role: Role.AGENT,
    },
  });

  const client1 = await prisma.user.create({
    data: {
      name: 'Client Carlos',
      email: 'carlos@client.com',
      password,
      role: Role.CLIENT,
    },
  });

  const client2 = await prisma.user.create({
    data: {
      name: 'Client Diana',
      email: 'diana@client.com',
      password,
      role: Role.CLIENT,
    },
  });

  console.log('✅ Users created');

  // ─── Tickets ──────────────────────────────────────────────────────────────
  const ticketsData = [
    {
      title: 'Cannot access email account',
      description: 'Getting "Invalid password" error even after reset.',
      status: TicketStatus.OPEN,
      priority: Priority.HIGH,
      createdById: client1.id,
      assignedToId: agent1.id,
    },
    {
      title: 'Printer not working on 3rd floor',
      description: 'The shared printer shows offline but is powered on.',
      status: TicketStatus.IN_PROGRESS,
      priority: Priority.MEDIUM,
      createdById: client1.id,
      assignedToId: agent1.id,
    },
    {
      title: 'VPN connection drops every hour',
      description: 'Remote workers are experiencing VPN disconnections every ~60 minutes.',
      status: TicketStatus.IN_PROGRESS,
      priority: Priority.CRITICAL,
      createdById: client2.id,
      assignedToId: agent2.id,
    },
    {
      title: 'Request new laptop setup',
      description: 'New employee needs laptop configured with standard software.',
      status: TicketStatus.RESOLVED,
      priority: Priority.LOW,
      createdById: client2.id,
      assignedToId: agent2.id,
    },
    {
      title: 'Software license renewal',
      description: 'Adobe Creative Suite license expiring next month.',
      status: TicketStatus.OPEN,
      priority: Priority.MEDIUM,
      createdById: client1.id,
    },
    {
      title: 'Monitor flickering issue',
      description: 'Second monitor flickers when connected via HDMI.',
      status: TicketStatus.CLOSED,
      priority: Priority.LOW,
      createdById: client2.id,
      assignedToId: agent1.id,
    },
  ];

  const tickets = await Promise.all(
    ticketsData.map((data) => prisma.ticket.create({ data }))
  );

  console.log('✅ Tickets created');

  // ─── Comments ─────────────────────────────────────────────────────────────
  await prisma.comment.createMany({
    data: [
      {
        body: 'I have tried resetting the password 3 times already.',
        authorId: client1.id,
        ticketId: tickets[0].id,
      },
      {
        body: 'Can you provide your username? I will check the account status.',
        authorId: agent1.id,
        ticketId: tickets[0].id,
      },
      {
        body: 'Working on reconnecting the printer to the network.',
        authorId: agent1.id,
        ticketId: tickets[1].id,
      },
      {
        body: 'This affects 15 remote employees. Needs urgent attention.',
        authorId: admin.id,
        ticketId: tickets[2].id,
      },
    ],
  });

  console.log('✅ Comments created');

  // ─── Ticket History ───────────────────────────────────────────────────────
  await prisma.ticketHistory.createMany({
    data: [
      {
        ticketId: tickets[1].id,
        changedById: agent1.id,
        field: 'status',
        oldValue: 'OPEN',
        newValue: 'IN_PROGRESS',
      },
      {
        ticketId: tickets[2].id,
        changedById: admin.id,
        field: 'priority',
        oldValue: 'HIGH',
        newValue: 'CRITICAL',
      },
      {
        ticketId: tickets[2].id,
        changedById: agent2.id,
        field: 'status',
        oldValue: 'OPEN',
        newValue: 'IN_PROGRESS',
      },
      {
        ticketId: tickets[3].id,
        changedById: agent2.id,
        field: 'status',
        oldValue: 'IN_PROGRESS',
        newValue: 'RESOLVED',
      },
    ],
  });

  console.log('✅ Ticket history created');

  console.log('\n🎉 Seed completed! Test credentials:');
  console.log('  Admin:  admin@helpdesk.com  / Password123');
  console.log('  Agent:  alice@helpdesk.com  / Password123');
  console.log('  Agent:  bob@helpdesk.com    / Password123');
  console.log('  Client: carlos@client.com   / Password123');
  console.log('  Client: diana@client.com    / Password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
