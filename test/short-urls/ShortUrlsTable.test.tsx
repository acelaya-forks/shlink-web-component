import { fireEvent, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import type { ShortUrlsOrderableFields } from '../../src/short-urls/data';
import { SHORT_URLS_ORDERABLE_FIELDS } from '../../src/short-urls/data';
import type { ShortUrlsList } from '../../src/short-urls/reducers/shortUrlsList';
import { ShortUrlsTableFactory } from '../../src/short-urls/ShortUrlsTable';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithEvents } from '../__helpers__/setUpTest';

describe('<ShortUrlsTable />', () => {
  const shortUrlsList = fromPartial<ShortUrlsList>({});
  const orderByColumn = vi.fn();
  const ShortUrlsTable = ShortUrlsTableFactory(fromPartial({ ShortUrlsRow: () => <span>ShortUrlsRow</span> }));
  const setUp = () => renderWithEvents(
    <ShortUrlsTable shortUrlsList={shortUrlsList} orderByColumn={() => orderByColumn} />,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('should render inner table by default', () => {
    setUp();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('should render row groups by default', () => {
    setUp();
    expect(screen.getAllByRole('rowgroup')).toHaveLength(1);
  });

  it('should render expected amount of table header cells', () => {
    setUp();
    expect(screen.getAllByRole('columnheader', { hidden: true })).toHaveLength(6);
  });

  it('should render table header cells without "order by" icon by default', () => {
    setUp();
    expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
  });

  it('should render table header cells with conditional order by icon', () => {
    setUp();

    const getThElementForSortableField = (orderableField: string) => screen.getAllByRole(
      'columnheader',
      { hidden: true },
    ).find(
      ({ innerHTML }) => innerHTML.includes(SHORT_URLS_ORDERABLE_FIELDS[orderableField as ShortUrlsOrderableFields]),
    );
    const sortableFields = Object.keys(SHORT_URLS_ORDERABLE_FIELDS).filter((sortableField) => sortableField !== 'title');

    expect.assertions(sortableFields.length * 2);
    sortableFields.forEach((sortableField) => {
      const element = getThElementForSortableField(sortableField);

      expect(element).toBeDefined();
      if (element) {
        fireEvent.click(element);
      }
      expect(orderByColumn).toHaveBeenCalled();
    });
  });

  it('should render composed title column', () => {
    setUp();

    const { innerHTML } = screen.getAllByRole('columnheader', { hidden: true })[2];

    expect(innerHTML).toContain('Title');
    expect(innerHTML).toContain('Long URL');
  });
});
