import { faInfoCircle as infoIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatNumber, Tooltip, useTooltip } from '@shlinkio/shlink-frontend-kit';
import { clsx } from 'clsx';
import type { ShlinkShortUrl } from '../../api-contract';
import { formatHumanFriendly, parseISO } from '../../utils/dates/helpers/date';
import { ShortUrlDetailLink } from './ShortUrlDetailLink';

interface ShortUrlVisitsCountProps {
  shortUrl?: ShlinkShortUrl | null;
  visitsCount: number;
  active?: boolean;
  asLink?: boolean;
}

export const ShortUrlVisitsCount = (
  { visitsCount, shortUrl, active = false, asLink = false }: ShortUrlVisitsCountProps,
) => {
  const { anchor, tooltip } = useTooltip();
  const { maxVisits, validSince, validUntil } = shortUrl?.meta ?? {};
  const hasLimit = !!maxVisits || !!validSince || !!validUntil;
  const visitsLink = (
    <ShortUrlDetailLink shortUrl={shortUrl} suffix="visits" asLink={asLink}>
      <strong className={clsx('inline-block transition-all duration-300', { 'scale-150': active })}>
        {formatNumber(visitsCount)}
      </strong>
    </ShortUrlDetailLink>
  );

  if (!hasLimit) {
    return visitsLink;
  }

  return (
    <>
      <span className="whitespace-nowrap">
        {visitsLink}
        <small className="cursor-help" {...anchor}>
          {maxVisits && <> / {formatNumber(maxVisits)}</>}
          <sup className="ml-1">
            <FontAwesomeIcon icon={infoIcon} />
          </sup>
        </small>
      </span>
      <Tooltip {...tooltip}>
        <ul className="flex flex-col gap-y-2">
          {maxVisits && (
            <li>
              This short URL will not accept more than <b>{formatNumber(maxVisits)}</b> visit{maxVisits === 1 ? '' : 's'}.
            </li>
          )}
          {validSince && (
            <li>
              This short URL will not accept visits
              before <b className="whitespace-nowrap">{formatHumanFriendly(parseISO(validSince))}</b>.
            </li>
          )}
          {validUntil && (
            <li>
              This short URL will not accept visits
              after <b className="whitespace-nowrap">{formatHumanFriendly(parseISO(validUntil))}</b>.
            </li>
          )}
        </ul>
      </Tooltip>
    </>
  );
};
