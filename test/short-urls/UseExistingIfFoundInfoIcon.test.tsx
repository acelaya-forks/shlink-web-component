import { page as screen } from 'vitest/browser';
import type { UserEvent } from 'vitest/browser';
import { UseExistingIfFoundInfoIcon } from '../../src/short-urls/UseExistingIfFoundInfoIcon';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithEvents } from '../__helpers__/setUpTest';

describe('<UseExistingIfFoundInfoIcon />', () => {
  const setUp = () => renderWithEvents(<UseExistingIfFoundInfoIcon />);
  const openModal = (user: UserEvent) => user.click(screen.getByRole('button'));

  it.each([
    [setUp],
    [
      async () => {
        const { user, container } = setUp();
        await openModal(user);

        return { container };
      },
    ],
  ])('passes a11y checks', (setUp) => checkAccessibility(setUp()));

  it('shows modal when icon is clicked', async () => {
    const { user } = setUp();

    await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
    await openModal(user);
    await expect.element(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
