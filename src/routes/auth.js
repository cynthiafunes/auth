const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Role = require('../models/Role');
const { generateToken } = require('../config/jwt');
const jwtAuth = require('../middleware/jwtAuth');

const MAX_LOGIN_ATTEMPTS = 3;
const BLOCK_DURATION = 10 * 60 * 1000;

router.post('/register', async (req, res) => {
  try {
    //console.log('Body recibido:', req.body);

    const { email, password, useJWT } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya esta registrado' });
    }

    const userRole = await Role.findOne({ 
        where: { name: 'user' } 
    });
  
    if (!userRole) {
        return res.status(500).json({ message: 'Error al asignar rol' });
    }

    const newUser = await User.create({
      email,
      password,
      RoleId: userRole.id
    });

    if (useJWT) {
      const token = generateToken({ ...newUser.toJSON(), Role: userRole });
      return res.status(201).json({ 
        message: 'Usuario registrado exitosamente',
        role: userRole.name,
        token
      });
    }

    req.session.userId = newUser.id;
    req.session.userRole = userRole.name;

    res.status(201).json({ 
        message: 'Usuario registrado exitosamente',
        role: userRole.name 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar al usuario' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, useJWT } = req.body;

    const user = await User.findOne({ 
        where: { email },
        include: Role
    });

    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    if (user.isBlocked && user.blockedUntil > new Date()) {
      const remainingTime = Math.ceil((user.blockedUntil - new Date()) / 1000 / 60);
      return res.status(403).json({ 
        message: `Cuenta bloqueada. Intenta de nuevo en ${remainingTime} minutos` 
      });
    }

    if (user.isBlocked && user.blockedUntil <= new Date()) {
      user.isBlocked = false;
      user.loginAttempts = 0;
      await user.save();
    }

    const validPassword = await user.checkPassword(password);
    if (!validPassword) {
      user.loginAttempts += 1;

      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.isBlocked = true;
        user.blockedUntil = new Date(Date.now() + BLOCK_DURATION);
        await user.save();
        
        return res.status(403).json({ 
          message: 'Cuenta bloqueada. Por favor, intenta más tarde.' 
        });
      }

      await user.save();

      return res.status(400).json({ 
        message: `Contraseña incorrecta. Te quedan ${MAX_LOGIN_ATTEMPTS - user.loginAttempts} intentos` 
      });
    }

    user.loginAttempts = 0;
    user.isBlocked = false;
    user.blockedUntil = null;
    await user.save();

    if (useJWT) {
      const token = generateToken(user);
      return res.json({ 
        message: 'Login exitoso',
        role: user.Role.name,
        token
      });
    }

    req.session.userId = user.id;
    req.session.userRole = user.Role.name;

    res.json({ 
        message: 'Login exitoso',
        role: user.Role.name
     });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error al cerrar sesión' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Sesión cerrada exitosamente' });
  });
});

module.exports = router;