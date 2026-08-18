'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('address', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      id_profile: {
        type: Sequelize.BIGINT,
        allowNull: false,

        references: {
          model: 'profiles',
          key: 'id',
        },

        onDelete: 'CASCADE',
      },

      label: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },

      receiver_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      detail_address: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      province: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      city: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      district: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      village: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      is_primary: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('address');
  },
};