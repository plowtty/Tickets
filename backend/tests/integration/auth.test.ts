import request from 'supertest';
import app from '../../src/app';

describe('Auth Integration', () => {
	const credentials = {
		email: 'admin@helpdesk.com',
		password: 'Password123',
	};

	it('logs in successfully and returns access token + refresh cookie', async () => {
		const response = await request(app).post('/api/auth/login').send(credentials);

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(response.body.data.user.email).toBe(credentials.email);
		expect(typeof response.body.data.accessToken).toBe('string');
		expect(response.headers['set-cookie']).toBeDefined();
		expect(response.headers['set-cookie'][0]).toContain('refreshToken=');
	});

	it('rejects /me when no bearer token is provided', async () => {
		const response = await request(app).get('/api/auth/me');

		expect(response.status).toBe(401);
		expect(response.body.success).toBe(false);
		expect(response.body.message).toBe('No token provided');
	});

	it('returns current user with valid bearer token', async () => {
		const login = await request(app).post('/api/auth/login').send(credentials);
		const token = login.body.data.accessToken;

		const response = await request(app)
			.get('/api/auth/me')
			.set('Authorization', `Bearer ${token}`);

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(response.body.data.email).toBe(credentials.email);
		expect(response.body.data).not.toHaveProperty('password');
	});

	it('refreshes token when refresh cookie is present', async () => {
		const agent = request.agent(app);

		const login = await agent.post('/api/auth/login').send(credentials);
		expect(login.status).toBe(200);

		const refreshed = await agent.post('/api/auth/refresh').send();

		expect(refreshed.status).toBe(200);
		expect(refreshed.body.success).toBe(true);
		expect(typeof refreshed.body.data.accessToken).toBe('string');
	});

	it('rejects refresh when cookie is missing', async () => {
		const response = await request(app).post('/api/auth/refresh').send();

		expect(response.status).toBe(401);
		expect(response.body.success).toBe(false);
		expect(response.body.message).toBe('No refresh token provided');
	});

	it('rejects refresh when cookie token is invalid or expired', async () => {
		const response = await request(app)
			.post('/api/auth/refresh')
			.set('Cookie', ['refreshToken=invalid-token-value'])
			.send();

		expect(response.status).toBe(401);
		expect(response.body.success).toBe(false);
		expect(response.body.message).toBe('Invalid or expired refresh token');
	});

	it('locks login attempts after repeated invalid credentials', async () => {
		const invalidPayload = {
			email: `lock-${Date.now()}@example.com`,
			password: 'WrongPassword123',
		};

		for (let attempt = 0; attempt < 5; attempt += 1) {
			const response = await request(app).post('/api/auth/login').send(invalidPayload);
			expect(response.status).toBe(401);
		}

		const blocked = await request(app).post('/api/auth/login').send(invalidPayload);

		expect(blocked.status).toBe(429);
		expect(blocked.body.success).toBe(false);
		expect(blocked.body.message).toBe('Too many failed login attempts. Please try again later.');
		expect(blocked.headers['retry-after']).toBeDefined();
	});
});
