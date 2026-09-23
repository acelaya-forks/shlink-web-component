import { page as screen } from 'vitest/browser';
import { fromPartial } from '@total-typescript/shoehorn';
import type { UserEvent } from 'vitest/browser';
import { DomainSelector } from '../../src/domains/DomainSelector';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithEvents } from '../__helpers__/setUpTest';

describe('<DomainSelector />', () => {
  const setUp = (value = '') =>
    renderWithEvents(
      <DomainSelector
        value={value}
        onChange={vi.fn()}
        domains={[
          fromPartial({ domain: 'default.com', isDefault: true }),
          fromPartial({ domain: 'foo.com' }),
          fromPartial({ domain: 'bar.com' }),
        ]}
      />,
    );

  const switchToInputMode = async (user: UserEvent) => {
    await user.click(screen.getByRole('button', { name: 'Domain' }));
    await user.click(await screen.getByText('New domain').findElement());
  };

  it.each([
    [setUp],
    [
      async () => {
        const { user, container } = setUp();
        await switchToInputMode(user);

        return { container };
      },
    ],
  ])('passes a11y checks', (setUp) => checkAccessibility(setUp()));

  it.each([
    ['', 'Domain', true],
    ['my-domain.com', 'Domain: my-domain.com', false],
  ])('shows dropdown by default', async (value, expectedText, hasPlaceholderClass) => {
    const { user } = setUp(value);
    const btn = screen.getByRole('button', { name: expectedText });

    await expect.element(screen.getByPlaceholder('Domain')).not.toBeInTheDocument();
    if (hasPlaceholderClass) {
      await expect.element(btn).toHaveClass('text-placeholder');
    } else {
      await expect.element(btn).not.toHaveClass('text-placeholder');
    }
    await user.click(btn);

    await expect.element(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem').all()).toHaveLength(4);
  });

  it('allows toggling between dropdown and input', async () => {
    const { user } = setUp();

    await expect.element(screen.getByPlaceholder('Domain')).not.toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Domain' })).toBeInTheDocument();

    await switchToInputMode(user);

    await expect.element(screen.getByPlaceholder('Domain')).toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Domain' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Back to domains list' }));

    await expect.element(screen.getByPlaceholder('Domain')).not.toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Domain' })).toBeInTheDocument();
  });

  it.each([
    [0, 'default.comdefault'],
    [1, 'foo.com'],
    [2, 'bar.com'],
  ])('shows expected content on every item', async (index, expectedContent) => {
    const { user } = setUp();

    await user.click(screen.getByRole('button', { name: 'Domain' }));
    const items = screen.getByRole('menuitem').all();

    await expect.element(items[index]).toHaveTextContent(expectedContent);
  });
});
