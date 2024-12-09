import { Link } from 'react-router';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import type { ShlinkPaginator } from '../api-contract';
import type {
  NumberOrEllipsis } from '../utils/helpers/pagination';
import {
  keyForPage,
  pageIsEllipsis,
  prettifyPageNumber,
  progressivePagination,
} from '../utils/helpers/pagination';
import { useRoutesPrefix } from '../utils/routesPrefix';

interface PaginatorProps {
  paginator?: ShlinkPaginator;
  currentQueryString?: string;
}

export const Paginator = ({ paginator, currentQueryString = '' }: PaginatorProps) => {
  const { currentPage = 0, pagesCount = 0 } = paginator ?? {};
  const routesPrefix = useRoutesPrefix();
  const urlForPage = (pageNumber: NumberOrEllipsis) =>
    `${routesPrefix}/list-short-urls/${pageNumber}${currentQueryString}`;

  if (pagesCount <= 1) {
    return <div className="pb-3" />; // Return some space
  }

  const renderPages = () =>
    progressivePagination(currentPage, pagesCount).map((pageNumber, index) => (
      <PaginationItem
        key={keyForPage(pageNumber, index)}
        disabled={pageIsEllipsis(pageNumber)}
        active={currentPage === pageNumber}
      >
        <PaginationLink tag={Link} to={urlForPage(pageNumber)}>
          {prettifyPageNumber(pageNumber)}
        </PaginationLink>
      </PaginationItem>
    ));

  return (
    <Pagination className="sticky-card-paginator py-3" listClassName="flex-wrap justify-content-center mb-0">
      <PaginationItem disabled={currentPage === 1}>
        <PaginationLink previous tag={Link} to={urlForPage(currentPage - 1)} />
      </PaginationItem>
      {renderPages()}
      <PaginationItem disabled={currentPage >= pagesCount}>
        <PaginationLink next tag={Link} to={urlForPage(currentPage + 1)} />
      </PaginationItem>
    </Pagination>
  );
};
