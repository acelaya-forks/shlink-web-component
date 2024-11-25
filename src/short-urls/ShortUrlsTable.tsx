import { clsx } from 'clsx';
import type { FC, ReactNode } from 'react';
import type { FCWithDeps } from '../container/utils';
import { componentFactory, useDependencies } from '../container/utils';
import { UnstyledButton } from '../utils/components/UnstyledButton';
import type { ShortUrlsOrderableFields } from './data';
import type { ShortUrlsRowType } from './helpers/ShortUrlsRow';
import type { ShortUrlsList as ShortUrlsListState } from './reducers/shortUrlsList';
import './ShortUrlsTable.scss';

type ShortUrlsTableProps = {
  orderByColumn?: (column: ShortUrlsOrderableFields) => () => void;
  renderOrderIcon?: (column: ShortUrlsOrderableFields) => ReactNode;
  shortUrlsList: ShortUrlsListState;
  onTagClick?: (tag: string) => void;
  className?: string;
};

type ShortUrlsTableDeps = {
  ShortUrlsRow: ShortUrlsRowType;
};

type ShortUrlsTableBodyProps = ShortUrlsTableDeps & Pick<ShortUrlsTableProps, 'shortUrlsList' | 'onTagClick'>;

const ShortUrlsTableBody: FC<ShortUrlsTableBodyProps> = ({ shortUrlsList, onTagClick, ShortUrlsRow }) => {
  const { error, loading, shortUrls } = shortUrlsList;

  if (error) {
    return (
      <tr>
        <td colSpan={6} className="text-center table-danger text-dark">
          Something went wrong while loading short URLs :(
        </td>
      </tr>
    );
  }

  if (loading) {
    return <tr><td colSpan={6} className="text-center">Loading...</td></tr>;
  }

  if (!loading && (!shortUrls || shortUrls.data.length === 0)) {
    return <tr><td colSpan={6} className="text-center">No results found</td></tr>;
  }

  return shortUrls?.data.map((shortUrl) => (
    <ShortUrlsRow
      key={shortUrl.shortUrl}
      shortUrl={shortUrl}
      onTagClick={onTagClick}
    />
  ));
};

const ShortUrlsTable: FCWithDeps<ShortUrlsTableProps, ShortUrlsTableDeps> = ({
  orderByColumn,
  renderOrderIcon,
  shortUrlsList,
  onTagClick,
  className,
}: ShortUrlsTableProps) => {
  const { ShortUrlsRow } = useDependencies(ShortUrlsTable);
  const actionableFieldClasses = clsx({ 'short-urls-table__header-cell--with-action': !!orderByColumn });
  const orderableColumnsClasses = clsx('short-urls-table__header-cell', actionableFieldClasses);
  const tableClasses = clsx('table table-hover responsive-table short-urls-table', className);

  return (
    <table className={tableClasses}>
      <thead className="responsive-table__header short-urls-table__header">
        <tr>
          <th className={orderableColumnsClasses} onClick={orderByColumn?.('dateCreated')}>
            Created at {renderOrderIcon?.('dateCreated')}
          </th>
          <th className={orderableColumnsClasses} onClick={orderByColumn?.('shortCode')}>
            Short URL {renderOrderIcon?.('shortCode')}
          </th>
          <th className="short-urls-table__header-cell">
            <UnstyledButton className={clsx('p-0', actionableFieldClasses)} onClick={orderByColumn?.('title')}>
              Title {renderOrderIcon?.('title')}
            </UnstyledButton>
            &nbsp;&nbsp;/&nbsp;&nbsp;
            <UnstyledButton className={clsx('p-0', actionableFieldClasses)} onClick={orderByColumn?.('longUrl')}>
              <span className="indivisible">Long URL</span> {renderOrderIcon?.('longUrl')}
            </UnstyledButton>
          </th>
          <th className="short-urls-table__header-cell">Tags</th>
          <th className={orderableColumnsClasses} onClick={orderByColumn?.('visits')}>
            <span className="indivisible">Visits {renderOrderIcon?.('visits')}</span>
          </th>
          <th className="short-urls-table__header-cell" colSpan={2} aria-hidden />
        </tr>
      </thead>
      <tbody>
        <ShortUrlsTableBody ShortUrlsRow={ShortUrlsRow} shortUrlsList={shortUrlsList} onTagClick={onTagClick} />
      </tbody>
    </table>
  );
};

export type ShortUrlsTableType = typeof ShortUrlsTable;

export const ShortUrlsTableFactory = componentFactory(ShortUrlsTable, ['ShortUrlsRow']);
