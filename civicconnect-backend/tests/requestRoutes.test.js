const request = require('supertest');
const app = require('../src/index');

jest.mock('../src/config/database', () => {
    const mClient = {
        query: jest.fn((query, values) => {
            if (query.includes('SELECT status FROM service_requests')) {
                if (values[0] == 999) return Promise.resolve({ rows: [] }); 
                return Promise.resolve({ rows: [{ status: 'NEW' }] }); 
            }
            return Promise.resolve({ rows: [{ request_id: 1, status: 'NEW', title: 'Pothole' }] });
        }),
        release: jest.fn(),
    };
    return {
        query: jest.fn().mockResolvedValue({ rows: [{ request_id: 1, status: 'NEW', title: 'Pothole' }] }),
        connect: jest.fn().mockResolvedValue(mClient)
    };
});

jest.mock('../src/services/WorkflowStateService', () => ({
    isValidTransition: jest.fn((current, target) => {
        if (current === 'Pending' && target === 'In Progress') return true;
        return false;
    })
}));

describe('Service Requests API Integration', () => {
    it('should reject a request with missing fields (Negative Test)', async () => {
        const response = await request(app)
            .post('/api/v1/requests')
            .send({ categoryId: 1 });
        expect(response.status).toBe(400);
    });

    it('should accept a valid service request (Positive Test)', async () => {
        const response = await request(app)
            .post('/api/v1/requests')
            .send({ requesterId: 1, categoryId: 1, title: "Pothole", description: "Main St" });
        expect(response.status).toBe(201);
    });

    it('should retrieve the service requests queue (GET /api/v1/requests)', async () => {
        const response = await request(app).get('/api/v1/requests');
        expect(response.status).toBe(200);
    });

    it('should update ticket status successfully', async () => {
        const response = await request(app)
            .patch('/api/v1/requests/1/status')
            .send({ newStatus: "In Progress", changedBy: 2 });
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Status updated successfully");
    });

    it('should reject invalid state transition', async () => {
        const response = await request(app)
            .patch('/api/v1/requests/1/status')
            
            .send({ newStatus: "Resolved", changedBy: 2 }); 
        
        expect(response.status).toBe(400);
        expect(response.body.error).toContain("Invalid transition");
    });

    it('should return 404 for non-existent ticket', async () => {
        const response = await request(app)
            .patch('/api/v1/requests/999/status')
            .send({ newStatus: "In Progress", changedBy: 2 });
        
        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Service request not found.");
    });
    it('should assign a staff member successfully', async () => {
        const response = await request(app)
            .post('/api/v1/requests/1/assign')
            .send({ assignedTo: 3, assignedBy: 2 }); 
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Staff member assigned successfully.");
    });

    it('should reject assignment if missing parameters', async () => {
        const response = await request(app)
            .post('/api/v1/requests/1/assign')
            .send({ assignedTo: 3 }); 
        
        expect(response.status).toBe(400);
        expect(response.body.error).toContain("required");
    });
});