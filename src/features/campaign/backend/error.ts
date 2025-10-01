export const campaignErrorCodes = {
  notFound: 'CAMPAIGN_NOT_FOUND',
  createError: 'CAMPAIGN_CREATE_ERROR',
  updateError: 'CAMPAIGN_UPDATE_ERROR',
  validationError: 'CAMPAIGN_VALIDATION_ERROR',
  invalidDates: 'INVALID_RECRUITMENT_DATES',
  notAdvertiser: 'NOT_ADVERTISER',
  unauthorized: 'CAMPAIGN_UNAUTHORIZED',
  fetchError: 'CAMPAIGN_FETCH_ERROR',
  alreadyClosed: 'CAMPAIGN_ALREADY_CLOSED',
  alreadySelected: 'CAMPAIGN_ALREADY_SELECTED',
} as const;

type CampaignErrorValue = (typeof campaignErrorCodes)[keyof typeof campaignErrorCodes];

export type CampaignServiceError = CampaignErrorValue;
