const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY

const cifrarDatos = (texto) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let cifrado = cipher.update(texto, 'utf8', 'hex');
  cifrado += cipher.final('hex');
  return `${iv.toString('hex')}:${cifrado}`;
};

const generateToken = (user) => {
  const emailCifrado = cifrarDatos(user.email);

  //console.log('Email cifrado:', emailCifrado);

  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      role: user.Role.name 
    }, 
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken
};