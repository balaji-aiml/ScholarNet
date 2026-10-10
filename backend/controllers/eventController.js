import Event from '../models/Event.js';
import { asyncHandler, httpError } from '../middleware/error.js';
import { escapeRegex } from '../utils/helpers.js';
import { EVENT_CATEGORIES } from '../../shared/constants.js';

const populate = (q) => q.populate('organizer', 'name role department').populate('comments.user', 'name role');

// Public shape: hides the raw likes array, adds likeCount + liked for the viewer.
const serialize = (doc, uid) => {
  const e = doc.toObject();
  const liked = e.likes.some((l) => String(l) === String(uid));
  const { likes, ...rest } = e;
  return { ...rest, likeCount: likes.length, liked };
};
const load = async (id, uid) => {
  const e = await populate(Event.findById(id));
  if (!e) throw httpError(404, 'Event not found');
  return serialize(e, uid);
};
const canManage = (event, user) => user.role === 'admin' || String(event.organizer) === String(user._id);

// GET /api/events?category=&q=&from=&to=&upcoming=true
export const listEvents = asyncHandler(async (req, res) => {
  const { category, q, from, to, upcoming } = req.query;
  const filter = {};
  if (category && category !== 'all') filter.category = category;
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ title: rx }, { description: rx }, { location: rx }];
  }
  if (upcoming === 'true' || from || to) {
    filter.date = {};
    if (upcoming === 'true') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filter.date.$gte = today;
    }
    if (from) filter.date.$gte = new Date(from);
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      filter.date.$lte = end;
    }
  }
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const events = await populate(Event.find(filter).sort({ date: 1 }).limit(limit));
  res.json(events.map((e) => serialize(e, req.user._id)));
});

export const getEvent = asyncHandler(async (req, res) => res.json(await load(req.params.id, req.user._id)));

// POST /api/events  (senior/admin)
export const createEvent = asyncHandler(async (req, res) => {
  const { title, description, date, location, category } = req.body;
  if (!title || !description || !date) throw httpError(400, 'Title, description and date are required');
  if (category && !EVENT_CATEGORIES.includes(category)) throw httpError(400, 'Unknown category');
  const e = await Event.create({ title, description, date, location, category, organizer: req.user._id });
  res.status(201).json(await load(e._id, req.user._id));
});

// PUT /api/events/:id  (organizer or admin)
export const updateEvent = asyncHandler(async (req, res) => {
  const e = await Event.findById(req.params.id);
  if (!e) throw httpError(404, 'Event not found');
  if (!canManage(e, req.user)) throw httpError(403, 'You can only edit your own notices');
  for (const f of ['title', 'description', 'date', 'location', 'category']) {
    if (req.body[f] !== undefined) e[f] = req.body[f];
  }
  await e.save();
  res.json(await load(e._id, req.user._id));
});

// DELETE /api/events/:id  (organizer or admin)
export const deleteEvent = asyncHandler(async (req, res) => {
  const e = await Event.findById(req.params.id);
  if (!e) throw httpError(404, 'Event not found');
  if (!canManage(e, req.user)) throw httpError(403, 'You can only delete your own notices');
  await e.deleteOne();
  res.json({ message: 'Event deleted' });
});

// POST /api/events/:id/like  (toggle)
export const toggleLike = asyncHandler(async (req, res) => {
  const e = await Event.findById(req.params.id);
  if (!e) throw httpError(404, 'Event not found');
  const uid = String(req.user._id);
  const has = e.likes.some((l) => String(l) === uid);
  e.likes = has ? e.likes.filter((l) => String(l) !== uid) : [...e.likes, req.user._id];
  await e.save();
  res.json(await load(e._id, req.user._id));
});

// POST /api/events/:id/comments
export const addComment = asyncHandler(async (req, res) => {
  const text = (req.body.text || '').trim();
  if (!text) throw httpError(400, 'Comment cannot be empty');
  const e = await Event.findById(req.params.id);
  if (!e) throw httpError(404, 'Event not found');
  e.comments.push({ user: req.user._id, text });
  await e.save();
  res.status(201).json(await load(e._id, req.user._id));
});

// DELETE /api/events/:id/comments/:commentId  (comment author, organizer or admin)
export const deleteComment = asyncHandler(async (req, res) => {
  const e = await Event.findById(req.params.id);
  if (!e) throw httpError(404, 'Event not found');
  const c = e.comments.id(req.params.commentId);
  if (!c) throw httpError(404, 'Comment not found');
  if (String(c.user) !== String(req.user._id) && !canManage(e, req.user)) throw httpError(403, 'Not allowed');
  c.deleteOne();
  await e.save();
  res.json(await load(e._id, req.user._id));
});
