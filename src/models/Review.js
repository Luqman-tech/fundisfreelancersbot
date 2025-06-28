module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    bookingId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'bookings',
        key: 'id',
      },
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    providerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'service_providers',
        key: 'id',
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'reviews',
    timestamps: true,
    indexes: [
      {
        fields: ['bookingId'],
        unique: true,
      },
      {
        fields: ['clientId'],
      },
      {
        fields: ['providerId'],
      },
      {
        fields: ['rating'],
      },
    ],
  });

  Review.associate = (models) => {
    Review.belongsTo(models.Booking, {
      foreignKey: 'bookingId',
      as: 'booking',
    });
    
    Review.belongsTo(models.User, {
      foreignKey: 'clientId',
      as: 'client',
    });
    
    Review.belongsTo(models.ServiceProvider, {
      foreignKey: 'providerId',
      as: 'provider',
    });
  };

  return Review;
};