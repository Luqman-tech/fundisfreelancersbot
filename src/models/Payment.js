module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
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
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'KES',
    },
    method: {
      type: DataTypes.ENUM('mpesa', 'card', 'bank_transfer', 'cash'),
      defaultValue: 'mpesa',
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'refunded'),
      defaultValue: 'pending',
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    mpesaReceiptNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    providerAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Amount after platform commission',
    },
    platformFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    failureReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  }, {
    tableName: 'payments',
    timestamps: true,
    indexes: [
      {
        fields: ['bookingId'],
      },
      {
        fields: ['transactionId'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['method'],
      },
    ],
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.Booking, {
      foreignKey: 'bookingId',
      as: 'booking',
    });
  };

  return Payment;
};