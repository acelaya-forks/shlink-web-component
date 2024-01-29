import { orderToString, stringifyQuery, stringToOrder, useParsedQuery } from '@shlinkio/shlink-frontend-kit';
import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { TagsFilteringMode } from '../../api-contract';
import type { BooleanString } from '../../utils/helpers';
import { parseOptionalBooleanToString } from '../../utils/helpers';
import { useRoutesPrefix } from '../../utils/routesPrefix';
import type { ShortUrlsOrder, ShortUrlsOrderableFields } from '../data';
import { urlDecodeShortCode } from './index';

type ShortUrlsQueryCommon = {
  search?: string;
  startDate?: string;
  endDate?: string;
  tagsMode?: TagsFilteringMode;
};

type ShortUrlsRawQuery = Record<string, unknown> & ShortUrlsQueryCommon & {
  orderBy?: string;
  tags?: string;
  excludeBots?: BooleanString;
  excludeMaxVisitsReached?: BooleanString;
  excludePastValidUntil?: BooleanString;
};

type ShortUrlsQuery = ShortUrlsQueryCommon & {
  orderBy?: ShortUrlsOrder;
  tags: string[];
  excludeBots?: boolean;
  excludeMaxVisitsReached?: boolean;
  excludePastValidUntil?: boolean;
};

type ToFirstPage = (extra: Partial<ShortUrlsQuery>) => void;

export const useShortUrlsQuery = (): [ShortUrlsQuery, ToFirstPage] => {
  const navigate = useNavigate();
  const routesPrefix = useRoutesPrefix();
  const query = useParsedQuery<ShortUrlsRawQuery>();

  const filtering = useMemo(
    (): ShortUrlsQuery => {
      const { orderBy, tags, excludeBots, excludeMaxVisitsReached, excludePastValidUntil, ...rest } = query;
      const parsedOrderBy = orderBy ? stringToOrder<ShortUrlsOrderableFields>(orderBy) : undefined;
      const parsedTags = tags?.split(',') ?? [];
      return {
        ...rest,
        orderBy: parsedOrderBy,
        tags: parsedTags,
        excludeBots: excludeBots !== undefined ? excludeBots === 'true' : undefined,
        excludeMaxVisitsReached: excludeMaxVisitsReached !== undefined ? excludeMaxVisitsReached === 'true' : undefined,
        excludePastValidUntil: excludePastValidUntil !== undefined ? excludePastValidUntil === 'true' : undefined,
      };
    },
    [query],
  );
  const toFirstPageWithExtra = useCallback((extra: Partial<ShortUrlsQuery>) => {
    const merged = { ...filtering, ...extra };
    const { orderBy, tags, excludeBots, excludeMaxVisitsReached, excludePastValidUntil, ...mergedFiltering } = merged;
    const newQuery: ShortUrlsRawQuery = {
      ...mergedFiltering,
      orderBy: orderBy && orderToString(orderBy),
      tags: tags.length > 0 ? tags.join(',') : undefined,
      excludeBots: parseOptionalBooleanToString(excludeBots),
      excludeMaxVisitsReached: parseOptionalBooleanToString(excludeMaxVisitsReached),
      excludePastValidUntil: parseOptionalBooleanToString(excludePastValidUntil),
    };
    const stringifiedQuery = stringifyQuery(newQuery);
    const queryString = !stringifiedQuery ? '' : `?${stringifiedQuery}`;

    navigate(`${routesPrefix}/list-short-urls/1${queryString}`);
  }, [filtering, navigate, routesPrefix]);

  return [filtering, toFirstPageWithExtra];
};

/**
 * Reads the short code from route params, and decodes it
 */
export const useDecodedShortCodeFromParams = (): string => {
  const { shortCode = '' } = useParams<{ shortCode: string }>();
  return useMemo(() => urlDecodeShortCode(shortCode), [shortCode]);
};
