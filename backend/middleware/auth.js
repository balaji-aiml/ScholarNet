import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler, httpError } from './error.js';

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw httpError(401, 'Sign in to continue');
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw httpError(401, 'Session expired, please sign in again');
  }
  const user = await User.findById(payload.id);
  if (!user) throw httpError(401, 'Account no longer exists');
  req.user = user;
  next();
});

export const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : next(httpError(403, 'Only seniors and admins can do this'));
