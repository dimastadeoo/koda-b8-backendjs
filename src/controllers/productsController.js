import * as productModel from "../models/products.models.js";
import * as Response from "../lib/response.js";
import * as ImageProductModel from "../models/productImage.models.js"
import * as reviewModel from "../models/reviews.models.js";
import db from '../models/index.cjs';
import { constants } from "node:http2";
import { deleteFile, getUploadPath } from "../lib/uploads.js";
import redis from "../lib/redis.js";

const {Products, Categories, ProductSpecifications, ImgProducts, Merks} = db


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
    
    const endpoint = req.originalUrl
    const cacheRedis = await redis.get(endpoint)
    
    let product
    if (!cacheRedis) {
      product = await productModel.getProductById(id);
      await redis.set(endpoint, JSON.stringify(product))
    }else{
      product = JSON.parse(cacheRedis)
    }
    
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
        const merks = await Merks.findAll({order: ['name']});
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
        const categories = await Categories.findAll({order: ['name']});
        Response.successResponse(res, 'Categories retrieved successfully', categories);
    } catch (error) {
        console.error(error);
        Response.errorResponse(res, 'Failed to get categories', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
    }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function createProduct(req, res) {
  try {
    const { name, price, id_merk, stock, description } = req.body;
    if (!name || !price) {
      return Response.errorResponse(res, 'Name and price are required', constants.HTTP_STATUS_BAD_REQUEST);
    }

    // 1. Create product
    const product = await Products.create({
      name: name, price: price, id_merk: id_merk || null, stock: stock || 0, description: description
    });

    // 2. Handle uploaded images (if any)
    const files = req.files || [];
    if (files.length > 0) {
      const images = files.map((file, index) => ({
        url_img: file.filename,
        sort_order: index,
        is_primary: index === 0,
        alt_text: name
      }));
      images.forEach(async function(img) {
        await ImgProducts.create({
          id_product: product.id,
          url_img: img.url_img,
          sort_order: img.sort_order,
          is_primary: img.is_primary,
          alt_text: img.alt_text
        })
      });
      // await ImageProductModel.insertProductImages(product.id, images);
    }

    // 3. Get product with images
    const productWithImages = await productModel.getProductById(product.id);
    const images = await ImageProductModel.getProductImages(product.id);

    Response.successResponse(res, 'Product created successfully', {
      ...productWithImages,
      images
    }, constants.HTTP_STATUS_CREATED);
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to create product', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function updateProduct(req, res) {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      return Response.errorResponse(res, 'Invalid product ID', constants.HTTP_STATUS_BAD_REQUEST);
    }

    const { name, price, id_merk, stock, description } = req.body;
    if (!name && !price && !id_merk && stock === undefined && !description) {
      return Response.errorResponse(res, 'At least one field to update', constants.HTTP_STATUS_BAD_REQUEST);
    }

    const existing = await productModel.getProductById(productId);
    if (!existing) {
      return Response.errorResponse(res, 'Product not found', constants.HTTP_STATUS_NOT_FOUND);
    }

    const endpoint = req.originalUrl.slice('/admin'.length)
    const cacheRedis = await redis.get(endpoint)

    if (cacheRedis){
      await redis.DEL(endpoint)
    }

    const updated = await productModel.updateProduct(productId, {
      name: name || existing.name,
      price: price || existing.price,
      id_merk: id_merk !== undefined ? id_merk : existing.id_merk,
      stock: stock !== undefined ? stock : existing.stock,
      description: description !== undefined ? description : existing.description
    });

    const images = await ImageProductModel.getProductImages(productId);
    Response.successResponse(res, 'Product updated successfully', {
      ...updated,
      images
    });
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to update product', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function deleteProduct(req, res) {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      return Response.errorResponse(res, 'Invalid product ID', constants.HTTP_STATUS_BAD_REQUEST);
    }

    // Get images first to delete files
    const images = await ImageProductModel.getProductImages(productId);
    for (const img of images) {
      deleteFile(img.url_img); // hapus file dari disk
    }
    await ImageProductModel.deleteProductImages(productId);
    const deleted = await productModel.deleteProduct(productId);
    if (!deleted) {
      return Response.errorResponse(res, 'Product not found', constants.HTTP_STATUS_NOT_FOUND);
    }

    Response.successResponse(res, 'Product deleted successfully', { id: productId });
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to delete product', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function addProductImages(req, res) {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      return Response.errorResponse(res, 'Invalid product ID', constants.HTTP_STATUS_BAD_REQUEST);
    }

    const existing = await productModel.getProductById(productId);
    if (!existing) {
      return Response.errorResponse(res, 'Product not found', constants.HTTP_STATUS_NOT_FOUND);
    }

    const files = req.files || [];
    if (files.length === 0) {
      return Response.errorResponse(res, 'No images uploaded', constants.HTTP_STATUS_BAD_REQUEST);
    }

    // Get current max sort_order
    const currentImages = await ImageProductModel.getProductImages(productId);
    let nextOrder = currentImages.length;

    const primaryCheck = await ImageProductModel.getPrimaryImage(productId)

    let images = files.map((file, index) => ({
      url_img: file.filename,
      sort_order: nextOrder + index,
      is_primary: false, // tidak set primary karena sudah ada
      alt_text: existing.name
    }));

    // Jika belum ada primary, jadikan gambar pertama sebagai primary
    if (!primaryCheck && images.length > 0) {
      images[0].is_primary = true;
    }

    const inserted = await ImageProductModel.insertProductImages(productId, images);
    Response.successResponse(res, 'Images added successfully', inserted);
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to add images', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function deleteProductImage(req, res) {
  try {
    const imageId = parseInt(req.params.imageId, 10);
    if (isNaN(imageId)) {
      return Response.errorResponse(res, 'Invalid image ID', constants.HTTP_STATUS_BAD_REQUEST);
    }

    // Get image to delete file
    const image = await ImageProductModel.getImageById(imageId);
    if (!image) {
      return Response.errorResponse(res, 'Image not found', constants.HTTP_STATUS_NOT_FOUND);
    }

    deleteFile(image.url_img);
    await ImageProductModel.deleteImageById(imageId);

    Response.successResponse(res, 'Image deleted successfully', { id: imageId });
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to delete image', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}
