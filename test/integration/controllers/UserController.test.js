var supertest = require('supertest');
var assert = require('assert');
describe('UserController.add', function () {

    describe('#add()', function () {
        it('should return token', function (done) {
            supertest(sails.hooks.http.app)
                .post('/api/v1/user')
                .send({ email: 'renn.carp@gmail.com', password: '123456' })
                .then(response => {
                    assert(response.body.status, 'success')
                    done();
                })
                .catch(err => done(err))

        });
    });

    describe('#login()', function () {
        it('should return token', function (done) {
            supertest(sails.hooks.http.app)
                .post('/api/v1/user/login')
                .send({ email: 'renn.carp@gmail.com', password: '123456' })
                .then(response => {                    
                    assert(response.body.status, 'success')                    
                    done();
                })
                .catch(err => done(err))

        });
    });

});