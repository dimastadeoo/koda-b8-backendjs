'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('img_product', {
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

      url_img: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      is_primary: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      alt_text: {
        type: Sequelize.STRING(255),
        allowNull: true,
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
    await queryInterface.dropTable('img_product');
  },
};