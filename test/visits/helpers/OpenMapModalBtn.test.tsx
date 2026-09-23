import { fromPartial } from '@total-typescript/shoehorn';
import { page as screen } from 'vitest/browser';
import type { UserEvent } from 'vitest/browser';
import { OpenMapModalBtn } from '../../../src/visits/helpers/OpenMapModalBtn';
import type { CityStats } from '../../../src/visits/types';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<OpenMapModalBtn />', () => {
  const title = 'Foo';
  const locations: CityStats[] = [
    fromPartial({ cityName: 'foo', count: 30, latLong: [5, 5] }),
    fromPartial({ cityName: 'bar', count: 45, latLong: [88, 88] }),
  ];
  const setUp = (activeCities?: string[]) =>
    renderWithEvents(<OpenMapModalBtn modalTitle={title} locations={locations} activeCities={activeCities} />);
  const openDropdown = (user: UserEvent) => user.click(screen.getByRole('button'));

  it.each([
    [setUp],
    [
      async () => {
        const { user, container } = setUp();
        await openDropdown(user);

        return { container };
      },
    ],
  ])('passes a11y checks', (setUp) => checkAccessibility(setUp()));

  it('opens modal on click', async () => {
    const { user } = setUp();

    await Promise.all([
      expect.element(screen.getByRole('dialog')).not.toBeInTheDocument(),
      expect.element(screen.getByRole('menu')).not.toBeInTheDocument(),
    ]);

    await openDropdown(user);

    await Promise.all([
      expect.element(screen.getByRole('dialog')).toBeInTheDocument(),
      expect.element(screen.getByRole('menu')).not.toBeInTheDocument(),
    ]);
  });

  it('opens dropdown instead of modal when a list of active cities has been provided', async () => {
    const { user } = setUp(['bar']);

    await Promise.all([
      expect.element(screen.getByRole('menu')).not.toBeInTheDocument(),
      expect.element(screen.getByRole('dialog')).not.toBeInTheDocument(),
    ]);

    await openDropdown(user);

    await Promise.all([
      expect.element(screen.getByRole('menu')).toBeInTheDocument(),
      expect.element(screen.getByRole('dialog')).not.toBeInTheDocument(),
    ]);
  });

  it.each([
    ['Show all locations', 2],
    ['Show locations in current page', 1],
  ])('filters out non-active cities from list of locations', async (name, expectedMarkers) => {
    const { user } = setUp(['bar']);

    await openDropdown(user);
    await user.click(screen.getByRole('menuitem', { name }));
    await screen.getByRole('dialog').findElement();

    expect(screen.getByAltText('Marker').all()).toHaveLength(expectedMarkers);
  });
});
