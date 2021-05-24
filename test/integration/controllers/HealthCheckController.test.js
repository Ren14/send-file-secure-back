const supertest = require('supertest');
const assert = require('assert');

describe('HealthCheck #getStatus()', () => {
  it('should return 200 if the server is healthy', (done) => {
    supertest(sails.hooks.http.app)
      .get('/api/health-check')
      .then(response => {
        assert(response.status, 200);
        done();
      });
  });
});
