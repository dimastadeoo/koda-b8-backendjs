// import { findByEmail, createUser, findUserWithRole } from '../models/users.models.js';
import * as Response from "../lib/response.js";
import { constants } from "node:http2";
import libJwt from '../lib/jwt.js';
import db from '../models/index.cjs'
import bcrypt from "bcrypt";
// import { getRoleByName } from '../models/roles.models.js';
// import { createProfile } from '../models/profile.models.js';

const {Users, Profiles, Roles} = db


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
    const customerRole = await Roles.findOne({where: {name:"customer"}})

    const data = await Users.findAll()
    const existing = data.find(u => u.email === email)
    if (existing) {
      return Response.errorResponse(res, 'Email already exists', constants.HTTP_STATUS_BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await await Users.create({
      email: email, password:hashedPassword, id_role:customerRole.id
    });
    await Profiles.create({name: name, id_user: user.id})

    const result = await Users.findByPk(user.id, {
      attributes: { exclude: ['password', 'id', 'id_role'] },
      include: [{
        model: Profiles,
        as: 'profile',
        attributes: { exclude: ['password', 'id', 'id_user', 'created_at', 'updated_at'] },
      },{
        model: Roles,
        as: 'role',
        attributes: ['name']
      }]
    })

    Response.successResponse(res, 'User registered successfully', result, constants.HTTP_STATUS_CREATED);

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

    const user = await Users.findOne({where: {email: email}});
    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!user || !passwordCheck) {
      return Response.errorResponse(res, 'User or password wrong', constants.HTTP_STATUS_UNAUTHORIZED);
    }
    const customerRole = await Roles.findByPk(user.id_role)
    const token = libJwt.sign({userId: user.id});
    const results = { token: token, user: { email: user.email, role: customerRole.name } };
    Response.successResponse(res, `User ${user.email} Login successfully`, results);

  } catch (error) {
    const err = "Fail Login Because " + error;
    console.error(err);
    Response.errorResponse(res, err);
  }
}