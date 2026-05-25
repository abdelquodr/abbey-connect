import httpStatus from 'http-status';
import { describe, expect, jest, test } from '@jest/globals';
import { errorConverter } from '../../src/middlewares/error';
import ApiError from '../../src/utils/ApiError';

describe('errorConverter', () => {
  test('preserves an explicit status code on plain errors', () => {
    const next = jest.fn();
    const error = {
      statusCode: httpStatus.NOT_FOUND,
      message: 'Missing resource'
    };

    const convert = errorConverter;
    convert(error, {}, {}, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));

    const convertedError = next.mock.calls[0][0];
    expect(convertedError.statusCode).toBe(httpStatus.NOT_FOUND);
    expect(convertedError.message).toBe('Missing resource');
  });

  test('defaults to 500 when no status code is present', () => {
    const next = jest.fn();

    const convert = errorConverter;
    convert(new Error('Unexpected failure'), {}, {}, next);

    const convertedError = next.mock.calls[0][0];
    expect(convertedError.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    expect(convertedError.message).toBe('Unexpected failure');
  });
});
