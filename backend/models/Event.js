import mongoose from 'mongoose';
import { EVENT_CATEGORIES } from '../../shared/constants.js';

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    date: { type: Date, required: true, index: true },
    location: { type: String, trim: true, default: '' },
    category: { type: String, enum: EVENT_CATEGORIES, default: 'other', index: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Event', eventSchema);
