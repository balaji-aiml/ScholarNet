import Message from '../models/Message.js';
import Connection from '../models/Connection.js';
import User from '../models/User.js';
import { asyncHandler, httpError } from '../middleware/error.js';

const same = (a, b) => String(a) === String(b);

export const areConnected = async (a, b) =>
  !!(await Connection.exists({
    status: 'accepted',
    $or: [{ requester: a, recipient: b }, { requester: b, recipient: a }],
  }));

// Shared by REST and Socket.io so both enforce the same rules.
export async function sendMessage(sender, recipient, text) {
  text = (text || '').trim();
  if (!text) throw httpError(400, 'Message cannot be empty');
  if (same(sender, recipient)) throw httpError(400, "You can't message yourself");
  if (!(await areConnected(sender, recipient))) throw httpError(403, 'You can only message accepted connections');
  return Message.create({ sender, recipient, text });
}

export async function markRead(me, from) {
  const r = await Message.updateMany({ sender: from, recipient: me, read: false }, { read: true, readAt: new Date() });
  return r.modifiedCount;
}

// GET /api/messages/conversations
export const conversations = asyncHandler(async (req, res) => {
  const me = req.user._id;
  const msgs = await Message.find({ $or: [{ sender: me }, { recipient: me }] }).sort({ createdAt: -1 }).limit(500).lean();
  const byPartner = new Map();
  for (const m of msgs) {
    const partner = String(same(m.sender, me) ? m.recipient : m.sender);
    let c = byPartner.get(partner);
    if (!c) byPartner.set(partner, (c = { partnerId: partner, lastMessage: m, unread: 0 }));
    if (same(m.recipient, me) && !m.read) c.unread += 1;
  }
  const users = await User.find({ _id: { $in: [...byPartner.keys()] } }).select('name role department year').lean();
  const umap = new Map(users.map((u) => [String(u._id), u]));
  res.json(
    [...byPartner.values()]
      .filter((c) => umap.has(c.partnerId))
      .map((c) => ({ user: umap.get(c.partnerId), lastMessage: c.lastMessage, unread: c.unread }))
  );
});

// GET /api/messages/:userId
export const thread = asyncHandler(async (req, res) => {
  const me = req.user._id;
  const other = req.params.userId;
  const msgs = await Message.find({
    $or: [{ sender: me, recipient: other }, { sender: other, recipient: me }],
  }).sort({ createdAt: -1 }).limit(200).lean();
  res.json(msgs.reverse());
});

// POST /api/messages/:userId  { text }  (REST fallback; the UI uses sockets)
export const send = asyncHandler(async (req, res) => {
  res.status(201).json(await sendMessage(req.user._id, req.params.userId, req.body.text));
});

// PUT /api/messages/:userId/read
export const read = asyncHandler(async (req, res) => {
  res.json({ updated: await markRead(req.user._id, req.params.userId) });
});
