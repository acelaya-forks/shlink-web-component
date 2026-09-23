import { render } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { MemoryRouter } from 'react-router';
import { page as screen } from 'vitest/browser';
import type { TagVisits } from '../../src/visits/reducers/tagVisits';
import { TagVisitsHeader } from '../../src/visits/TagVisitsHeader';
import { checkAccessibility } from '../__helpers__/accessibility';
import { colorGeneratorMock } from '../utils/services/__mocks__/ColorGenerator.mock';

describe('<TagVisitsHeader />', () => {
  const tagVisits = fromPartial<Extract<TagVisits, { status: 'loaded' }>>({
    status: 'loaded',
    tag: 'foo',
    visits: [{}, {}, {}, {}],
  });
  const setUp = () =>
    render(
      <MemoryRouter>
        <TagVisitsHeader tagVisits={tagVisits} colorGenerator={colorGeneratorMock} />
      </MemoryRouter>,
    );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('shows expected visits', async () => {
    setUp();

    expect(screen.getByText('Visits for').all()).toHaveLength(2);
    await expect.element(screen.getByTestId('badge')).toMatchTextContent(`Visits: ${tagVisits.visits.length}`);
  });

  it('shows title for tag', () => {
    setUp();
    expect(screen.getByText(tagVisits.tag).all()).not.toHaveLength(0);
  });
});
