import * as reviewModel from "../models/reviewsModels.js";
import * as Response from "../lib/response.js";
import { constants } from "node:http2";

/**
 * POST /reviews
 * Create a new review
 */
export async function createReview(req, res) {
  try {
    const userId = req.user.userId;
    const { productId, stars, review } = req.body;

    // Validasi
    if (!productId || !stars) {
      return Response.errorResponse(
        res,
        'productId and stars are required',
        constants.HTTP_STATUS_BAD_REQUEST
      );
    }
    if (stars < 1 || stars > 5) {
      return Response.errorResponse(
        res,
        'stars must be between 1 and 5',
        constants.HTTP_STATUS_BAD_REQUEST
      );
    }

    // Cek apakah user sudah pernah review produk ini
    const alreadyReviewed = await reviewModel.hasUserReviewed(productId, userId);
    if (alreadyReviewed) {
      return Response.errorResponse(
        res,
        'You have already reviewed this product',
        constants.HTTP_STATUS_BAD_REQUEST
      );
    }

    const newReview = await reviewModel.createReview(
      productId,
      userId,
      stars,
      review || null
    );

    Response.successResponse(
      res,
      'Review created successfully',
      newReview,
      constants.HTTP_STATUS_CREATED
    );
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to create review', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}

/**
 * PATCH /reviews/:id
 * Update a review
 */
export async function updateReview(req, res) {
  try {
    const userId = req.user.userId;
    const reviewId = parseInt(req.params.id, 10);
    if (isNaN(reviewId)) {
      return Response.errorResponse(res, 'Invalid review ID', constants.HTTP_STATUS_BAD_REQUEST);
    }

    const { stars, review } = req.body;
    if (!stars && !review) {
      return Response.errorResponse(
        res,
        'At least one field (stars or review) must be provided',
        constants.HTTP_STATUS_BAD_REQUEST
      );
    }
    if (stars && (stars < 1 || stars > 5)) {
      return Response.errorResponse(
        res,
        'stars must be between 1 and 5',
        constants.HTTP_STATUS_BAD_REQUEST
      );
    }

    // Ambil data review lama
    const existing = await reviewModel.getReviewById(reviewId);
    if (!existing) {
      return Response.errorResponse(res, 'Review not found', constants.HTTP_STATUS_NOT_FOUND);
    }

    // Pastikan user adalah pemilik review
    if (existing.id_user !== userId) {
      return Response.errorResponse(
        res,
        'You are not authorized to update this review',
        constants.HTTP_STATUS_FORBIDDEN
      );
    }

    // Update
    const updated = await reviewModel.updateReview(
      reviewId,
      stars || existing.stars,
      review !== undefined ? review : existing.review
    );

    Response.successResponse(res, 'Review updated successfully', updated);
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to update review', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}

/**
 * DELETE /reviews/:id
 * Delete a review
 */
export async function deleteReview(req, res) {
  try {
    const userId = req.user.userId;
    const reviewId = parseInt(req.params.id, 10);
    if (isNaN(reviewId)) {
      return Response.errorResponse(res, 'Invalid review ID', constants.HTTP_STATUS_BAD_REQUEST);
    }

    const existing = await reviewModel.getReviewById(reviewId);
    if (!existing) {
      return Response.errorResponse(res, 'Review not found', constants.HTTP_STATUS_NOT_FOUND);
    }

    if (existing.id_user !== userId) {
      return Response.errorResponse(
        res,
        'You are not authorized to delete this review',
        constants.HTTP_STATUS_FORBIDDEN
      );
    }

    await reviewModel.deleteReview(reviewId);

    Response.successResponse(res, 'Review deleted successfully', null);
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to delete review', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}

/**
 * GET /products/:id/reviews
 * Get all reviews for a product (public)
 */
export async function getProductReviews(req, res) {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      return Response.errorResponse(res, 'Invalid product ID', constants.HTTP_STATUS_BAD_REQUEST);
    }

    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    const reviews = await reviewModel.getReviewsByProduct(productId, limitNum, offset);
    const stats = await reviewModel.getProductRatingStats(productId);

    Response.successResponse(res, 'Reviews retrieved successfully', {
      reviews,
      stats: {
        avg_rating: parseFloat(stats.avg_rating),
        total_reviews: parseInt(stats.total_reviews, 10),
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to get reviews', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}