import mongoose from 'mongoose';

/**
 * Contenuto Metodologia (un solo documento, solo italiano).
 * L'HTML viene mostrato nel popup Metodologia sul frontend.
 */
const methodologySchema = new mongoose.Schema(
  {
    content: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Methodology', methodologySchema);
