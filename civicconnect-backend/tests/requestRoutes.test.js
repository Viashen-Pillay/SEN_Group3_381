const request = require('supertest');
const app = require('../src/index');

describe('POST /api/v1/requests API Integration', () => {
    it('should reject a request with missing description', async () => {
        const response = await request(app)
            .post('/api/v1/requests')
            .send({ categoryId: 1 });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Category and description are required.");
    });
    it('should accept a valid service request', async () => {
        const response = await request(app)
            .post('/api/v1/requests')
            .send({ categoryId: 1, description: "Pothole on Main St" });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Service request submitted successfully");
        expect(response.body.request.status).toBe("Pending");
    });
});