const { verifyToken } = require('../config/jwt');

const jwtAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1]; // Bearer
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ message: 'Token inválido' });
  }

  req.user = decoded;
  next();
};

module.exports = jwtAuth;