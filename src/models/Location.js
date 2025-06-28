module.exports = (sequelize, DataTypes) => {
  const Location = sequelize.define('Location', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('county', 'city', 'town', 'estate', 'area'),
      allowNull: false,
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'locations',
        key: 'id',
      },
    },
    coordinates: {
      type: DataTypes.GEOMETRY('POINT'),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'locations',
    timestamps: true,
    indexes: [
      {
        fields: ['name'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['parentId'],
      },
      {
        fields: ['coordinates'],
        using: 'gist',
      },
    ],
  });

  Location.associate = (models) => {
    Location.hasMany(models.Location, {
      foreignKey: 'parentId',
      as: 'children',
    });
    
    Location.belongsTo(models.Location, {
      foreignKey: 'parentId',
      as: 'parent',
    });
    
    Location.hasMany(models.ServiceProvider, {
      foreignKey: 'locationId',
      as: 'providers',
    });
  };

  return Location;
};