const request = require('supertest');
const app = require('../src/index');
const bcrypt = require('bcryptjs');

const mockValidPasswordHash = bcrypt.hashSync('password123', 10);

jest.mock('../src/config/database', () => ({
    query: jest.fn((query, values) => {
        
        if (query.includes('INSERT INTO users') && values[1] === 'duplicate@test.com') {
            const error = new Error();
            error.code = '23505';
            return Promise.reject(error);
        }
        
        if (query.includes('INSERT INTO users')) {
            return Promise.resolve({ rows: [{ user_id: 1, name: values[0], email: values[1], role: values[3] }] });
        }
      
        if (query.includes('SELECT * FROM users') && values[0] === 'valid@test.com') {
            return Promise.resolve({ 
                rows: [{ 
                    user_id: 1, 
                    name: 'Valid User',
                    email: 'valid@test.com', 
                    password_hash: mockValidPasswordHash, 
                    role: 'Requester' 
                }] 
            });
        }
        
        if (query.includes('SELECT * FROM users')) {
            return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
    })
}));

describe('Users API Integration', () => {
    it('should register a new user successfully', async () => {
        const response = await request(app)
            .post('/api/v1/users/register')
            .send({ name: "Jane Doe", email: "new@test.com", password: "secure123" });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe("User registered successfully");
    });

    it('should reject registration if email exists', async () => {
        const response = await request(app)
            .post('/api/v1/users/register')
            .send({ name: "John Doe", email: "duplicate@test.com", password: "secure123" });

        expect(response.status).toBe(409);
        expect(response.body.error).toBe("Email already exists.");
    });

    it('should login a user with correct credentials', async () => {
        const response = await request(app)
            .post('/api/v1/users/login')
            .send({ email: "valid@test.com", password: "password123" });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Login successful");
    });

    it('should reject login with incorrect credentials', async () => {
        const response = await request(app)
            .post('/api/v1/users/login')
            .send({ email: "valid@test.com", password: "wrongpassword" });

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Invalid email or password.");
    });
});