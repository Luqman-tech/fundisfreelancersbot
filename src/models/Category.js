module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    tableName: 'categories',
    timestamps: true,
    indexes: [
      {
        fields: ['name'],
      },
      {
        fields: ['parentId'],
      },
      {
        fields: ['isActive'],
      },
    ],
  });

  Category.associate = (models) => {
    Category.hasMany(models.Category, {
      foreignKey: 'parentId',
      as: 'subcategories',
    });
    
    Category.belongsTo(models.Category, {
      foreignKey: 'parentId',
      as: 'parent',
    });
    
    Category.hasMany(models.Service, {
      foreignKey: 'categoryId',
      as: 'services',
    });
  };

  return Category;
};