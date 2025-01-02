import { faInfoCircle as infoIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useElementRef } from '@shlinkio/shlink-frontend-kit';
import { clsx } from 'clsx';
import type { RefObject } from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import type { ShlinkShortUrl } from '../../api-contract';
import { formatHumanFriendly, parseISO } from '../../utils/dates/helpers/date';
import { prettify } from '../../utils/helpers/numbers';
import { ShortUrlDetailLink } from './ShortUrlDetailLink';
import './ShortUrlVisitsCount.scss';

interface ShortUrlVisitsCountProps {
  shortUrl?: ShlinkShortUrl | null;
  visitsCount: number;
  active?: boolean;
  asLink?: boolean;
}

export const ShortUrlVisitsCount = (
  { visitsCount, shortUrl, active = false, asLink = false }: ShortUrlVisitsCountProps,
) => {
  const tooltipRef = useElementRef<HTMLElement>();
  const { maxVisits, validSince, validUntil } = shortUrl?.meta ?? {};
  const hasLimit = !!maxVisits || !!validSince || !!validUntil;
  const visitsLink = (
    <ShortUrlDetailLink shortUrl={shortUrl} suffix="visits" asLink={asLink}>
      <strong className={clsx('short-url-visits-count__amount', { 'short-url-visits-count__amount--big': active })}>
        {prettify(visitsCount)}
      </strong>
    </ShortUrlDetailLink>
  );

  if (!hasLimit) {
    return visitsLink;
  }

  return (
    <>
      <span className="indivisible">
        {visitsLink}
        <small className="short-urls-visits-count__max-visits-control" ref={tooltipRef}>
          {maxVisits && <> / {prettify(maxVisits)}</>}
          <sup className="ms-1">
            <FontAwesomeIcon icon={infoIcon} />
          </sup>
        </small>
      </span>
      <UncontrolledTooltip target={tooltipRef as RefObject<HTMLElement>} placement="bottom">
        <ul className="list-unstyled mb-0">
          {maxVisits && (
            <li className="short-url-visits-count__tooltip-list-item">
              This short URL will not accept more than <b>{prettify(maxVisits)}</b> visit{maxVisits === 1 ? '' : 's'}.
            </li>
          )}
          {validSince && (
            <li className="short-url-visits-count__tooltip-list-item">
              This short URL will not accept visits
              before <b className="indivisible">{formatHumanFriendly(parseISO(validSince))}</b>.
            </li>
          )}
          {validUntil && (
            <li className="short-url-visits-count__tooltip-list-item">
              This short URL will not accept visits
              after <b className="indivisible">{formatHumanFriendly(parseISO(validUntil))}</b>.
            </li>
          )}
        </ul>
      </UncontrolledTooltip>
    </>
  );
};
