module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    serviceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'services',
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
    scheduledDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    estimatedDuration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Duration in minutes',
    },
    location: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'confirmed',
        'in_progress',
        'completed',
        'cancelled',
        'disputed'
      ),
      defaultValue: 'pending',
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'refunded', 'failed'),
      defaultValue: 'pending',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cancellationReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'bookings',
    timestamps: true,
    indexes: [
      {
        fields: ['clientId'],
      },
      {
        fields: ['providerId'],
      },
      {
        fields: ['serviceId'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['scheduledDate'],
      },
      {
        fields: ['paymentStatus'],
      },
    ],
  });

  Booking.associate = (models) => {
    Booking.belongsTo(models.User, {
      foreignKey: 'clientId',
      as: 'client',
    });
    
    Booking.belongsTo(models.ServiceProvider, {
      foreignKey: 'providerId',
      as: 'provider',
    });
    
    Booking.belongsTo(models.Service, {
      foreignKey: 'serviceId',
      as: 'service',
    });
    
    Booking.hasOne(models.Payment, {
      foreignKey: 'bookingId',
      as: 'payment',
    });
    
    Booking.hasOne(models.Review, {
      foreignKey: 'bookingId',
      as: 'review',
    });
  };

  return Booking;
};