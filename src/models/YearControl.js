import mongoose from 'mongoose';

/**
 * YearControl: years auto-detected from uploads.
 * Admin can disable a year via enabled: false.
 */
const yearControlSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: true,
      unique: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

yearControlSchema.index({ year: 1 });

export default mongoose.model('YearControl', yearControlSchema);
