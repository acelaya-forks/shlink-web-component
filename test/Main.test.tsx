import { render, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import { ShlinkSidebarVisibilityProvider } from '../src';
import type { MainProps } from '../src/Main';
import { MainFactory } from '../src/Main';
import { FeaturesProvider } from '../src/utils/features';
import { checkAccessibility } from './__helpers__/accessibility';

type SetUpOptions = {
  currentPath?: string
  createNotFound?: MainProps['createNotFound'];
  supportsRedirectRules?: boolean;
  autoToggleButton?: boolean;
};

describe('<Main />', () => {
  const Main = MainFactory(fromPartial({
    TagsList: () => <>TagsList</>,
    ShortUrlsList: () => <>ShortUrlsList</>,
    CreateShortUrl: () => <>CreateShortUrl</>,
    ShortUrlVisits: () => <>ShortUrlVisits</>,
    TagVisits: () => <>TagVisits</>,
    DomainVisits: () => <>DomainVisits</>,
    OrphanVisits: () => <>OrphanVisits</>,
    NonOrphanVisits: () => <>NonOrphanVisits</>,
    Overview: () => <>OverviewRoute</>,
    EditShortUrl: () => <>EditShortUrl</>,
    ManageDomains: () => <>ManageDomains</>,
    TagVisitsComparison: () => <>TagVisitsComparison</>,
    DomainVisitsComparison: () => <>DomainVisitsComparison</>,
    ShortUrlVisitsComparison: () => <>ShortUrlVisitsComparison</>,
    ShortUrlRedirectRules: () => <>ShortUrlRedirectRules</>,
  }));
  const setUp = (
    { createNotFound, currentPath = '/', supportsRedirectRules = false, autoToggleButton = true }: SetUpOptions,
  ) => render(
    <MemoryRouter initialEntries={[{ pathname: currentPath }]}>
      <FeaturesProvider value={fromPartial({ shortUrlRedirectRules: supportsRedirectRules })}>
        <ShlinkSidebarVisibilityProvider>
          <Main createNotFound={createNotFound} autoToggleButton={autoToggleButton} />
        </ShlinkSidebarVisibilityProvider>
      </FeaturesProvider>
    </MemoryRouter>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp({})));

  it.each([
    ['/overview', 'OverviewRoute'],
    ['/list-short-urls/1', 'ShortUrlsList'],
    ['/create-short-url', 'CreateShortUrl'],
    ['/short-code/abc123/visits/foo', 'ShortUrlVisits'],
    ['/short-code/abc123/edit', 'EditShortUrl'],
    ['/short-code/abc123/redirect-rules', 'ShortUrlRedirectRules'],
    ['/tag/foo/visits/foo', 'TagVisits'],
    ['/orphan-visits/foo', 'OrphanVisits'],
    ['/manage-tags', 'TagsList'],
    ['/domain/domain.com/visits/foo', 'DomainVisits'],
    ['/non-orphan-visits/foo', 'NonOrphanVisits'],
    ['/manage-domains', 'ManageDomains'],
    ['/tags/compare-visits', 'TagVisitsComparison'],
    ['/domains/compare-visits', 'DomainVisitsComparison'],
    ['/short-urls/compare-visits', 'ShortUrlVisitsComparison'],
  ])(
    'renders expected component based on location and server version',
    (currentPath, expectedContent) => {
      setUp({ currentPath, supportsRedirectRules: true });
      expect(screen.getByText(expectedContent)).toBeInTheDocument();
    },
  );

  it.each([
    ['/foo/bar/baz', true],
    ['/foo/bar/baz', false],
    ['/short-code/abc123/redirect-rules', false],
  ])('renders not-found when trying to navigate to invalid route', (currentPath, supportsRedirectRules) => {
    const createNotFound = () => <>Oops! Route not found.</>;

    setUp({ currentPath, supportsRedirectRules, createNotFound });

    expect(screen.getByText('Oops! Route not found.')).toBeInTheDocument();
  });

  it.each([true, false])('can decide whether to render a toggle button or not', (autoToggleButton) => {
    setUp({ autoToggleButton });

    if (autoToggleButton) {
      expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument();
    } else {
      expect(screen.queryByLabelText('Toggle sidebar')).not.toBeInTheDocument();
    }
  });
});
