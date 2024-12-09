import { render, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import type { ShlinkDomainRedirects } from '../../src/api-contract';
import type { Domain } from '../../src/domains/data';
import { DomainRow } from '../../src/domains/DomainRow';
import { checkAccessibility } from '../__helpers__/accessibility';

describe('<DomainRow />', () => {
  const redirectsCombinations = [
    [fromPartial<ShlinkDomainRedirects>({ baseUrlRedirect: 'foo' })],
    [fromPartial<ShlinkDomainRedirects>({ invalidShortUrlRedirect: 'bar' })],
    [fromPartial<ShlinkDomainRedirects>({ baseUrlRedirect: 'baz', regular404Redirect: 'foo' })],
    [
      fromPartial<ShlinkDomainRedirects>(
        { baseUrlRedirect: 'baz', regular404Redirect: 'bar', invalidShortUrlRedirect: 'foo' },
      ),
    ],
  ];
  const setUp = (domain: Domain, defaultRedirects?: ShlinkDomainRedirects) => render(
    <MemoryRouter>
      <table>
        <tbody>
          <DomainRow
            domain={domain}
            defaultRedirects={defaultRedirects}
            editDomainRedirects={vi.fn()}
            checkDomainHealth={vi.fn()}
          />
        </tbody>
      </table>
    </MemoryRouter>,
  );

  it('passes a11y checks', () => checkAccessibility(
    setUp(fromPartial({ domain: 'domain', isDefault: true })),
  ));

  it.each(redirectsCombinations)('shows expected redirects', (redirects) => {
    setUp(fromPartial({ domain: '', isDefault: true, redirects }));
    const cells = screen.getAllByRole('cell');

    if (redirects?.baseUrlRedirect) {
      expect(cells[1]).toHaveTextContent(redirects.baseUrlRedirect);
    }
    if (redirects?.regular404Redirect) {
      expect(cells[2]).toHaveTextContent(redirects.regular404Redirect);
    }
    if (redirects?.invalidShortUrlRedirect) {
      expect(cells[3]).toHaveTextContent(redirects.invalidShortUrlRedirect);
    }
    expect(screen.queryByText('(as fallback)')).not.toBeInTheDocument();
  });

  it.each([
    [undefined],
    [fromPartial<ShlinkDomainRedirects>({})],
  ])('shows expected "no redirects"', (redirects) => {
    setUp(fromPartial({ domain: '', isDefault: true, redirects }));
    const cells = screen.getAllByRole('cell');

    expect(cells[1]).toHaveTextContent('No redirect');
    expect(cells[2]).toHaveTextContent('No redirect');
    expect(cells[3]).toHaveTextContent('No redirect');
    expect(screen.queryByText('(as fallback)')).not.toBeInTheDocument();
  });

  it.each(redirectsCombinations)('shows expected fallback redirects', (fallbackRedirects) => {
    setUp(fromPartial({ domain: '', isDefault: true }), fallbackRedirects);
    const cells = screen.getAllByRole('cell');

    if (fallbackRedirects?.baseUrlRedirect) {
      expect(cells[1]).toHaveTextContent(
        `${fallbackRedirects.baseUrlRedirect} (as fallback)`,
      );
    }
    if (fallbackRedirects?.regular404Redirect) {
      expect(cells[2]).toHaveTextContent(
        `${fallbackRedirects.regular404Redirect} (as fallback)`,
      );
    }
    if (fallbackRedirects?.invalidShortUrlRedirect) {
      expect(cells[3]).toHaveTextContent(
        `${fallbackRedirects.invalidShortUrlRedirect} (as fallback)`,
      );
    }
  });

  it.each([[true], [false]])('shows icon on default domain only', (isDefault) => {
    const { container } = setUp(fromPartial({ domain: '', isDefault }));

    if (isDefault) {
      expect(container.querySelector('#defaultDomainIcon')).toBeInTheDocument();
    } else {
      expect(container.querySelector('#defaultDomainIcon')).not.toBeInTheDocument();
    }
  });
});
