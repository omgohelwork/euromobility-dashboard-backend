import mongoose from 'mongoose';

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nome città obbligatorio'],
      trim: true,
      unique: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

citySchema.index({ name: 1 });

export default mongoose.model('City', citySchema);
