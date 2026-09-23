import { fromPartial } from '@total-typescript/shoehorn';
import { page as screen } from 'vitest/browser';
import type { DateRangeSelectorProps } from '../../../src/utils/dates/DateRangeSelector';
import { DateRangeSelector } from '../../../src/utils/dates/DateRangeSelector';
import type { DateInterval } from '../../../src/utils/dates/helpers/dateIntervals';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<DateRangeSelector />', () => {
  const onDatesChange = vi.fn();
  const setUp = async (props: Partial<DateRangeSelectorProps> = {}) => {
    const result = renderWithEvents(
      <DateRangeSelector
        {...fromPartial<DateRangeSelectorProps>(props)}
        defaultText="Default text"
        onDatesChange={onDatesChange}
      />,
    );

    await result.user.click(screen.getByRole('button'));
    // Wait for menu to be displayed
    await screen.getByRole('menu').findElement();

    return result;
  };

  it('renders proper amount of items', async () => {
    await setUp();
    expect(screen.getByRole('menuitem').all()).toHaveLength(8);
  });

  it.each([
    [undefined, 0],
    ['all' as DateInterval, 1],
    ['today' as DateInterval, 1],
    ['yesterday' as DateInterval, 1],
    ['last7Days' as DateInterval, 1],
    ['last30Days' as DateInterval, 1],
    ['last90Days' as DateInterval, 1],
    ['last180Days' as DateInterval, 1],
    ['last365Days' as DateInterval, 1],
    [{ startDate: new Date() }, 0],
  ])('sets proper element as active based on provided date range', async (dateRangeOrInterval, expectedActiveItems) => {
    const { container } = await setUp({ dateRangeOrInterval });
    expect(container.querySelectorAll('[data-selected="true"]')).toHaveLength(expectedActiveItems);
  });

  it('triggers onDatesChange callback when selecting an element', async () => {
    const { user } = await setUp();

    await user.type(screen.getByLabelText('Since:'), '2020-01-01');
    await user.type(screen.getByLabelText('Until:'), '2022-01-01');
    await user.click(screen.getByRole('menuitem').first());

    expect(onDatesChange).toHaveBeenCalledTimes(3);
  });

  it('propagates default text to DateIntervalDropdownItems', async () => {
    await setUp();
    expect(screen.getByText('Default text').all()).toHaveLength(2);
  });
});
