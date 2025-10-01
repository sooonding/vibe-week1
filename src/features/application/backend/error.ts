export const applicationErrorCodes = {
  notFound: 'APPLICATION_NOT_FOUND',
  createError: 'APPLICATION_CREATE_ERROR',
  updateError: 'APPLICATION_UPDATE_ERROR',
  validationError: 'APPLICATION_VALIDATION_ERROR',
  duplicateApplication: 'DUPLICATE_APPLICATION',
  campaignClosed: 'CAMPAIGN_CLOSED',
  notInfluencer: 'NOT_INFLUENCER',
  unauthorized: 'APPLICATION_UNAUTHORIZED',
  fetchError: 'APPLICATION_FETCH_ERROR',
  invalidVisitDate: 'INVALID_VISIT_DATE',
  noApplicationsSelected: 'NO_APPLICATIONS_SELECTED',
} as const;

type ApplicationErrorValue = (typeof applicationErrorCodes)[keyof typeof applicationErrorCodes];

export type ApplicationServiceError = ApplicationErrorValue;
