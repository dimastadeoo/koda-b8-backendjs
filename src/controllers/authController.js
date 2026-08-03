import { findByEmail, createUser } from '../models/usersModels.js';
import * as Response from "../lib/response.js";
import { constants } from "node:http2";
import libJwt from '../lib/jwt.js';
import bcrypt from "bcrypt";
import { createProfile } from '../models/profileModels.js';

const saltRounds = 10;
/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function register(req, res) {
  try {
    const { email, password, name } = req.body;
    console.log(req.body);
    if (!email || !password || !name) {
      return Response.errorResponse(res, 'Email Or password Or name required', constants.HTTP_STATUS_BAD_REQUEST);
    }

    const existing = await findByEmail(email);
    if (existing) {
      return Response.errorResponse(res, 'Email already exists', constants.HTTP_STATUS_BAD_REQUEST);

    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await createUser(email, hashedPassword);
    const profile = await createProfile(user.id, name)
    const results = { name: profile.name, email: user.email };

    Response.successResponse(res, 'User registered successfully', results, constants.HTTP_STATUS_CREATED);

  } catch (error) {
    const err = "Fail Register Data Because " + error;
    console.error(err);
    Response.errorResponse(res, err);
  }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return Response.errorResponse(res, 'Email and password required', constants.HTTP_STATUS_BAD_REQUEST);
    }

    const user = await findByEmail(email);
    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!user || !passwordCheck) {
      return Response.errorResponse(res, 'User or password wrong', constants.HTTP_STATUS_UNAUTHORIZED);
    }
    
    const token = libJwt.sign({userId: user.id});
    const results = { token: token, user: { id: user.id, email: user.email } };
    Response.successResponse(res, `User ${user.email} Login successfully`, results);

  } catch (error) {
    const err = "Fail Login Because " + error;
    console.error(err);
    Response.errorResponse(res, err);
  }
}