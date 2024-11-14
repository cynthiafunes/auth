const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Role = require('../models/Role');

router.post('/register', async (req, res) => {
  try {
    const { email, password, isAdmin } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya esta registrado' });
    }

    const role = await Role.findOne({ 
        where: { 
          name: isAdmin ? 'admin' : 'user' 
        } 
      });
  
      if (!role) {
        return res.status(500).json({ message: 'Error al asignar rol' });
      }

    const newUser = await User.create({
      email,
      password,
      RoleId: role.id
    });

    res.status(201).json({ 
        message: 'Usuario registrado exitosamente',
        role: role.name 
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

    res.json({ 
        message: 'Login exitoso',
        role: user.Role.name
     });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;