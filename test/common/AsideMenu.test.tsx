import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { page as screen } from 'vitest/browser';
import { AsideMenu } from '../../src/common/AsideMenu';
import { checkAccessibility } from '../__helpers__/accessibility';

describe('<AsideMenu />', () => {
  const setUp = () =>
    render(
      <MemoryRouter>
        <AsideMenu routePrefix="/abc123" />
      </MemoryRouter>,
    );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('contains links to different sections', async () => {
    setUp();

    const links = screen.getByRole('link').all();

    expect.assertions(links.length + 1);
    expect(links).toHaveLength(5);

    await Promise.all(
      links.map((link) => expect.element(link).toHaveAttribute('href', expect.stringContaining('abc123'))),
    );
  });
});
