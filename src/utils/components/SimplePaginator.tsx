import { clsx } from 'clsx';
import type { FC } from 'react';
import { useCallback } from 'react';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import type { NumberOrEllipsis } from '../helpers/pagination';
import {
  keyForPage,
  pageIsEllipsis,
  prettifyPageNumber,
  progressivePagination,
} from '../helpers/pagination';
import './SimplePaginator.scss';

interface SimplePaginatorProps {
  pagesCount: number;
  currentPage: number;
  onPageChange: (currentPage: number) => void;
  centered?: boolean;
}

export const SimplePaginator: FC<SimplePaginatorProps> = (
  { pagesCount, currentPage, onPageChange, centered = true },
) => {
  const onClick = useCallback(
    (page: NumberOrEllipsis) => !pageIsEllipsis(page) && onPageChange(page),
    [onPageChange],
  );

  if (pagesCount < 2) {
    return null;
  }

  return (
    <Pagination listClassName={clsx('flex-wrap mb-0 simple-paginator', { 'justify-content-center': centered })}>
      <PaginationItem disabled={currentPage <= 1}>
        <PaginationLink previous tag="span" onClick={() => onClick(currentPage - 1)} />
      </PaginationItem>
      {progressivePagination(currentPage, pagesCount).map((pageNumber, index) => (
        <PaginationItem
          key={keyForPage(pageNumber, index)}
          disabled={pageIsEllipsis(pageNumber)}
          active={currentPage === pageNumber}
        >
          <PaginationLink role="link" tag="span" onClick={() => onClick(pageNumber)}>
            {prettifyPageNumber(pageNumber)}
          </PaginationLink>
        </PaginationItem>
      ))}
      <PaginationItem disabled={currentPage >= pagesCount}>
        <PaginationLink next tag="span" onClick={() => onClick(currentPage + 1)} />
      </PaginationItem>
    </Pagination>
  );
};
