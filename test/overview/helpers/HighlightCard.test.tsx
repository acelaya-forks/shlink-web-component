import type { PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router';
import { page as screen } from 'vitest/browser';
import type { HighlightCardProps } from '../../../src/overview/helpers/HighlightCard';
import { HighlightCard } from '../../../src/overview/helpers/HighlightCard';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<HighlightCard />', () => {
  const setUp = (props: PropsWithChildren<Partial<HighlightCardProps>>) =>
    renderWithEvents(
      <MemoryRouter>
        <HighlightCard link="" title="title" {...props} />
      </MemoryRouter>,
    );

  it('passes a11y checks', () => checkAccessibility(setUp({ children: 'Something' })));

  it.each([['foo'], ['bar'], ['baz']])('renders provided title', async (title) => {
    setUp({ title });
    await expect.element(screen.getByRole('heading')).toHaveTextContent(title);
  });

  it.each([['foo'], ['bar'], ['baz']])('renders provided children', async (children) => {
    setUp({ children });
    await expect.element(screen.getByText(children)).toBeInTheDocument();
  });

  it.each([['foo'], ['bar'], ['baz']])('adds extra props when a link is provided', async (link) => {
    setUp({ link });

    await expect.element(screen.getByRole('img', { includeHidden: true })).toBeInTheDocument();
    await expect.element(screen.getByRole('link')).toHaveAttribute('href', `/${link}`);
  });

  it('renders tooltip when provided', async () => {
    const { user } = setUp({ children: 'Foo', tooltip: 'This is the tooltip' });

    await user.hover(screen.getByText('Foo'));
    await expect.element(screen.getByText(/This is the tooltip/)).toBeInTheDocument();
    await user.unhover(screen.getByText('Foo'));
  });
});
