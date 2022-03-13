const request = require('supertest');
const app = require('../index.js');

// Testing Express server.
describe('Welcope page API ', () =>
    it('GET / --> welcope page', () => {
        return request(app).get('/').expect(200);
    }));
