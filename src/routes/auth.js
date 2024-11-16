const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Role = require('../models/Role');

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

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
    const { email, password } = req.body;

    const user = await User.findOne({ 
        where: { email },
        include: Role
    });

    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    const validPassword = await user.checkPassword(password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
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
  
router.get('/check-session', (req, res) => {
  if (req.session.userId) {
    res.json({ 
      logged: true, 
      role: req.session.userRole 
    });
  } else {
    res.json({ logged: false });
  }
});

module.exports = router;