import type { OrderDir } from '@shlinkio/shlink-frontend-kit';
import { render } from '@testing-library/react';
import { TableOrderIcon } from '../../../src/utils/table/TableOrderIcon';
import { checkAccessibility } from '../../__helpers__/accessibility';

describe('<TableOrderIcon />', () => {
  const setUp = (field: string, currentDir?: OrderDir, className?: string) => render(
    <TableOrderIcon currentOrder={{ dir: currentDir, field: 'foo' }} field={field} className={className} />,
  );

  it('passes a11y checks', () => checkAccessibility(setUp('foo', 'ASC')));

  it.each([
    ['foo', undefined],
    ['bar', 'DESC' as OrderDir],
    ['bar', 'ASC' as OrderDir],
  ])('renders empty when not all conditions are met', (field, dir) => {
    const { container } = setUp(field, dir);
    expect(container.firstChild).toBeNull();
  });

  it.each([
    ['DESC' as OrderDir],
    ['ASC' as OrderDir],
  ])('renders an icon when all conditions are met', (dir) => {
    const { container } = setUp('foo', dir);

    expect(container.firstChild).not.toBeNull();
    expect(container.firstChild).toMatchSnapshot();
  });

  it.each([
    [undefined, 'ml-1'],
    ['foo', 'foo'],
    ['bar', 'bar'],
  ])('renders expected classname', (className, expectedClassName) => {
    const { container } = setUp('foo', 'ASC', className);
    expect(container.firstChild).toHaveClass(expectedClassName);
  });
});
