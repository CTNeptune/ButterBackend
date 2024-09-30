const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tokenVersion: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

module.exports = User;