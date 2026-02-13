import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // don't return password by default
    },
  },
  { timestamps: true }
);

adminSchema.index({ username: 1 });

/** Compare plain password with stored hash. Call with doc that has password (e.g. findOne().select('+password')). */
adminSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

export default mongoose.model('Admin', adminSchema);
