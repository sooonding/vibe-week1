export const advertiserErrorCodes = {
  alreadyExists: 'ADVERTISER_ALREADY_EXISTS',
  notFound: 'ADVERTISER_NOT_FOUND',
  createError: 'ADVERTISER_CREATE_ERROR',
  validationError: 'ADVERTISER_VALIDATION_ERROR',
  duplicateBusinessNumber: 'DUPLICATE_BUSINESS_NUMBER',
  fetchError: 'ADVERTISER_FETCH_ERROR',
} as const;

type AdvertiserErrorValue = (typeof advertiserErrorCodes)[keyof typeof advertiserErrorCodes];

export type AdvertiserServiceError = AdvertiserErrorValue;
