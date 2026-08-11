'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      
      // User memiliki satu Role
      Users.belongsTo(models.Roles, {
        foreignKey: 'id_role',
        as: 'role'
      });

      // User dibuat oleh User lain
      Users.belongsTo(models.Users, {
        foreignKey: 'created_by',
        as: 'creator'
      });

      // User dapat membuat banyak User lain
      Users.hasMany(models.Users, {
        foreignKey: 'created_by',
        as: 'createdUsers'
      });

      // Users memiliki satu profile
      Users.hasOne(models.Profiles, {
        foreignKey: 'id_user',
        as: 'profile'
      });
    }
  }

  Users.init({
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },

    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    id_role: {
      type: DataTypes.BIGINT,
      allowNull: true
    },

    created_by: {
      type: DataTypes.BIGINT,
      allowNull: true
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
    modelName: 'Users',
    tableName: 'users',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Users;
};