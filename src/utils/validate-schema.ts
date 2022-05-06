import { InvalidSchemaError } from '../errors';

// Yup doesn't throw errors properly, so this method preserves proper stack traces
export default async function validateSchema<T>(validation: Promise<T>): Promise<T> {
  try {
    return await validation;
  } catch (err) {
    throw new InvalidSchemaError(err);
  }
}
