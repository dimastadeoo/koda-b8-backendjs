import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewsController.js";

const router = Router();

// Semua route memerlukan autentikasi
router.use(authenticate);

router.post("/", createReview);
router.patch("/:id", updateReview);
router.delete("/:id", deleteReview);

export default router;