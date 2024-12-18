const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');
const Role = require('./Role');

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  loginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isBlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  blockedUntil: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

User.belongsTo(Role);
Role.hasMany(User);

User.beforeCreate(async (user) => {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  });

User.prototype.checkPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User;