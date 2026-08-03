import * as Response from "../lib/response.js";
import {constants} from "node:http2";
import libJwt from '../lib/jwt.js';


/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {function ()} next
 */
export async function authenticate(req, res, next) {
  try{
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.errorResponse(res, 'Unauthorized: missing token', constants.HTTP_STATUS_UNAUTHORIZED);
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return Response.errorResponse(res, 'Unauthorized: token not found', constants.HTTP_STATUS_UNAUTHORIZED);
    }
  
    const verifToken = libJwt.verify(token);
    if (!verifToken) {
      return Response.errorResponse(res, 'Unauthorized: Token invalid', constants.HTTP_STATUS_UNAUTHORIZED);
    }
  
    req.user = verifToken;
    next();
  }catch{
    return Response.errorResponse(res, "Unauthorized");
  }
}