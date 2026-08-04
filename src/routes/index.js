import { Router } from 'express';
import authRoutes from './authRoutes.js';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import profileRouter from './profileRoutes.js'
import addressRouter from './addressRoutes.js'

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


export default router;
