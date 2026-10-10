import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler, httpError } from '../middleware/error.js';
import { toList } from '../utils/helpers.js';
import { SELF_SIGNUP_ROLES } from '../../shared/constants.js';

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, year, skills, interests } = req.body;
  if (!name || !email || !password) throw httpError(400, 'Name, email and password are required');
  if (password.length < 6) throw httpError(400, 'Password must be at least 6 characters');

  const domain = process.env.CAMPUS_EMAIL_DOMAIN;
  if (domain && !email.toLowerCase().endsWith(`@${domain.toLowerCase()}`)) {
    throw httpError(403, `Use your @${domain} campus email`);
  }
  if (await User.findOne({ email: email.toLowerCase() })) throw httpError(409, 'That email is already registered');

  const user = await User.create({
    name, email, password,
    role: SELF_SIGNUP_ROLES.includes(role) ? role : 'student', // admins are created via seed/DB only
    department, year: year ? Number(year) : undefined,
    skills: toList(skills), interests: toList(interests),
  });
  res.status(201).json({ token: sign(user._id), user });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw httpError(400, 'Email and password are required');
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) throw httpError(401, 'Incorrect email or password');
  res.json({ token: sign(user._id), user });
});

export const me = (req, res) => res.json(req.user);
