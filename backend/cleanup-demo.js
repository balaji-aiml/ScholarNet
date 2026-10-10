import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Connection from './models/Connection.js';
import Event from './models/Event.js';
import Message from './models/Message.js';

const DEMO_DOMAIN = 'campus.edu'; // the domain the seed used
const names = ['campus', 'meera', 'rohan', 'tanvi', 'arjun', 'divya', 'karthik', 'sana', 'vikram', 'lakshmi'];
const emails = names.map((n) => `${n}@${DEMO_DOMAIN}`);

await connectDB();

// Optional: promote your own account first, e.g. node cleanup-demo.js you@yourcollege.ac.in
const me = process.argv[2];
if (me) {
  const r = await User.updateOne({ email: me.toLowerCase() }, { role: 'admin' });
  console.log(r.matchedCount ? `Made ${me} an admin` : `No user found with email ${me}`);
}

const ids = (await User.find({ email: { $in: emails } }).select('_id')).map((u) => u._id);
console.log(`Found ${ids.length} demo users`);

const ev = await Event.deleteMany({ organizer: { $in: ids } });
await Event.updateMany({}, { $pull: { likes: { $in: ids }, comments: { user: { $in: ids } } } });
const co = await Connection.deleteMany({ $or: [{ requester: { $in: ids } }, { recipient: { $in: ids } }] });
const ms = await Message.deleteMany({ $or: [{ sender: { $in: ids } }, { recipient: { $in: ids } }] });
const us = await User.deleteMany({ _id: { $in: ids } });

console.log(`Deleted ${us.deletedCount} users, ${ev.deletedCount} events, ${co.deletedCount} connections, ${ms.deletedCount} messages`);
await mongoose.disconnect();