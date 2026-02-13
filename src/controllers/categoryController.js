import Category from '../models/Category.js';
import { success, error, notFound } from '../utils/ApiResponse.js';

export async function list(req, res, next) {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 }).lean();
    return success(res, categories);
  } catch (e) {
    next(e);
  }
}

export async function create(req, res, next) {
  try {
    const { name, order } = req.body;
    const cat = await Category.create({ name: String(name).trim(), order: Number(order) || 0 });
    return success(res, cat, 201);
  } catch (e) {
    if (e.code === 11000) return error(res, 'Categoria già esistente', 409);
    next(e);
  }
}

export async function getOne(req, res, next) {
  try {
    const cat = await Category.findById(req.params.id).lean();
    if (!cat) return notFound(res, 'Categoria');
    return success(res, cat);
  } catch (e) {
    next(e);
  }
}

export async function update(req, res, next) {
  try {
    const cat = await Category.findByIdAndUpdate(
      req.params.id,
      {
        ...(req.body.name !== undefined && { name: String(req.body.name).trim() }),
        ...(req.body.order !== undefined && { order: Number(req.body.order) }),
      },
      { new: true, runValidators: true }
    );
    if (!cat) return notFound(res, 'Categoria');
    return success(res, cat);
  } catch (e) {
    next(e);
  }
}

export async function remove(req, res, next) {
  try {
    const cat = await Category.findByIdAndDelete(req.params.id);
    if (!cat) return notFound(res, 'Categoria');
    return success(res, { deleted: true });
  } catch (e) {
    next(e);
  }
}
