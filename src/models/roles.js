'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Roles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
       Roles.hasMany(models.Users, {
        foreignKey: 'id_role',
        as: 'users'
      });
    }
  }
  Roles.init({
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },

    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Roles',
    tableName: 'roles',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
  );

  return Roles;
};