import { faCheck as checkIcon, faRobot as botIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { splitEvery } from '@shlinkio/data-manipulation';
import type { Order } from '@shlinkio/shlink-frontend-kit';
import { determineOrderDir, SearchField, sortList } from '@shlinkio/shlink-frontend-kit';
import { clsx } from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import { SimplePaginator } from '../utils/components/SimplePaginator';
import { Time } from '../utils/dates/Time';
import { useMaxResolution } from '../utils/helpers/hooks';
import { prettify } from '../utils/helpers/numbers';
import { TableOrderIcon } from '../utils/table/TableOrderIcon';
import type { MediaMatcher } from '../utils/types';
import type { NormalizedOrphanVisit, NormalizedVisit } from './types';
import './VisitsTable.scss';

export interface VisitsTableProps {
  visits: NormalizedVisit[];
  selectedVisits?: NormalizedVisit[];
  setSelectedVisits: (visits: NormalizedVisit[]) => void;
  matchMedia?: MediaMatcher;
}

type OrderableFields = 'date' | 'country' | 'city' | 'browser' | 'os' | 'referer' | 'visitedUrl' | 'potentialBot';
type VisitsOrder = Order<OrderableFields>;

const PAGE_SIZE = 20;
const visitMatchesSearch = ({ browser, os, referer, country, city, ...rest }: NormalizedVisit, searchTerm: string) =>
  `${browser} ${os} ${referer} ${country} ${city} ${(rest as NormalizedOrphanVisit).visitedUrl}`.toLowerCase().includes(
    searchTerm.toLowerCase(),
  );
const searchVisits = (searchTerm: string, visits: NormalizedVisit[]) =>
  visits.filter((visit) => visitMatchesSearch(visit, searchTerm));
const sortVisits = (order: VisitsOrder, visits: NormalizedVisit[]) => sortList<NormalizedVisit>(visits, order as any);
const paginateVisits = (allVisits: NormalizedVisit[], searchTerm: string | undefined, order: VisitsOrder) => {
  const filteredVisits = searchTerm ? searchVisits(searchTerm, allVisits) : [...allVisits];
  const sortedVisits = sortVisits(order, filteredVisits);
  const total = sortedVisits.length;
  const visitsGroups = splitEvery(sortedVisits, PAGE_SIZE);

  return { visitsGroups, total };
};

const headerCellsClass = 'visits-table__header-cell visits-table__sticky';

export const VisitsTable = ({
  visits,
  selectedVisits = [],
  setSelectedVisits,
  matchMedia = window.matchMedia,
}: VisitsTableProps) => {
  const isMobileDevice = useMaxResolution(767, matchMedia);
  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);
  const prevSearchTerm = useRef<string | undefined>(searchTerm);
  const [order, setOrder] = useState<VisitsOrder>({});
  const paginator = useMemo(() => paginateVisits(visits, searchTerm, order), [visits, searchTerm, order]);
  const [page, setPage] = useState(1);
  const end = page * PAGE_SIZE;
  const start = end - PAGE_SIZE;
  const showVisitedUrl = useMemo(
    () => !!paginator.visitsGroups[page - 1]?.[0]?.visitedUrl,
    [page, paginator.visitsGroups],
  );
  const fullSizeColSpan = 8 + Number(showVisitedUrl);

  const orderByColumn = (field: OrderableFields) =>
    () => setOrder({ field, dir: determineOrderDir(field, order.field, order.dir) });
  const renderOrderIcon = (field: OrderableFields) =>
    <TableOrderIcon currentOrder={order} field={field} className="visits-table__header-icon" />;

  // Move to first page and clear selected visits every time the search term changes
  useEffect(() => {
    if (prevSearchTerm.current !== searchTerm) {
      setPage(1);
      setSelectedVisits([]);
    }
    prevSearchTerm.current = searchTerm;
  }, [searchTerm, setSelectedVisits]);

  return (
    <div className="table-responsive-md">
      <table className="table table-bordered table-hover table-sm visits-table">
        <thead className="visits-table__header">
          <tr>
            <th
              className={`${headerCellsClass} text-center`}
              onClick={() => setSelectedVisits(
                selectedVisits.length < paginator.total ? paginator.visitsGroups.flat() : [],
              )}
            >
              <span className="sr-only">Is selected</span>
              <FontAwesomeIcon icon={checkIcon} className={clsx({ 'text-primary': selectedVisits.length > 0 })} />
            </th>
            <th className={`${headerCellsClass} text-center`} onClick={orderByColumn('potentialBot')}>
              <span className="sr-only">Is bot</span>
              <FontAwesomeIcon icon={botIcon} />
              {renderOrderIcon('potentialBot')}
            </th>
            <th className={headerCellsClass} onClick={orderByColumn('date')}>
              Date
              {renderOrderIcon('date')}
            </th>
            <th className={headerCellsClass} onClick={orderByColumn('country')}>
              Country
              {renderOrderIcon('country')}
            </th>
            <th className={headerCellsClass} onClick={orderByColumn('city')}>
              City
              {renderOrderIcon('city')}
            </th>
            <th className={headerCellsClass} onClick={orderByColumn('browser')}>
              Browser
              {renderOrderIcon('browser')}
            </th>
            <th className={headerCellsClass} onClick={orderByColumn('os')}>
              OS
              {renderOrderIcon('os')}
            </th>
            <th className={headerCellsClass} onClick={orderByColumn('referer')}>
              Referrer
              {renderOrderIcon('referer')}
            </th>
            {showVisitedUrl && (
              <th className={headerCellsClass} onClick={orderByColumn('visitedUrl')}>
                Visited URL
                {renderOrderIcon('visitedUrl')}
              </th>
            )}
          </tr>
          <tr>
            <td colSpan={fullSizeColSpan} className="p-0">
              <SearchField noBorder large={false} onChange={setSearchTerm} />
            </td>
          </tr>
        </thead>
        <tbody>
          {paginator.total === 0 && (
            <tr>
              <td colSpan={fullSizeColSpan} className="text-center">
                There are no visits matching current filter
              </td>
            </tr>
          )}
          {paginator.visitsGroups[page - 1]?.map((visit, index) => {
            const isSelected = selectedVisits.includes(visit);

            return (
              <tr
                key={index}
                style={{ cursor: 'pointer' }}
                className={clsx({ 'table-active': isSelected })}
                onClick={() => setSelectedVisits(
                  isSelected ? selectedVisits.filter((v) => v !== visit) : [...selectedVisits, visit],
                )}
              >
                <td className="text-center">
                  {isSelected && <FontAwesomeIcon icon={checkIcon} className="text-primary" />}
                </td>
                <td className="text-center">
                  {visit.potentialBot && (
                    <>
                      <FontAwesomeIcon icon={botIcon} id={`botIcon${index}`} />
                      <UncontrolledTooltip placement="right" target={`botIcon${index}`}>
                        Potentially a visit from a bot or crawler
                      </UncontrolledTooltip>
                    </>
                  )}
                </td>
                {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                <td><Time date={visit.date} /></td>
                <td>{visit.country}</td>
                <td>{visit.city}</td>
                <td>{visit.browser}</td>
                <td>{visit.os}</td>
                <td>{visit.referer}</td>
                {visit.visitedUrl && <td>{visit.visitedUrl}</td>}
              </tr>
            );
          })}
        </tbody>
        {paginator.total > PAGE_SIZE && (
          <tfoot>
            <tr>
              <td colSpan={fullSizeColSpan} className="visits-table__footer-cell visits-table__sticky">
                <div className="row">
                  <div className="col-md-6">
                    <SimplePaginator
                      pagesCount={Math.ceil(paginator.total / PAGE_SIZE)}
                      currentPage={page}
                      setCurrentPage={setPage}
                      centered={isMobileDevice}
                    />
                  </div>
                  <div
                    className={clsx('col-md-6', {
                      'd-flex align-items-center flex-row-reverse': !isMobileDevice,
                      'text-center mt-3': isMobileDevice,
                    })}
                  >
                    <div>
                      Visits <b>{prettify(start + 1)}</b> to{' '}
                      <b>{prettify(Math.min(end, paginator.total))}</b> of{' '}
                      <b>{prettify(paginator.total)}</b>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};
