import User from '../models/User.js';
import Connection from '../models/Connection.js';
import Event from '../models/Event.js';
import Message from '../models/Message.js';
import { asyncHandler, httpError } from '../middleware/error.js';
import { escapeRegex, toList } from '../utils/helpers.js';
import { connectionMap } from './connectionController.js';

// GET /api/users?q=&department=&year=&skills=react,python&role=
export const listUsers = asyncHandler(async (req, res) => {
  const { q, department, year, skills, role } = req.query;
  const filter = { _id: { $ne: req.user._id } };
  if (department) filter.department = department;
  if (year) filter.year = Number(year);
  if (role) filter.role = role;
  if (skills) filter.skills = { $in: toList(skills).map((s) => new RegExp(escapeRegex(s), 'i')) };
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: rx }, { skills: rx }, { interests: rx }, { department: rx }];
  }
  const users = await User.find(filter).sort({ name: 1 }).limit(100).lean();
  const map = await connectionMap(req.user._id);
  res.json(users.map((u) => ({ ...u, connection: map.get(String(u._id)) || null })));
});

// GET /api/users/:id
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).lean();
  if (!user) throw httpError(404, 'User not found');
  const map = await connectionMap(req.user._id);
  res.json({ ...user, connection: map.get(String(user._id)) || null });
});

// PUT /api/users/me
export const updateMe = asyncHandler(async (req, res) => {
  const { name, department, year, skills, interests, bio } = req.body;
  const u = req.user;
  if (name !== undefined) u.name = name;
  if (department !== undefined) u.department = department;
  if (year !== undefined) u.year = year ? Number(year) : undefined;
  if (skills !== undefined) u.skills = toList(skills);
  if (interests !== undefined) u.interests = toList(interests);
  if (bio !== undefined) u.bio = bio;
  await u.save();
  res.json(u);
});

// DELETE /api/users/me
export const deleteMe = asyncHandler(async (req, res) => {
  const id = req.user._id;
  await Promise.all([
    Connection.deleteMany({ $or: [{ requester: id }, { recipient: id }] }),
    Message.deleteMany({ $or: [{ sender: id }, { recipient: id }] }),
    Event.deleteMany({ organizer: id }),
    User.deleteOne({ _id: id }),
  ]);
  res.json({ message: 'Account deleted' });
});
