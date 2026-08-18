'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_categorie', {
      id_product: {
        type: Sequelize.BIGINT,
        allowNull: false,

        references: {
          model: 'products',
          key: 'id',
        },

        onDelete: 'CASCADE',
      },

      id_categorie: {
        type: Sequelize.BIGINT,
        allowNull: false,

        references: {
          model: 'categories',
          key: 'id',
        },

        onDelete: 'CASCADE',
      },
    });

    await queryInterface.addConstraint('product_categorie', {
      fields: ['id_product', 'id_categorie'],
      type: 'primary key',
      name: 'product_categorie_pkey',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('product_categorie');
  },
};