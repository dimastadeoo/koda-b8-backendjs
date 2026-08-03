
/**
 * 
 * @param {import("express").Response} res 
 */
export const successResponse = (res, message, data = null, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message: message,
    ...(data !== null && { results: data }),
  });
};

/**
 * 
 * @param {import("express").Response} res 
 */
export const errorResponse = (res, message, statusCode = 500) => {
  const response = {
    success: false,
    message: message,
  };
  res.status(statusCode).json(response);
};