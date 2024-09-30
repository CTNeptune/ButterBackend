const Movie = sequelize.define('Movie', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  formats: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  is3D: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  devicesRequiredFor3D: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  tags: {
    type: DataTypes.JSON,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  userId: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  catalogId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Catalogs',
      key: 'id'
    }
  }
});

module.exports = Movie;
