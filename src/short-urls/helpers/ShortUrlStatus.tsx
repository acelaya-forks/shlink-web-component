import type { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { faCalendarXmark, faCheck, faLinkSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { isBefore } from 'date-fns';
import type { FC } from 'react';
import { useMemo } from 'react';
import type { ShlinkShortUrl } from '../../api-contract';
import { formatHumanFriendly, now, parseISO } from '../../utils/dates/helpers/date';

export type ShortUrlStatusProps = {
  shortUrl: ShlinkShortUrl;
};

type StatusResult = {
  icon: IconDefinition;
  className: string;
  description: string;
};

const resolveShortUrlStatus = (shortUrl: ShlinkShortUrl): StatusResult => {
  const { meta, visitsCount, visitsSummary } = shortUrl;
  const { maxVisits, validSince, validUntil } = meta;
  const totalVisits = visitsSummary?.total ?? visitsCount ?? 0;

  if (maxVisits && totalVisits >= maxVisits) {
    return {
      icon: faLinkSlash,
      className: 'text-danger',
      description: `This short URL cannot be currently visited because it has reached the maximum amount of ${maxVisits} visit${maxVisits > 1 ? 's' : ''}`,
    };
  }

  if (validUntil && isBefore(parseISO(validUntil), now())) {
    return {
      icon: faCalendarXmark,
      className: 'text-danger',
      description: `This short URL cannot be visited since ${formatHumanFriendly(parseISO(validUntil))}`,
    };
  }

  if (validSince && isBefore(now(), parseISO(validSince))) {
    return {
      icon: faCalendarXmark,
      className: 'text-warning',
      description: `This short URL will start working on ${formatHumanFriendly(parseISO(validSince))}`,
    };
  }

  return {
    icon: faCheck,
    className: 'text-primary',
    description: 'This short URL can be visited normally',
  };
};

export const ShortUrlStatus: FC<ShortUrlStatusProps> = ({ shortUrl }) => {
  const { icon, className, description } = useMemo(() => resolveShortUrlStatus(shortUrl), [shortUrl]);

  return (
    <span style={{ cursor: !description ? undefined : 'help' }} title={description}>
      <FontAwesomeIcon icon={icon} className={className} />
    </span>
  );
};
