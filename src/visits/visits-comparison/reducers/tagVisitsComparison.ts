import type { ShlinkApiClient } from '../../../api-contract';
import { filterCreatedVisitsByTag, toApiParams } from '../../helpers';
import { createVisitsComparisonAsyncThunk } from './common/createVisitsComparisonAsyncThunk';
import { createVisitsComparisonReducer } from './common/createVisitsComparisonReducer';
import type { LoadVisitsForComparison, VisitsComparisonInfo } from './types';

const REDUCER_PREFIX = 'shlink/tagVisitsComparison';

export type LoadTagVisitsForComparison = LoadVisitsForComparison & { tags: string[]; };

const initialState: VisitsComparisonInfo = {
  visitsGroups: {},
  loading: false,
  cancelLoad: false,
  errorData: null,
  progress: null,
};

export const getTagVisitsForComparison = (apiClientFactory: () => ShlinkApiClient) => createVisitsComparisonAsyncThunk({
  typePrefix: `${REDUCER_PREFIX}/getTagVisitsForComparison`,
  createLoaders: ({ tags, params }: LoadTagVisitsForComparison) => {
    const apiClient = apiClientFactory();
    const loaderEntries = tags.map((tag) => [
      tag,
      async (page: number, itemsPerPage: number) => apiClient.getTagVisits(
        tag,
        { ...toApiParams(params), page, itemsPerPage },
      ),
    ]);

    return Object.fromEntries(loaderEntries);
  },
  shouldCancel: (getState) => getState().tagVisitsComparison.cancelLoad,
});

export const tagVisitsComparisonReducerCreator = (asyncThunkCreator: ReturnType<typeof getTagVisitsForComparison>) =>
  createVisitsComparisonReducer({
    name: REDUCER_PREFIX,
    initialState,
    // @ts-expect-error TODO Fix type inference
    asyncThunkCreator,
    filterCreatedVisitsForGroup: ({ groupKey: tag, params }, createdVisits) => filterCreatedVisitsByTag(
      createdVisits,
      tag,
      params?.dateRange,
    ),
  });
