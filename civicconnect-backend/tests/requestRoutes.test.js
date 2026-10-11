const request = require('supertest');
const app = require('../src/index');

jest.mock('../src/config/database', () => ({
    query: jest.fn().mockResolvedValue({
        rows: [{ request_id: 1, status: 'NEW', title: 'Pothole' }]
    })
}));

describe('Service Requests API Integration', () => {
    it('should reject a request with missing fields', async () => {
        const response = await request(app)
            .post('/api/v1/requests')
            .send({ categoryId: 1 }); 

        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
    });

    it('should accept a valid service request', async () => {
        const response = await request(app)
            .post('/api/v1/requests')
            .send({ requesterId: 1, categoryId: 1, title: "Pothole", description: "Main St" });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Service request submitted successfully");
    });

    it('should retrieve the service requests queue', async () => {
        const response = await request(app)
            .get('/api/v1/requests');

        expect(response.status).toBe(200);
        expect(response.body.requests).toBeInstanceOf(Array);
    });
});