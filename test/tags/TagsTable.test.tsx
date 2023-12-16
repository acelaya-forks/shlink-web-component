import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { TagsTableFactory } from '../../src/tags/TagsTable';
import type { TagsTableRowProps } from '../../src/tags/TagsTableRow';
import { rangeOf } from '../../src/utils/helpers';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithEvents } from '../__helpers__/setUpTest';

describe('<TagsTable />', () => {
  const orderByColumn = vi.fn();
  const TagsTable = TagsTableFactory(fromPartial({
    TagsTableRow: ({ tag }: TagsTableRowProps) => <tr><td>TagsTableRow [{tag.tag}]</td></tr>,
  }));
  const tags = (amount: number) => rangeOf(amount, (i) => `tag_${i}`);
  const setUp = (sortedTags: string[] = [], search = '') => {
    const history = createMemoryHistory({ initialEntries: search ? [{ search }] : undefined });
    return renderWithEvents(
      <Router location={history.location} navigator={history}>
        <TagsTable
          sortedTags={sortedTags.map((tag) => fromPartial({ tag }))}
          currentOrder={{}}
          orderByColumn={() => orderByColumn}
        />
      </Router>,
    );
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('renders empty result if there are no tags', () => {
    setUp();

    expect(screen.queryByText(/^TagsTableRow/)).not.toBeInTheDocument();
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it.each([
    [['foo', 'bar', 'baz'], 3],
    [['foo'], 1],
    [tags(19), 19],
    [tags(20), 20],
    [tags(30), 20],
    [tags(100), 20],
  ])('renders as many rows as there are in current page', (filteredTags, expectedRows) => {
    setUp(filteredTags);

    expect(screen.getAllByText(/^TagsTableRow/)).toHaveLength(expectedRows);
    expect(screen.queryByText('No results found')).not.toBeInTheDocument();
  });

  it.each([
    [['foo', 'bar', 'baz'], 0],
    [['foo'], 0],
    [tags(19), 0],
    [tags(20), 0],
    [tags(30), 1],
    [tags(100), 1],
  ])('renders paginator if there are more than one page', (filteredTags, expectedPaginators) => {
    const { container } = setUp(filteredTags);
    expect(container.querySelectorAll('.sticky-card-paginator')).toHaveLength(expectedPaginators);
  });

  it.each([
    [1, 20, 0],
    [2, 20, 20],
    [3, 20, 40],
    [4, 20, 60],
    [5, 7, 80],
    [6, 0, 0],
  ])('renders page from query if present', (page, expectedRows, offset) => {
    setUp(tags(87), `page=${page}`);

    const tagRows = screen.queryAllByText(/^TagsTableRow/);

    expect(tagRows).toHaveLength(expectedRows);
    tagRows.forEach((row, index) => expect(row).toHaveTextContent(`[tag_${index + offset + 1}]`));
  });

  it('allows changing current page in paginator', async () => {
    const { user, container } = setUp(tags(100));

    expect(container.querySelector('.active')).toHaveTextContent('1');
    await user.click(screen.getByText('5'));
    expect(container.querySelector('.active')).toHaveTextContent('5');
  });

  it('orders tags when column is clicked', async () => {
    const { user } = setUp(tags(100));
    const headers = screen.getAllByRole('columnheader');

    expect(orderByColumn).not.toHaveBeenCalled();
    await user.click(headers[0]);
    await user.click(headers[2]);
    await user.click(headers[1]);
    expect(orderByColumn).toHaveBeenCalledTimes(3);
  });
});
