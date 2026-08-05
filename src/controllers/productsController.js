import * as productModel from "../models/productsModels.js";
import * as Response from "../lib/response.js";
import * as ImageProductModel from "../models/productImageModels.js"
import * as reviewModel from "../models/reviewsModels.js";
import { constants } from "node:http2";

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function getProducts(req, res) {
  try {
    // --- 1. Ekstrak query params ---
    const {
      page = 1,
      limit = 10,
      category,
      merk,
      min_price,
      max_price,
    } = req.query;

    // --- 2. Ekstrak search dengan bracket notation ---
    let search = {};
    let dataSearch = req.query.search;
    if (dataSearch) {
      if (typeof dataSearch === 'string') {
        search.name = dataSearch;
      } else {
        if (dataSearch.name) search.name = dataSearch.name;
        if (dataSearch.merk) search.merk = dataSearch.merk;
        if (dataSearch.categorie) search.categorie = dataSearch.categorie;
      }
    }

    // --- 3. Ekstrak sort dengan bracket notation ---
    let sort = { field: 'created_at', order: 'DESC' };
    if (req.query.sort) {
      const sortObj = req.query.sort;
      if (sortObj.price) {
        sort = { field: 'price', order: sortObj.price.toUpperCase() === 'ASC' ? 'ASC' : 'DESC' };
      } else if (sortObj.name) {
        sort = { field: 'name', order: sortObj.name.toUpperCase() === 'ASC' ? 'ASC' : 'DESC' };
      } else if (sortObj.created_at) {
        sort = { field: 'created_at', order: sortObj.created_at.toUpperCase() === 'ASC' ? 'ASC' : 'DESC' };
      }
    }

    // --- 4. Parsing numeric ---
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    const filters = {
      category: category ? parseInt(category, 10) : null,
      merk: merk ? parseInt(merk, 10) : null,
      min_price: min_price ? parseInt(min_price, 10) : null,
      max_price: max_price ? parseInt(max_price, 10) : null,
    };

    // --- 5. Panggil model ---
    const { data, total } = await productModel.getProducts({
      filters,
      search,
      sort,
      limit: limitNum,
      offset,
    });

    const totalPages = Math.ceil(total / limitNum);

    Response.successResponse(res, 'Products retrieved successfully', {
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to get products', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function getProductById(req, res) {
    try {
        const { id } = req.params;
        const product = await productModel.getProductById(id);
       
        if (!product) {
            return Response.errorResponse(res, 'Product not found', constants.HTTP_STATUS_NOT_FOUND);
        }
        
        // Ambil gambar produk dari model imgProduct
        const images = await ImageProductModel.getProductImages(id);
        const ratingStats = await reviewModel.getProductRatingStats(id);

        // Gabungkan hasil
        const result = {
          ...product,
          images,
          average_rating: parseFloat(ratingStats.avg_rating),
          total_reviews: parseInt(ratingStats.total_reviews, 10),
        };

        Response.successResponse(res, 'Product retrieved successfully', result);
    } catch (error) {
        console.error(error);
        Response.errorResponse(res, 'Failed to get product', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
    }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function getMerks(req, res) {
    try {
        const merks = await productModel.getMerks();
        Response.successResponse(res, 'Merks retrieved successfully', merks);
    } catch (error) {
        console.error(error);
        Response.errorResponse(res, 'Failed to get merks', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
    }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function getCategories(req, res) {
    try {
        const categories = await productModel.getCategories();
        Response.successResponse(res, 'Categories retrieved successfully', categories);
    } catch (error) {
        console.error(error);
        Response.errorResponse(res, 'Failed to get categories', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
    }
}
