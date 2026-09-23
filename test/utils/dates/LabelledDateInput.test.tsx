import { fromPartial } from '@total-typescript/shoehorn';
import { parseISO } from 'date-fns';
import { page as screen } from 'vitest/browser';
import type { LabelledDateInputProps } from '../../../src/utils/dates/LabelledDateInput';
import { LabelledDateInput } from '../../../src/utils/dates/LabelledDateInput';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { setNativeInputValue } from '../../__helpers__/input';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<LabelledDateInput />', () => {
  const setUp = ({ label = 'The date', ...props }: Partial<LabelledDateInputProps> = {}) =>
    renderWithEvents(<LabelledDateInput {...fromPartial(props)} label={label} />);

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    [false, '2022-01-01', 'date'],
    [true, '2022-01-01T15:18', 'datetime-local'],
  ])('shows date in expected format', async (withTime, expectedValue, expectedType) => {
    setUp({ label: 'foo', value: parseISO('2022-01-01T15:18:36'), withTime });
    const input = screen.getByLabelText('foo:');

    await Promise.all([
      expect.element(input).toHaveValue(expectedValue),
      expect.element(input).toHaveAttribute('type', expectedType),
    ]);
  });

  it('parses date when value changes', () => {
    const onChange = vi.fn();
    setUp({ onChange, label: 'bar' });

    setNativeInputValue(screen.getByLabelText('bar:').element() as HTMLInputElement, '2022-01-01');

    expect(onChange).toHaveBeenCalledWith(new Date('2022-01-01'));
  });
});
