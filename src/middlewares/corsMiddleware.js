import { constants } from "node:http2";

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {function()} next
 */
function corsMiddleware(req, res, next) {
  // eslint-disable-next-line no-undef
  const PORT = process.env.PORT_FRONTEND || 5173;

  res.setHeader("Access-Control-Allow-Origin", "http://localhost:" + PORT);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Origin, Authorization");

  if (req.method === "OPTIONS") {
    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
    return;
  }
  next();
}

export default corsMiddleware;