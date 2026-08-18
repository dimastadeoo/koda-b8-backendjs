'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },

      price: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      id_merk: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'merks',
          key: 'id',
        },
      },

      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      description: {
        type: Sequelize.TEXT,
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

    // CHECK price >= 0
    await queryInterface.addConstraint('products', {
      fields: ['price'],
      type: 'check',
      where: {
        price: {
          [Sequelize.Op.gte]: 0,
        },
      },
      name: 'products_price_check',
    });

    // CHECK stock >= 0
    await queryInterface.addConstraint('products', {
      fields: ['stock'],
      type: 'check',
      where: {
        stock: {
          [Sequelize.Op.gte]: 0,
        },
      },
      name: 'products_stock_check',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('products');
  },
};