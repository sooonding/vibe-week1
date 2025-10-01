export const userErrorCodes = {
  alreadyExists: 'USER_ALREADY_EXISTS',
  invalidRole: 'INVALID_ROLE',
  createError: 'USER_CREATE_ERROR',
  termsNotAgreed: 'TERMS_NOT_AGREED',
  validationError: 'USER_VALIDATION_ERROR',
} as const;

type UserErrorValue = (typeof userErrorCodes)[keyof typeof userErrorCodes];

export type UserServiceError = UserErrorValue;
