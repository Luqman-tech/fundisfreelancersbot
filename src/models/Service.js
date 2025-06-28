module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define('Service', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    providerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'service_providers',
        key: 'id',
      },
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    priceType: {
      type: DataTypes.ENUM('fixed', 'hourly', 'negotiable'),
      defaultValue: 'fixed',
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Estimated duration in minutes',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    requirements: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'services',
    timestamps: true,
    indexes: [
      {
        fields: ['providerId'],
      },
      {
        fields: ['categoryId'],
      },
      {
        fields: ['isActive'],
      },
      {
        fields: ['price'],
      },
    ],
  });

  Service.associate = (models) => {
    Service.belongsTo(models.ServiceProvider, {
      foreignKey: 'providerId',
      as: 'provider',
    });
    
    Service.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'category',
    });
    
    Service.hasMany(models.Booking, {
      foreignKey: 'serviceId',
      as: 'bookings',
    });
  };

  return Service;
};