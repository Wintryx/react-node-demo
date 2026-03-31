import { Dispatch, SetStateAction } from 'react';

import { dashboardCopy } from '../dashboard-copy';

export const mapMutationError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return dashboardCopy.common.requestFailed;
};

export const executeMutation = async <T>(
  setActionError: Dispatch<SetStateAction<string | null>>,
  execute: () => Promise<T>,
): Promise<T> => {
  setActionError(null);

  try {
    return await execute();
  } catch (error: unknown) {
    setActionError(mapMutationError(error));
    throw error;
  }
};
