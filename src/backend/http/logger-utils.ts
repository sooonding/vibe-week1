import type { HandlerResult } from './response';

export const getErrorMessage = <TData, TCode extends string, TDetails>(
  result: HandlerResult<TData, TCode, TDetails>,
): string => {
  if ('error' in result) {
    return result.error.message;
  }
  return 'Unknown error';
};
