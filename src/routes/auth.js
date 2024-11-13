const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario_existente = await User.findOne({ where: { email } });
    if (usuario_existente) {
      return res.status(400).json({ message: 'El email ya esta registrado' });
    }

    const newUser = await User.create({
      email,
      password 
    });

    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    // por ahora comparacion simple
    if (user.password !== password) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    res.json({ message: 'Login exitoso' });
  } catch (error) {
    res.status(500).json({ message: 'Error' });
  }
});

module.exports = router;