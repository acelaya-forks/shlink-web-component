import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router';
import { page as screen } from 'vitest/browser';
import { ShlinkWebSettings } from '../../../src/settings';
import { checkAccessibility } from '../../__helpers__/accessibility';

describe('<ShlinkWebSettings />', () => {
  const setUp = (activeRoute = '/') => {
    const history = createMemoryHistory();
    history.push(activeRoute);
    return render(
      <Router location={history.location} navigator={history}>
        <ShlinkWebSettings settings={{}} defaultShortUrlsListOrdering={{}} />
      </Router>,
    );
  };

  it.each(['/general', '/short-urls', '/visits', '/tags', '/qr-codes'])('passes a11y checks', (activeRoute) =>
    checkAccessibility(setUp(activeRoute)),
  );

  it.each([
    {
      activeRoute: '/general',
      visibleComps: ['User interface', 'Real-time updates'],
      hiddenComps: ['Short URLs form', 'Short URLs list', 'Tags', 'Visits', 'Size', 'Colors', 'Format', 'Visits list'],
    },
    {
      activeRoute: '/short-urls',
      visibleComps: ['Short URLs form', 'Short URLs list'],
      hiddenComps: ['User interface', 'Real-time updates', 'Tags', 'Visits', 'Size', 'Colors', 'Format', 'Visits list'],
    },
    {
      activeRoute: '/visits',
      visibleComps: ['Visits', 'Visits list'],
      hiddenComps: [
        'Short URLs form',
        'Short URLs list',
        'User interface',
        'Real-time updates',
        'Tags',
        'Size',
        'Colors',
        'Format',
      ],
    },
    {
      activeRoute: '/tags',
      visibleComps: ['Tags'],
      hiddenComps: [
        'User interface',
        'Real-time updates',
        'Short URLs form',
        'Short URLs list',
        'Size',
        'Colors',
        'Format',
        'Visits',
        'Visits list',
      ],
    },
    {
      activeRoute: '/qr-codes',
      visibleComps: ['Size', 'Colors', 'Format'],
      hiddenComps: [
        'Short URLs form',
        'Short URLs list',
        'User interface',
        'Real-time updates',
        'Tags',
        'Visits',
        'Visits list',
      ],
    },
  ])('renders expected sections based on route', async ({ activeRoute, visibleComps, hiddenComps }) => {
    setUp(activeRoute);

    await Promise.all([
      ...visibleComps.map((name) => expect.element(screen.getByRole('heading', { name })).toBeInTheDocument()),
      ...hiddenComps.map((name) => expect.element(screen.getByRole('heading', { name })).not.toBeInTheDocument()),
    ]);
  });

  it('renders expected menu', async () => {
    setUp();

    await expect.element(screen.getByRole('menuitem', { name: 'General' })).toHaveAttribute('href', '/general');
    await expect.element(screen.getByRole('menuitem', { name: 'Short URLs' })).toHaveAttribute('href', '/short-urls');
    await expect.element(screen.getByRole('menuitem', { name: 'Visits' })).toHaveAttribute('href', '/visits');
    await expect.element(screen.getByRole('menuitem', { name: 'Tags' })).toHaveAttribute('href', '/tags');
    await expect.element(screen.getByRole('menuitem', { name: 'QR codes' })).toHaveAttribute('href', '/qr-codes');
  });
});
