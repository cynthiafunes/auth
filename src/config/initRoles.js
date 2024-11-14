const Role = require('../models/Role');

const initRoles = async () => {
  try {
    const roles = await Role.bulkCreate([
      { name: 'user' },
      { name: 'admin' }
    ], {
      ignoreDuplicates: true
    });

    console.log('Roles inicializados correctamente');
    return roles;
  } catch (error) {
    console.error('Error al inicializar roles:', error);
  }
};

module.exports = initRoles;