import { createSlice } from '@reduxjs/toolkit';
import type { ProblemDetailsError, ShlinkApiClient, ShlinkCreateShortUrlData, ShlinkShortUrl } from '../../api-contract';
import { parseApiError } from '../../api-contract/utils';
import { createAsyncThunk } from '../../utils/redux';

const REDUCER_PREFIX = 'shlink/shortUrlCreation';

export type ShortUrlCreation = {
  saving: false;
  saved: false;
  error: false;
} | {
  saving: true;
  saved: false;
  error: false;
} | {
  saving: false;
  saved: false;
  error: true;
  errorData?: ProblemDetailsError;
} | {
  result: ShlinkShortUrl;
  saving: false;
  saved: true;
  error: false;
};

const initialState: ShortUrlCreation = {
  saving: false,
  saved: false,
  error: false,
};

export const createShortUrl = (apiClientFactory: () => ShlinkApiClient) => createAsyncThunk(
  `${REDUCER_PREFIX}/createShortUrl`,
  (data: ShlinkCreateShortUrlData): Promise<ShlinkShortUrl> => apiClientFactory().createShortUrl(data),
);

export type CreateShortUrlThunk = ReturnType<typeof createShortUrl>;

export const shortUrlCreationReducerCreator = (createShortUrlThunk: CreateShortUrlThunk) => {
  const { reducer, actions } = createSlice({
    name: REDUCER_PREFIX,
    initialState: initialState as ShortUrlCreation, // Without this casting it infers type ShortUrlCreationWaiting
    reducers: {
      resetCreateShortUrl: () => initialState,
    },
    extraReducers: (builder) => {
      builder.addCase(createShortUrlThunk.pending, () => ({ saving: true, saved: false, error: false }));
      builder.addCase(
        createShortUrlThunk.rejected,
        (_, { error }) => ({ saving: false, saved: false, error: true, errorData: parseApiError(error) }),
      );
      builder.addCase(
        createShortUrlThunk.fulfilled,
        (_, { payload: result }) => ({ result, saving: false, saved: true, error: false }),
      );
    },
  });

  const { resetCreateShortUrl } = actions;

  return {
    reducer,
    resetCreateShortUrl,
  };
};
