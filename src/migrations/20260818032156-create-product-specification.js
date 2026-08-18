'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_specification', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      id_product: {
        type: Sequelize.BIGINT,
        allowNull: false,

        references: {
          model: 'products',
          key: 'id',
        },

        onDelete: 'CASCADE',
      },

      key: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      value: {
        type: Sequelize.STRING(255),
        allowNull: false,
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
    await queryInterface.dropTable('product_specification');
  },
};