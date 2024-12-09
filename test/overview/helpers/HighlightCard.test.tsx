import { screen, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router';
import type { HighlightCardProps } from '../../../src/overview/helpers/HighlightCard';
import { HighlightCard } from '../../../src/overview/helpers/HighlightCard';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<HighlightCard />', () => {
  const setUp = (props: PropsWithChildren<Partial<HighlightCardProps>>) => renderWithEvents(
    <MemoryRouter>
      <HighlightCard link="" title="title" {...props} />
    </MemoryRouter>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp({ children: 'Something' })));

  it.each([
    ['foo'],
    ['bar'],
    ['baz'],
  ])('renders provided title', (title) => {
    setUp({ title });
    expect(screen.getByText(title)).toHaveClass('highlight-card__title');
  });

  it.each([
    ['foo'],
    ['bar'],
    ['baz'],
  ])('renders provided children', (children) => {
    setUp({ children });
    expect(screen.getByText(children)).toHaveClass('card-text');
  });

  it.each([
    ['foo'],
    ['bar'],
    ['baz'],
  ])('adds extra props when a link is provided', (link) => {
    setUp({ link });

    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', `/${link}`);
  });

  it('renders tooltip when provided', async () => {
    const { user } = setUp({ children: 'Foo', tooltip: 'This is the tooltip' });

    await user.hover(screen.getByText('Foo'));
    await waitFor(() => expect(screen.getByText('This is the tooltip')).toBeInTheDocument());
  });
});
