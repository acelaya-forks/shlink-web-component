import { render } from '@testing-library/react';
import { page as screen } from 'vitest/browser';
import { ColorInput } from '../../../src/utils/components/ColorInput';
import { checkAccessibility } from '../../__helpers__/accessibility';

describe('<ColorInput />', () => {
  const onChange = vi.fn();
  const setUp = (color = '#00ff00') => render(<ColorInput name="name" color={color} onChange={onChange} />);

  it.each([['#000000'], ['#ffffff']])('passes a11y checks', (color) => checkAccessibility(setUp(color)));

  it('sets color in text and color inputs', async () => {
    const color = '#010101';
    setUp(color);

    await Promise.all([
      expect.element(screen.getByLabelText('name')).toHaveValue(color),
      expect.element(screen.getByLabelText('name picker')).toHaveValue(color),
    ]);
  });
});
