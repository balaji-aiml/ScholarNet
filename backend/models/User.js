import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../../shared/constants.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ROLES, default: 'student' },
    department: { type: String, trim: true },
    year: { type: Number, min: 1, max: 6 },
    skills: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    bio: { type: String, maxlength: 500, default: '' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('User', userSchema);
