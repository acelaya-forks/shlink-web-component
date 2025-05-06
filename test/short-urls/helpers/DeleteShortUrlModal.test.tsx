import { screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import type { InvalidShortUrlDeletion, ShlinkShortUrl } from '../../../src/api-contract';
import { ErrorType } from '../../../src/api-contract';
import { DeleteShortUrlModal } from '../../../src/short-urls/helpers/DeleteShortUrlModal';
import type { ShortUrlDeletion } from '../../../src/short-urls/reducers/shortUrlDeletion';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';
import { TestModalWrapper } from '../../__helpers__/TestModalWrapper';

describe('<DeleteShortUrlModal />', () => {
  const shortUrl = fromPartial<ShlinkShortUrl>({
    tags: [],
    shortCode: 'abc123',
    longUrl: 'https://long-domain.com/foo/bar',
  });
  const deleteShortUrl = vi.fn().mockResolvedValue({});
  const shortUrlDeleted = vi.fn();
  const setUp = (shortUrlDeletion: Partial<ShortUrlDeletion>) => renderWithEvents(
    <TestModalWrapper
      renderModal={(args) => (
        <DeleteShortUrlModal
          {...args}
          shortUrl={shortUrl}
          shortUrlDeletion={fromPartial(shortUrlDeletion)}
          deleteShortUrl={deleteShortUrl}
          shortUrlDeleted={shortUrlDeleted}
          resetDeleteShortUrl={vi.fn()}
        />
      )}
    />,
  );

  it.each([
    [{ loading: false, error: false }],
    [{ loading: true, error: false }],
    [{ loading: false, error: true }],
  ])('passes a11y checks', (props) => checkAccessibility(setUp(props)));

  it('shows generic error when non-threshold error occurs', () => {
    setUp({
      loading: false,
      error: true,
      errorData: fromPartial({ type: 'OTHER_ERROR' }),
    });
    expect(screen.getByText('Something went wrong while deleting the URL :(').parentElement).not.toHaveClass(
      'bg-warning',
    );
  });

  it('shows specific error when threshold error occurs', () => {
    const errorData = fromPartial<InvalidShortUrlDeletion>({ type: ErrorType.INVALID_SHORT_URL_DELETION });
    setUp({ loading: false, error: true, errorData });
    expect(screen.getByText('Something went wrong while deleting the URL :(')).toHaveClass('tw:bg-warning');
  });

  it('disables submit button when loading', () => {
    setUp({ loading: true, error: false });
    expect(screen.getByRole('button', { name: 'Deleting...' })).toHaveAttribute('disabled');
  });

  it('enables submit button when proper short code is provided', async () => {
    const { user } = setUp({ loading: false, error: false });
    const getDeleteBtn = () => screen.getByRole('button', { name: 'Delete' });

    expect(getDeleteBtn()).toHaveAttribute('disabled');
    await user.type(screen.getByLabelText(/to confirm deletion.$/), 'delete');
    expect(getDeleteBtn()).not.toHaveAttribute('disabled');
  });

  it('tries to delete short URL when the dialog is closed', async () => {
    const { user } = setUp({
      loading: false,
      error: false,
      deleted: true,
    });

    expect(deleteShortUrl).not.toHaveBeenCalled();
    await user.type(screen.getByLabelText(/to confirm deletion.$/), 'delete');
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(deleteShortUrl).toHaveBeenCalledOnce();

    // This is eventually invoked once the modal is closed via CSS transition
    await waitFor(() => expect(shortUrlDeleted).toHaveBeenCalledOnce());
  });

  it('does not close modal if deleting the short URL failed', async () => {
    deleteShortUrl.mockResolvedValue({ error: new Error('') });
    const { user } = setUp({
      loading: false,
      error: false,
      deleted: true,
    });

    expect(deleteShortUrl).not.toHaveBeenCalled();
    await user.type(screen.getByLabelText(/to confirm deletion.$/), 'delete');
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(deleteShortUrl).toHaveBeenCalledOnce();
    expect(shortUrlDeleted).not.toHaveBeenCalledOnce();
  });
});
