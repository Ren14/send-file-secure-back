/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  //  ╔═╗╔═╗╦  ╔═╗╔╗╔╔╦╗╔═╗╔═╗╦╔╗╔╔╦╗╔═╗
  //  ╠═╣╠═╝║  ║╣ ║║║ ║║╠═╝║ ║║║║║ ║ ╚═╗
  //  ╩ ╩╩  ╩  ╚═╝╝╚╝═╩╝╩  ╚═╝╩╝╚╝ ╩ ╚═╝


  //=========================================================
  //===================== IPFS ==============================
  //=========================================================
  'POST   /api/v1/ipfs/upload-encrypted-file':            'IpfsController.uploadEncryptedFile',
  'POST   /api/v1/ipfs/download-file':                    'IpfsController.downloadFile',

  //=========================================================
  //===================== FILE MANAGEMENT ===================
  //=========================================================
  'POST   /api/v1/file-management/upload-file':           'FileManagementController.uploadFile',

  //=========================================================
  //===================== CRYPTOGRAPHY ======================
  //=========================================================
  'GET    /api/v1/cryptography/generate-keys':           'CryptographyController.generateKeys',
  'POST   /api/v1/cryptography/encrypt-file':            'CryptographyController.encryptFile',
  'POST   /api/v1/cryptography/decrypt-file':            'CryptographyController.decryptFile',
  'POST   /api/v1/cryptography/sign-file':               'CryptographyController.signFile',
  'POST   /api/v1/cryptography/verify-sign-file':        'CryptographyController.verifySignFile',
  'POST   /api/v1/cryptography/hash-file':               'CryptographyController.hashFile',

  //=========================================================
  //===================== TIME STAMP ========================
  //=========================================================
  'POST   /api/v1/time-stamp/stamp':                     'TimeStampController.stamp',
  'POST   /api/v1/time-stamp/verify':                    'TimeStampController.verify',

  //=========================================================
  //===================== USER ==============================
  //=========================================================
  'POST   /api/v1/user/login' : 'UserController.login',
  'POST   /api/v1/user' : 'UserController.add',
  'POST   /api/v1/user/validarToken' : 'UserController.validarToken',


  //=========================================================
  //===================== EMAIL==============================
  //=========================================================
  'POST   /api/v1/email/send' : 'EmailController.send',

  //=========================================================
  //===================== HEALTH CHECK ======================
  //=========================================================
  'GET /api/health-check' : 'HealthCheckController.getStatus',
};
