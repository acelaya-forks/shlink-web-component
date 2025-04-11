import { screen } from '@testing-library/react';
import { QrErrorCorrectionDropdown } from '../../../../src/short-urls/helpers/qr-codes/QrErrorCorrectionDropdown';
import type { QrErrorCorrection } from '../../../../src/utils/helpers/qrCodes';
import { checkAccessibility } from '../../../__helpers__/accessibility';
import { renderWithEvents } from '../../../__helpers__/setUpTest';

describe('<QrErrorCorrectionDropdown />', () => {
  const initialErrorCorrection: QrErrorCorrection = 'Q';
  const setErrorCorrection = vi.fn();
  const setUp = () => renderWithEvents(
    <QrErrorCorrectionDropdown errorCorrection={initialErrorCorrection} onChange={setErrorCorrection} />,
  );

  it.each([
    [setUp],
    [async () => {
      const { user, container } = setUp();
      await user.click(screen.getByRole('button'));

      return { container };
    }],
  ])('passes a11y checks', (setUp) => checkAccessibility(setUp()));

  it('renders initial state', async () => {
    const { user } = setUp();
    const btn = screen.getByRole('button');

    expect(btn).toHaveTextContent('Error correction (Q)');
    await user.click(btn);
    const items = screen.getAllByRole('menuitem');

    expect(items[0]).not.toHaveClass('active');
    expect(items[1]).not.toHaveClass('active');
    expect(items[2]).toHaveClass('active');
    expect(items[3]).not.toHaveClass('active');
  });

  it('invokes callback when items are clicked', async () => {
    const { user } = setUp();
    const clickItem = async (name: string | RegExp) => {
      await user.click(screen.getByRole('button'));
      await user.click(screen.getByRole('menuitem', { name }));
    };

    expect(setErrorCorrection).not.toHaveBeenCalled();

    await clickItem(/ow/);
    expect(setErrorCorrection).toHaveBeenCalledWith('L');

    await clickItem(/edium/);
    expect(setErrorCorrection).toHaveBeenCalledWith('M');

    await clickItem(/uartile/);
    expect(setErrorCorrection).toHaveBeenCalledWith('Q');

    await clickItem(/igh/);
    expect(setErrorCorrection).toHaveBeenCalledWith('H');
  });
});
