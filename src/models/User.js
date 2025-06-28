module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isNumeric: true,
        len: [10, 15],
      },
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 50],
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 50],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    role: {
      type: DataTypes.ENUM('client', 'provider', 'admin'),
      defaultValue: 'client',
    },
    lastSeen: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    preferences: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  }, {
    tableName: 'users',
    timestamps: true,
    indexes: [
      {
        fields: ['phoneNumber'],
      },
      {
        fields: ['email'],
      },
      {
        fields: ['role'],
      },
    ],
  });

  User.associate = (models) => {
    User.hasOne(models.ServiceProvider, {
      foreignKey: 'userId',
      as: 'providerProfile',
    });
    
    User.hasMany(models.Booking, {
      foreignKey: 'clientId',
      as: 'clientBookings',
    });
    
    User.hasMany(models.Review, {
      foreignKey: 'clientId',
      as: 'reviewsGiven',
    });
  };

  return User;
};