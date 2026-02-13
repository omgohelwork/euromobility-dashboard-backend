import mongoose from 'mongoose';

const rangeSchema = new mongoose.Schema(
  {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    color: { type: String, required: true },
  },
  { _id: false }
);

const indicatorSchema = new mongoose.Schema(
  {
    code: {
      type: Number,
      required: [true, 'Codice indicatore obbligatorio'],
      unique: true,
      min: 1,
      max: 999,
    },
    name: {
      type: String,
      required: [true, 'Nome indicatore obbligatorio'],
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Categoria obbligatoria'],
    },
    unit: {
      type: String,
      default: '',
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    numeroCifre: {
      type: String,
      default: '0',
      trim: true,
    },
    invertScale: {
      type: Boolean,
      default: false,
    },
    rangeMode: {
      type: String,
      enum: ['equalCount', 'equalInterval', 'manual'],
      default: 'equalCount',
    },
    ranges: [rangeSchema],
  },
  { timestamps: true }
);

indicatorSchema.index({ code: 1 });
indicatorSchema.index({ categoryId: 1, order: 1 });

export default mongoose.model('Indicator', indicatorSchema);
