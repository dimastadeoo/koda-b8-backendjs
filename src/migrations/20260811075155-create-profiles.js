'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('profiles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },

      id_user: {
        allowNull: false,
        unique: true,
        type: Sequelize.BIGINT,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },

      name: {
        allowNull: false,
        type: Sequelize.STRING(150)
      },

      gender: {
        allowNull: true,
        type: Sequelize.STRING(10)
      },

      picture: {
        allowNull: true,
        type: Sequelize.STRING(255)
      },

      place_birth: {
        allowNull: true,
        type: Sequelize.STRING(100)
      },

      date_birth: {
        allowNull: true,
        type: Sequelize.DATE
      },

      created_at: {
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
        type: Sequelize.DATE
      },

      updated_at: {
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('profiles');
  }
};