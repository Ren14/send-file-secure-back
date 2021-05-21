'use strict';

const jwt = require('jsonwebtoken'),
      tokenSecret = "mamahuevomamahuevomamahuevo";

module.exports = {
  // Generates a token from supplied payload
  issue(payload) {
    return jwt.sign(
      payload,
      tokenSecret, // Token Secret that we sign it with
      {
        expiresIn: "30 days" // Token Expire time
      });
  },

  // Verifies token on a request
  verify(token, callback) {
    return jwt.verify(
      token, // The token to be verified
      tokenSecret, // Same token we used to sign
      {}, // No Option, for more see https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
      callback //Pass errors or decoded token to callback
    );
  }
};