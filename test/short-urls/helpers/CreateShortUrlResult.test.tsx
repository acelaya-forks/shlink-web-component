import { fromPartial } from '@total-typescript/shoehorn';
import { page as screen } from 'vitest/browser';
import { CreateShortUrlResult } from '../../../src/short-urls/helpers/CreateShortUrlResult';
import type { ShortUrlCreation } from '../../../src/short-urls/reducers/shortUrlCreation';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<CreateShortUrlResult />', () => {
  const setUp = (creation: ShortUrlCreation, canBeClosed?: boolean) =>
    renderWithEvents(
      <CreateShortUrlResult resetCreateShortUrl={() => {}} creation={creation} canBeClosed={canBeClosed} />,
    );

  it('passes a11y checks', () =>
    checkAccessibility(setUp({ result: fromPartial({ shortUrl: 'https://s.test/abc123' }), status: 'saved' }, true)));

  it('renders an error when error is true', async () => {
    setUp({ status: 'error' });
    await expect.element(screen.getByText('An error occurred while creating the URL :(')).toBeInTheDocument();
  });

  it.each(['saving' as const, 'idle' as const])('renders nothing when not saved yet', (status) => {
    const { container } = setUp({ status });
    expect(container.firstChild).toBeNull();
  });

  it('renders a result message when result is provided', async () => {
    setUp({ result: fromPartial({ shortUrl: 'https://s.test/abc123' }), status: 'saved' });
    await expect
      .element(screen.getByText(/The short URL is/))
      .toHaveTextContent('Great! The short URL is https://s.test/abc123');
  });

  it.each([
    [
      { result: fromPartial({ shortUrl: 'https://s.test/abc123' }), status: 'saved' },
      'success-close-button',
      'error-close-button',
    ],
    [{ status: 'error' }, 'error-close-button', 'success-close-button'],
  ])('displays close button if the result can be closed', async (data, foundElement, notFoundElement) => {
    setUp(data as any, true);

    await expect.element(screen.getByTestId(foundElement)).toBeInTheDocument();
    await expect.element(screen.getByTestId(notFoundElement)).not.toBeInTheDocument();
  });
});
