import { screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import type { MercureInfo } from '../../src/mercure/reducers/mercureInfo';
import { OverviewFactory } from '../../src/overview/Overview';
import { SettingsProvider } from '../../src/settings';
import { prettify } from '../../src/utils/helpers/numbers';
import { RoutesPrefixProvider } from '../../src/utils/routesPrefix';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithEvents } from '../__helpers__/setUpTest';

describe('<Overview />', () => {
  const ShortUrlsTable = () => <>ShortUrlsTable</>;
  const CreateShortUrl = () => <>CreateShortUrl</>;
  const listShortUrls = vi.fn();
  const loadVisitsOverview = vi.fn();
  const Overview = OverviewFactory(fromPartial({ ShortUrlsTable, CreateShortUrl }));
  const shortUrls = {
    pagination: { totalItems: 83710 },
  };
  const routesPrefix = '/server/123';
  const setUp = (loading = false, visits: { excludeBots?: boolean } = {}) => renderWithEvents(
    <MemoryRouter>
      <SettingsProvider value={fromPartial({ visits })}>
        <RoutesPrefixProvider value={routesPrefix}>
          <Overview
            listShortUrls={listShortUrls}
            loadVisitsOverview={loadVisitsOverview}
            shortUrlsList={fromPartial({ loading, shortUrls })}
            tagsList={fromPartial({ loading, tags: ['foo', 'bar', 'baz'] })}
            visitsOverview={fromPartial({
              loading,
              nonOrphanVisits: { total: 3456, bots: 1000, nonBots: 2456 },
              orphanVisits: { total: 28, bots: 15, nonBots: 13 },
            })}
            createNewVisits={vi.fn()}
            loadMercureInfo={vi.fn()}
            mercureInfo={fromPartial<MercureInfo>({})}
          />
        </RoutesPrefixProvider>
      </SettingsProvider>
    </MemoryRouter>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('displays loading messages when still loading', () => {
    setUp(true);
    expect(screen.getAllByText('Loading...')).toHaveLength(4);
  });

  it.each([
    [false, 3456, 28],
    [true, 2456, 13],
  ])('displays amounts in cards after finishing loading', (excludeBots, expectedVisits, expectedOrphanVisits) => {
    setUp(false, { excludeBots });

    const headingElements = screen.getAllByRole('link');

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(headingElements[0]).toHaveTextContent(`Visits${prettify(expectedVisits)}`);
    expect(headingElements[1]).toHaveTextContent(`Orphan visits${prettify(expectedOrphanVisits)}`);
    expect(headingElements[2]).toHaveTextContent(`Short URLs${prettify(83710)}`);
    expect(headingElements[3]).toHaveTextContent(`Tags${prettify(3)}`);
  });

  it('nests injected components', () => {
    setUp();

    expect(screen.queryByText('ShortUrlsTable')).toBeInTheDocument();
    expect(screen.queryByText('CreateShortUrl')).toBeInTheDocument();
  });

  it('displays links to other sections', () => {
    setUp();

    const links = screen.getAllByRole('link');

    expect(links).toHaveLength(6);
    expect(links[0]).toHaveAttribute('href', `${routesPrefix}/non-orphan-visits`);
    expect(links[1]).toHaveAttribute('href', `${routesPrefix}/orphan-visits`);
    expect(links[2]).toHaveAttribute('href', `${routesPrefix}/list-short-urls/1`);
    expect(links[3]).toHaveAttribute('href', `${routesPrefix}/manage-tags`);
    expect(links[4]).toHaveAttribute('href', `${routesPrefix}/create-short-url`);
    expect(links[5]).toHaveAttribute('href', `${routesPrefix}/list-short-urls/1`);
  });

  it.each([
    [{ excludeBots: true }, true],
    [{ excludeBots: false }, false],
    [{}, false],
  ])('displays amounts of bots when hovering visits cards', async (visits, excludeBots) => {
    const { user } = setUp(false, visits);
    const expectTooltipToBeInTheDocument = async (tooltip: string) => waitFor(
      () => expect(screen.getByText(/potential bot visits$/)).toHaveTextContent(tooltip),
      { timeout: 2000 },
    );

    await user.hover(screen.getByText(/^Visits/));
    await expectTooltipToBeInTheDocument(`${excludeBots ? 'Plus' : 'Including'} 1,000 potential bot visits`);

    await user.hover(screen.getByText(/^Orphan visits/));
    await expectTooltipToBeInTheDocument(`${excludeBots ? 'Plus' : 'Including'} 15 potential bot visits`);
  });
});
