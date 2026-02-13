import { validationResult } from 'express-validator';
import { error } from '../utils/ApiResponse.js';

/**
 * Runs express-validator and returns 400 with first error if invalid.
 */
export function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const first = result.array({ onlyFirstError: true })[0];
  return error(res, first.msg, 400, result.array());
}
