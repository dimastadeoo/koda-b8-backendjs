import { Router } from 'express';
import authRoutes from './authRoutes.js';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import profileRouter from './profileRoutes.js'
import addressRouter from './addressRoutes.js'
import productRouter from './productsRoutes.js'
import reviewsRouter from './reviewsRoutes.js'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Notes App Backend',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        token: {
          type: "apiKey",
          name: "Authorization",
          in: "header"
        }
      },
      schemas: {
        Address: {
          type: "object",
          properties: {
            id: { type: "integer" },
            id_profile: { type: "integer" },
            label: { type: "string", nullable: true },
            receiver_name: { type: "string" },
            detail_address: { type: "string" },
            province: { type: "string" },
            city: { type: "string" },
            district: { type: "string" },
            village: { type: "string" },
            is_primary: { type: "boolean" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" }
          }
        },
        Product:{
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            price: { type: "integer" },
            stock: { type: "integer" },
            description: { type: "string", nullable: true },
            merk: {
              type: "object",
              properties: {
                id: { type: "integer" },
                name: { type: "string" }
              }
            },
            categories: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  name: { type: "string" }
                }
              }
            },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" }
          },
          required: ["id", "name", "price", "stock", "merk", "categories", "created_at", "updated_at"]

        },
        Specification: {
          type: "object",
          properties: {
            key: { type: "string" },
            value: { type: "string" }
          }
        },
        ProductDetail: {
          type: "object",
          allOf: [
            { $ref: '#/components/schemas/Product' },
            {
              properties: {
                specifications: {
                  type: "array",
                  items: { $ref: '#/components/schemas/Specification' }
                }
              }
            }
          ]
        }
      },
    }
  },
    
  apis: ['./src/routes/*.js'],
};

const router = Router();

const jsdocSetup = swaggerJSDoc(options);
router.use('/docs', swaggerUi.serve, swaggerUi.setup(jsdocSetup));

router.use('/auth', authRoutes);
router.use("/profile", profileRouter);
router.use("/addresses", addressRouter);
router.use('/products', productRouter);
router.use('/reviews', reviewsRouter);


export default router;
