import type { AsyncThunkConfig, AsyncThunkPayloadCreator } from '@reduxjs/toolkit';
import { createAsyncThunk as baseCreateAsyncThunk } from '@reduxjs/toolkit';
import type { ShlinkApiClient } from '../api-contract';
import { useDependencies } from '../container/context';

export const createAsyncThunk = <Returned, ThunkArg = void>(
  typePrefix: string,
  payloadCreator: AsyncThunkPayloadCreator<Returned, ThunkArg, AsyncThunkConfig>,
) => baseCreateAsyncThunk(typePrefix, payloadCreator, { serializeError: (e) => e as any });

export type WithApiClient<T = unknown> = T & { apiClientFactory: () => ShlinkApiClient };

/**
 * Alias for useDependencies<[() => ShlinkApiClient]>('apiClientFactory')[0], to avoid duplicating this logic in every
 * redux hook that needs access to the API client
 */
export const useApiClientFactory = () => {
  const [apiClientFactory] = useDependencies<[() => ShlinkApiClient]>('apiClientFactory');
  return apiClientFactory;
};
