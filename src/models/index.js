const { Sequelize } = require('sequelize');
const config = require('../config/database')[process.env.NODE_ENV || 'development'];

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Import models
const User = require('./User')(sequelize, Sequelize.DataTypes);
const ServiceProvider = require('./ServiceProvider')(sequelize, Sequelize.DataTypes);
const Service = require('./Service')(sequelize, Sequelize.DataTypes);
const Booking = require('./Booking')(sequelize, Sequelize.DataTypes);
const Payment = require('./Payment')(sequelize, Sequelize.DataTypes);
const Review = require('./Review')(sequelize, Sequelize.DataTypes);
const Category = require('./Category')(sequelize, Sequelize.DataTypes);
const Location = require('./Location')(sequelize, Sequelize.DataTypes);

// Define associations
const models = {
  User,
  ServiceProvider,
  Service,
  Booking,
  Payment,
  Review,
  Category,
  Location,
};

// Set up associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;