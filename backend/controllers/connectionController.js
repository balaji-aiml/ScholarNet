import Connection from '../models/Connection.js';
import User from '../models/User.js';
import { asyncHandler, httpError } from '../middleware/error.js';

const same = (a, b) => String(a) === String(b);

// Map<otherUserId, {id, status, direction}> describing my relationship to everyone I touch.
export async function connectionMap(userId) {
  const conns = await Connection.find({ $or: [{ requester: userId }, { recipient: userId }] }).lean();
  const map = new Map();
  for (const c of conns) {
    const outgoing = same(c.requester, userId);
    map.set(String(outgoing ? c.recipient : c.requester), {
      id: c._id, status: c.status, direction: outgoing ? 'outgoing' : 'incoming',
    });
  }
  return map;
}

// GET /api/connections -> users I'm linked to, each with a `connection` field
export const listConnections = asyncHandler(async (req, res) => {
  const me = req.user._id;
  const conns = await Connection.find({ $or: [{ requester: me }, { recipient: me }] })
    .populate('requester recipient', 'name role department year skills interests bio')
    .sort({ updatedAt: -1 })
    .lean();
  res.json(
    conns.map((c) => {
      const outgoing = same(c.requester._id, me);
      return {
        ...(outgoing ? c.recipient : c.requester),
        connection: { id: c._id, status: c.status, direction: outgoing ? 'outgoing' : 'incoming' },
      };
    })
  );
});

// POST /api/connections/:userId
export const sendRequest = asyncHandler(async (req, res) => {
  const me = req.user._id;
  const other = req.params.userId;
  if (same(me, other)) throw httpError(400, "You can't connect with yourself");
  if (!(await User.exists({ _id: other }))) throw httpError(404, 'User not found');
  const existing = await Connection.findOne({
    $or: [{ requester: me, recipient: other }, { requester: other, recipient: me }],
  });
  if (existing) throw httpError(409, 'A connection or request already exists');
  const c = await Connection.create({ requester: me, recipient: other });
  res.status(201).json({ id: c._id, status: c.status, direction: 'outgoing' });
});

// PUT /api/connections/:id/accept  (recipient only)
export const acceptRequest = asyncHandler(async (req, res) => {
  const c = await Connection.findById(req.params.id);
  if (!c) throw httpError(404, 'Request not found');
  if (!same(c.recipient, req.user._id)) throw httpError(403, 'Only the recipient can accept');
  if (c.status === 'accepted') throw httpError(409, 'Already connected');
  c.status = 'accepted';
  await c.save();
  res.json({ id: c._id, status: c.status, direction: 'incoming' });
});

// DELETE /api/connections/:id  (cancel, decline or disconnect)
export const removeConnection = asyncHandler(async (req, res) => {
  const c = await Connection.findById(req.params.id);
  if (!c) throw httpError(404, 'Connection not found');
  if (!same(c.requester, req.user._id) && !same(c.recipient, req.user._id)) throw httpError(403, 'Not your connection');
  await c.deleteOne();
  res.json({ message: 'Removed' });
});
