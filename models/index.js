
const User = require('./user');
const Catalog = require('./catalog');
const Movie = require('./movie');

User.hasMany(Catalog, { foreignKey: 'userId', as: 'catalogs' });
Catalog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Catalog.hasMany(Movie, { foreignKey: 'catalogId', as: 'movies' });
Movie.belongsTo(Catalog, { foreignKey: 'catalogId', as: 'catalog' });

module.exports = { sequelize, User, Catalog, Movie };
