'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Profiles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Profiles.belongsTo(models.Users, {
        foreignKey: 'id_user',
        as: 'user'
      });
    }
  }
  Profiles.init({
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },

    id_user: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },

    gender: {
      type: DataTypes.STRING(10),
      allowNull: true
    },

    picture: {
      type: DataTypes.STRING(255),
      allowNull: true
    },

    place_birth: {
      type: DataTypes.STRING(100),
      allowNull: true
    },

    date_birth: {
      type: DataTypes.DATE,
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
  },{
    sequelize,
    modelName: 'Profiles',
    tableName: 'profiles',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Profiles;
};