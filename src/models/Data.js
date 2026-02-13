import mongoose from 'mongoose';

/**
 * Data stores indicator values per city per year.
 * values: { "2014": number | null, "2015": number | null, ... }
 * Missing values must be null (not 0).
 */
const dataSchema = new mongoose.Schema(
  {
    indicatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Indicator',
      required: true,
    },
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: true,
    },
    values: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

dataSchema.index({ indicatorId: 1, cityId: 1 }, { unique: true });
dataSchema.index({ indicatorId: 1 });

export default mongoose.model('Data', dataSchema);
