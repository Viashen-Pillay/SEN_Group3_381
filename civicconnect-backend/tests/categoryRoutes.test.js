const request = require('supertest');
const app = require('../src/index');

jest.mock('../src/config/database', () => ({
    query: jest.fn().mockResolvedValue({
        rows: [
            { category_id: 1, name: 'Roads & Potholes' },
            { category_id: 2, name: 'Water & Sanitation' }
        ]
    })
}));

describe('Categories API Integration', () => {
    it('should retrieve all categories successfully (Positive Test)', async () => {
        const response = await request(app).get('/api/v1/categories');
        
        expect(response.status).toBe(200);
        expect(response.body.categories).toBeInstanceOf(Array);
        expect(response.body.categories.length).toBe(2);
        expect(response.body.categories[0].name).toBe('Roads & Potholes');
    });
});