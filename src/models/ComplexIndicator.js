import mongoose from 'mongoose';

const stackedIndicatorSchema = new mongoose.Schema(
  {
    indicatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Indicator',
      required: true,
    },
    order: { type: Number, required: true },
  },
  { _id: false }
);

const complexIndicatorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nome indicatore complesso obbligatorio'],
      trim: true,
    },
    stackedIndicators: [stackedIndicatorSchema],
  },
  { timestamps: true }
);

export default mongoose.model('ComplexIndicator', complexIndicatorSchema);
