import request from 'supertest';
import app from '../../src/app';

type AuthData = {
	accessToken: string;
	user: {
		id: string;
		email: string;
		role: 'ADMIN' | 'AGENT' | 'CLIENT';
	};
};

describe('Tickets Integration', () => {
	let admin: AuthData;
	let agent: AuthData;
	let client: AuthData;

	beforeAll(async () => {
		const loginAdmin = await request(app).post('/api/auth/login').send({
			email: 'admin@helpdesk.com',
			password: 'Password123',
		});
		const loginAgent = await request(app).post('/api/auth/login').send({
			email: 'alice@helpdesk.com',
			password: 'Password123',
		});
		const loginClient = await request(app).post('/api/auth/login').send({
			email: 'carlos@client.com',
			password: 'Password123',
		});

		admin = loginAdmin.body.data;
		agent = loginAgent.body.data;
		client = loginClient.body.data;
	});

	it('returns paginated tickets for admin with status filter', async () => {
		const response = await request(app)
			.get('/api/tickets?status=OPEN&page=1&limit=5')
			.set('Authorization', `Bearer ${admin.accessToken}`);

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(Array.isArray(response.body.data)).toBe(true);
		expect(response.body.pagination).toBeDefined();

		for (const ticket of response.body.data) {
			expect(ticket.status).toBe('OPEN');
		}
	});

	it('returns only own tickets for client', async () => {
		const response = await request(app)
			.get('/api/tickets?page=1&limit=20')
			.set('Authorization', `Bearer ${client.accessToken}`);

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);

		for (const ticket of response.body.data) {
			expect(ticket.createdById).toBe(client.user.id);
		}
	});

	it('forbids client from assigning ticket during creation', async () => {
		const response = await request(app)
			.post('/api/tickets')
			.set('Authorization', `Bearer ${client.accessToken}`)
			.send({
				title: 'Client cannot assign on create',
				description: 'Permission check',
				priority: 'MEDIUM',
				assignedToId: agent.user.id,
			});

		expect(response.status).toBe(403);
		expect(response.body.success).toBe(false);
		expect(response.body.message).toBe('Clients cannot assign tickets at creation');
	});

	it('allows admin to create and delete a ticket', async () => {
		const uniqueTitle = `E2E Admin Ticket ${Date.now()}`;

		const createResponse = await request(app)
			.post('/api/tickets')
			.set('Authorization', `Bearer ${admin.accessToken}`)
			.send({
				title: uniqueTitle,
				description: 'Created from integration test',
				priority: 'LOW',
				assignedToId: agent.user.id,
			});

		expect(createResponse.status).toBe(201);
		expect(createResponse.body.success).toBe(true);
		expect(createResponse.body.data.title).toBe(uniqueTitle);

		const ticketId = createResponse.body.data.id as string;
		const deleteResponse = await request(app)
			.delete(`/api/tickets/${ticketId}`)
			.set('Authorization', `Bearer ${admin.accessToken}`);

		expect(deleteResponse.status).toBe(204);
	});

	it('forbids agent from deleting a ticket', async () => {
		const list = await request(app)
			.get('/api/tickets?page=1&limit=1')
			.set('Authorization', `Bearer ${admin.accessToken}`);

		expect(list.status).toBe(200);
		const ticketId = list.body.data[0]?.id;
		expect(ticketId).toBeDefined();

		const response = await request(app)
			.delete(`/api/tickets/${ticketId}`)
			.set('Authorization', `Bearer ${agent.accessToken}`);

		expect(response.status).toBe(403);
		expect(response.body.success).toBe(false);
	});

	it('forbids client from updating restricted fields (priority)', async () => {
		const createResponse = await request(app)
			.post('/api/tickets')
			.set('Authorization', `Bearer ${client.accessToken}`)
			.send({
				title: `Client Restricted Update ${Date.now()}`,
				description: 'Client-owned ticket for permission test',
				priority: 'LOW',
			});

		expect(createResponse.status).toBe(201);
		const ticketId = createResponse.body.data.id as string;

		const response = await request(app)
			.patch(`/api/tickets/${ticketId}`)
			.set('Authorization', `Bearer ${client.accessToken}`)
			.send({ priority: 'HIGH' });

		expect(response.status).toBe(403);
		expect(response.body.success).toBe(false);
		expect(response.body.message).toBe('Clients can only update title and description');
	});

	it('forbids agent from updating status on unrelated ticket', async () => {
		const createResponse = await request(app)
			.post('/api/tickets')
			.set('Authorization', `Bearer ${client.accessToken}`)
			.send({
				title: `Agent Forbidden Status ${Date.now()}`,
				description: 'Unassigned ticket should block unrelated agent',
				priority: 'MEDIUM',
			});

		expect(createResponse.status).toBe(201);
		const ticketId = createResponse.body.data.id as string;

		const response = await request(app)
			.patch(`/api/tickets/${ticketId}/status`)
			.set('Authorization', `Bearer ${agent.accessToken}`)
			.send({ status: 'RESOLVED' });

		expect(response.status).toBe(403);
		expect(response.body.success).toBe(false);
		expect(response.body.message).toBe('Forbidden');
	});

	it('forbids client from assigning tickets through assign endpoint', async () => {
		const createResponse = await request(app)
			.post('/api/tickets')
			.set('Authorization', `Bearer ${client.accessToken}`)
			.send({
				title: `Client Assign Forbidden ${Date.now()}`,
				description: 'Client cannot call assign endpoint',
				priority: 'LOW',
			});

		expect(createResponse.status).toBe(201);
		const ticketId = createResponse.body.data.id as string;

		const response = await request(app)
			.patch(`/api/tickets/${ticketId}/assign`)
			.set('Authorization', `Bearer ${client.accessToken}`)
			.send({ assignedToId: agent.user.id });

		expect(response.status).toBe(403);
		expect(response.body.success).toBe(false);
	});

	it('forbids client from commenting on unrelated ticket', async () => {
		const createResponse = await request(app)
			.post('/api/tickets')
			.set('Authorization', `Bearer ${admin.accessToken}`)
			.send({
				title: `Comment Forbidden ${Date.now()}`,
				description: 'Ticket created by admin for comment access check',
				priority: 'LOW',
			});

		expect(createResponse.status).toBe(201);
		const ticketId = createResponse.body.data.id as string;

		const response = await request(app)
			.post(`/api/tickets/${ticketId}/comments`)
			.set('Authorization', `Bearer ${client.accessToken}`)
			.send({ body: 'I should not be able to comment here' });

		expect(response.status).toBe(403);
		expect(response.body.success).toBe(false);
		expect(response.body.message).toBe('Forbidden');
	});
});
