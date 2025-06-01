import type { ShlinkCreateShortUrlData, ShlinkShortUrl, ShlinkShortUrlIdentifier } from '../../api-contract';
import { DEFAULT_DOMAIN } from '../../domains/data';
import type { ShortUrlCreationSettings } from '../../settings';
import type { OptionalString } from '../../utils/helpers';

export const shortUrlMatches = (shortUrl: ShlinkShortUrl, shortCode: string, domain: OptionalString): boolean => {
  if (domain === undefined || domain === null) {
    return shortUrl.shortCode === shortCode && !shortUrl.domain;
  }

  return shortUrl.shortCode === shortCode && shortUrl.domain === domain;
};

export const domainMatches = (shortUrl: ShlinkShortUrl, domain: string): boolean => {
  if (!shortUrl.domain && domain === DEFAULT_DOMAIN) {
    return true;
  }

  return shortUrl.domain === domain;
};

// FIXME This should return ShlinkEditShortUrlData
export const shortUrlDataFromShortUrl = (
  shortUrl?: ShlinkShortUrl,
  settings?: ShortUrlCreationSettings,
): ShlinkCreateShortUrlData => {
  const validateUrl = settings?.validateUrls ?? false;

  if (!shortUrl) {
    return { longUrl: '', validateUrl };
  }

  return {
    longUrl: shortUrl.longUrl,
    tags: shortUrl.tags,
    title: shortUrl.title ?? undefined,
    domain: shortUrl.domain ?? undefined,
    validSince: shortUrl.meta.validSince ?? undefined,
    validUntil: shortUrl.meta.validUntil ?? undefined,
    maxVisits: shortUrl.meta.maxVisits ?? undefined,
    crawlable: shortUrl.crawlable,
    forwardQuery: shortUrl.forwardQuery,
    deviceLongUrls: shortUrl.deviceLongUrls && {
      android: shortUrl.deviceLongUrls.android ?? undefined,
      ios: shortUrl.deviceLongUrls.ios ?? undefined,
      desktop: shortUrl.deviceLongUrls.desktop ?? undefined,
    },
    validateUrl,
  };
};

/**
 * Converts a short code into a valid URL param, replacing bars from multi-segment slugs with double underscore
 */
export const urlEncodeShortCode = (shortCode: string): string => shortCode.replaceAll('/', '__');

/**
 * Converts a URL param representing a short code into its corresponding short code, by replacing double underscores
 * (if any) with bars, which means it's a multi-segment slug
 */
export const urlDecodeShortCode = (shortCode: string): string => shortCode.replaceAll('__', '/');

/**
 * String representation of a short URL, so that it can be used as query param
 */
export const shortUrlToQuery = ({ domain, shortCode }: ShlinkShortUrlIdentifier): string =>
  `${domain ?? DEFAULT_DOMAIN}__${urlEncodeShortCode(shortCode)}`;

/**
 * String representation of a short URL, so that it can be used as query param
 */
export const queryToShortUrl = (shortUrlQuery: string): ShlinkShortUrlIdentifier => {
  // Split in two segments only. The second one may also contain the split placeholder if it is a multi-segment slug
  const [domain, shortCode] = shortUrlQuery.split(/__(.+)/);
  if (!shortCode) {
    throw new Error(`It was not possible to parse domain and short code from "${shortUrlQuery}"`);
  }

  return {
    domain: domain === DEFAULT_DOMAIN ? null : domain,
    shortCode: urlDecodeShortCode(shortCode),
  };
};
