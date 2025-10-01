export const influencerErrorCodes = {
  alreadyExists: 'INFLUENCER_ALREADY_EXISTS',
  notFound: 'INFLUENCER_NOT_FOUND',
  createError: 'INFLUENCER_CREATE_ERROR',
  validationError: 'INFLUENCER_VALIDATION_ERROR',
  ageTooYoung: 'AGE_TOO_YOUNG',
  fetchError: 'INFLUENCER_FETCH_ERROR',
} as const;

type InfluencerErrorValue = (typeof influencerErrorCodes)[keyof typeof influencerErrorCodes];

export type InfluencerServiceError = InfluencerErrorValue;
