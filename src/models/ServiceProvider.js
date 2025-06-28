module.exports = (sequelize, DataTypes) => {
  const ServiceProvider = sequelize.define('ServiceProvider', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    businessName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    experience: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 50,
      },
    },
    hourlyRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    availability: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    skills: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    portfolio: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5,
      },
    },
    totalReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    completedJobs: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    responseTime: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Average response time in minutes',
    },
    locationId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'locations',
        key: 'id',
      },
    },
  }, {
    tableName: 'service_providers',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['isVerified'],
      },
      {
        fields: ['isActive'],
      },
      {
        fields: ['rating'],
      },
      {
        fields: ['locationId'],
      },
    ],
  });

  ServiceProvider.associate = (models) => {
    ServiceProvider.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    
    ServiceProvider.belongsTo(models.Location, {
      foreignKey: 'locationId',
      as: 'location',
    });
    
    ServiceProvider.hasMany(models.Service, {
      foreignKey: 'providerId',
      as: 'services',
    });
    
    ServiceProvider.hasMany(models.Booking, {
      foreignKey: 'providerId',
      as: 'bookings',
    });
    
    ServiceProvider.hasMany(models.Review, {
      foreignKey: 'providerId',
      as: 'reviews',
    });
  };

  return ServiceProvider;
};