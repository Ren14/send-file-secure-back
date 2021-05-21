'use strict';

module.exports = (req, res, next) => {
  
  if (!req.headers.token)  return res.status(401).json({err: 'No Authorization header was found'});
  
  const token = req.headers.token;
  
  // TODO: obtener el token segun su forma correcta
  if (token.length <= 0) return res.status(401).json({err: 'Format is Authorization: Bearer [token]'});
  
  jwToken.verify(token, function (err, token) {
    if (err) return res.status(401).json({err: 'Invalid Token!'});
    req.token = token; // This is the decrypted token or the payload you provided    
    req.session.userId = req.token.id; // Asigno el ID del usuario logueado
    next();
  });
};