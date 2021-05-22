/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

 const bcrypt = require('bcrypt');

 module.exports = {
 
   attributes: {
 
     //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
     //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
     //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
    email: {
       type: 'string',
       required: true,
       unique: true,
       isEmail: true,
       maxLength: 200,
       example: 'mary.sue@example.com'
     },
 
     password: {
       type: 'string',
       required: true,
       description: 'Securely hashed representation of the user\'s login password.',
       protect: true,
       example: '2$28a8eabna301089103-13948134nad'
     },
 
     emailStatus: {
       type: 'string',
       isIn: ['unconfirmed', 'change-requested', 'confirmed'],
       defaultsTo: 'confirmed',
       description: 'The confirmation status of the user\'s email address.',
       extendedDescription:
       `Users might be created as "unconfirmed" (e.g. normal signup) or as "confirmed" (e.g. hard-coded
       admin users).  When the email verification feature is enabled, new users created via the
       signup form have \`emailStatus: 'unconfirmed'\` until they click the link in the confirmation email.
       Similarly, when an existing user changes their email address, they switch to the "change-requested"
       email status until they click the link in the confirmation email.`
     },
 
     emailProofToken: {
       type: 'string',
       description: 'A pseudorandom, probabilistically-unique token for use in our account verification emails.'
     },
 
     emailProofTokenExpiresAt: {
       type: 'number',
       description: 'A JS timestamp (epoch ms) representing the moment when this user\'s `emailProofToken` will expire (or 0 if the user currently has no such token).',
       example: 1502844074211
     },
 
     encryptedPassword : {
       type: 'string',
     },
 
     //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
     //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
     //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝
 
 
     //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
     //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
     //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    
 
   },
 
   // Here we encrypt password before creating a User
   beforeCreate(values, next) {
     bcrypt.genSalt(10, (err, salt) => {
       if (err) {
         sails.log.error(err);
         return next();
       }
 
       bcrypt.hash(values.password, salt, (err, hash) => {
         if (err) {
           sails.log.error(err);
           return next();
         }
         values.encryptedPassword = hash; // Here is our encrypted password
         return next();
       });
     });
   },
 
   comparePassword(password, encryptedPassword) {
 
     return new Promise(function (resolve, reject) {
       bcrypt.compare(password, encryptedPassword, (err, match) => {
         if (err) {
           sails.log.error(err);
           return reject("Something went wrong!");
         }
         if (match) return resolve();
         else return reject("Mismatch passwords");
       });
     });
   }
 
 };
 