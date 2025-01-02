import type { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { faCalendarXmark, faCheck, faLinkSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useElementRef } from '@shlinkio/shlink-frontend-kit';
import { isBefore } from 'date-fns';
import type { FC, ReactNode, RefObject } from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import type { ShlinkShortUrl } from '../../api-contract';
import { formatHumanFriendly, now, parseISO } from '../../utils/dates/helpers/date';

interface ShortUrlStatusProps {
  shortUrl: ShlinkShortUrl;
}

interface StatusResult {
  icon: IconDefinition;
  className: string;
  description: ReactNode;
}

const resolveShortUrlStatus = (shortUrl: ShlinkShortUrl): StatusResult => {
  const { meta, visitsCount, visitsSummary } = shortUrl;
  const { maxVisits, validSince, validUntil } = meta;
  const totalVisits = visitsSummary?.total ?? visitsCount ?? 0;

  if (maxVisits && totalVisits >= maxVisits) {
    return {
      icon: faLinkSlash,
      className: 'text-danger',
      description: (
        <>
          This short URL cannot be currently visited because it has reached the maximum
          amount of <b>{maxVisits}</b> visit{maxVisits > 1 ? 's' : ''}.
        </>
      ),
    };
  }

  if (validUntil && isBefore(parseISO(validUntil), now())) {
    return {
      icon: faCalendarXmark,
      className: 'text-danger',
      description: (
        <>
          This short URL cannot be visited
          since <b className="indivisible">{formatHumanFriendly(parseISO(validUntil))}</b>.
        </>
      ),
    };
  }

  if (validSince && isBefore(now(), parseISO(validSince))) {
    return {
      icon: faCalendarXmark,
      className: 'text-warning',
      description: (
        <>
          This short URL will start working
          on <b className="indivisible">{formatHumanFriendly(parseISO(validSince))}</b>.
        </>
      ),
    };
  }

  return {
    icon: faCheck,
    className: 'text-primary',
    description: 'This short URL can be visited normally.',
  };
};

export const ShortUrlStatus: FC<ShortUrlStatusProps> = ({ shortUrl }) => {
  const tooltipRef = useElementRef<HTMLElement>();
  const { icon, className, description } = resolveShortUrlStatus(shortUrl);

  return (
    <>
      <span style={{ cursor: !description ? undefined : 'help' }} ref={tooltipRef}>
        <FontAwesomeIcon icon={icon} className={className} />
      </span>
      <UncontrolledTooltip target={tooltipRef as RefObject<HTMLElement>} placement="bottom">
        {description}
      </UncontrolledTooltip>
    </>
  );
};
