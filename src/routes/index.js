import { Router } from 'express';
import authRoutes from './authRoutes.js';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import profileRouter from './profileRoutes.js'

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
      }
    },
  },
    
  apis: ['./src/routes/*.js'],
};

const router = Router();

const jsdocSetup = swaggerJSDoc(options);
router.use('/docs', swaggerUi.serve, swaggerUi.setup(jsdocSetup));

router.use('/auth', authRoutes);
router.use("/profile", profileRouter);

export default router;
