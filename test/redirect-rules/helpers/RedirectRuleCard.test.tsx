import type { ShlinkRedirectCondition } from '@shlinkio/shlink-js-sdk/api-contract';
import { fromPartial } from '@total-typescript/shoehorn';
import { page as screen } from 'vitest/browser';
import type { RedirectRuleCardProps } from '../../../src/redirect-rules/helpers/RedirectRuleCard';
import { RedirectRuleCard } from '../../../src/redirect-rules/helpers/RedirectRuleCard';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('<RedirectRuleCard />', () => {
  const conditions: ShlinkRedirectCondition[] = [
    { type: 'device', matchValue: 'android', matchKey: null },
    { type: 'language', matchValue: 'es-ES', matchKey: null },
    { type: 'query-param', matchValue: 'bar', matchKey: 'foo' },
    { type: 'any-value-query-param', matchValue: null, matchKey: 'foo-any-value' },
    { type: 'valueless-query-param', matchValue: null, matchKey: 'foo-valueless' },
    { type: 'ip-address', matchValue: '1.2.3.4', matchKey: null },
    { type: 'geolocation-country-code', matchValue: 'FR', matchKey: null },
    { type: 'geolocation-city-name', matchValue: 'Paris', matchKey: null },
    { type: 'before-date', matchValue: '2025-01-01T00:00:00+00:00', matchKey: null },
    { type: 'after-date', matchValue: '2035-01-01T00:00:00+00:00', matchKey: null },
    { type: 'browser', matchValue: 'chrome', matchKey: null },
  ];
  const setUp = (props: Partial<RedirectRuleCardProps> = {}) =>
    renderWithEvents(
      <RedirectRuleCard
        {...fromPartial<RedirectRuleCardProps>({
          redirectRule: fromPartial({ conditions: [] }),
          ...props,
        })}
      />,
    );

  it('passes a11y checks', () =>
    checkAccessibility(
      setUp({
        redirectRule: fromPartial({ conditions }),
      }),
    ));

  it('can move the rule up and down', async () => {
    const onMoveUp = vi.fn();
    const onMoveDown = vi.fn();

    const { user } = setUp({ onMoveUp, onMoveDown, priority: 2 });

    await user.click(screen.getByLabelText('Move rule with priority 2 up'));
    expect(onMoveUp).toHaveBeenCalledOnce();

    await user.click(screen.getByLabelText('Move rule with priority 2 down'));
    expect(onMoveDown).toHaveBeenCalledOnce();
  });

  it('disables up and down button for corner rules', async () => {
    setUp({ priority: 1, isLast: true });

    await expect.element(screen.getByLabelText('Move rule with priority 1 up')).toBeDisabled();
    await expect.element(screen.getByLabelText('Move rule with priority 1 down')).toBeDisabled();
  });

  it('renders human-friendly conditions', async () => {
    setUp({
      redirectRule: fromPartial({ conditions }),
    });

    await expect.element(screen.getByText('Device is android')).toBeInTheDocument();
    await expect.element(screen.getByText('es-ES language is accepted')).toBeInTheDocument();
    await expect.element(screen.getByText('Query string contains "foo=bar"')).toBeInTheDocument();
    await expect.element(screen.getByText('Query string contains "foo-any-value" param')).toBeInTheDocument();
    await expect
      .element(
        screen.getByText(
          'Query string contains "foo-valueless" param without a value (https://example.com?foo-valueless)',
        ),
      )
      .toBeInTheDocument();
    await expect.element(screen.getByText('IP address matches 1.2.3.4')).toBeInTheDocument();
    await expect.element(screen.getByText('Country code is FR')).toBeInTheDocument();
    await expect.element(screen.getByText('City name is Paris')).toBeInTheDocument();
    await expect.element(screen.getByText('Date is before 2025-01-01 00:00')).toBeInTheDocument();
    await expect.element(screen.getByText('Date is after 2035-01-01 00:00')).toBeInTheDocument();
    await expect.element(screen.getByText('Browser is chrome')).toBeInTheDocument();
  });

  it('can delete the rule', async () => {
    const onDelete = vi.fn();

    const { user } = setUp({ onDelete, priority: 4 });

    await user.click(screen.getByLabelText('Delete rule with priority 4'));
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('opens modal to edit rule', async () => {
    const { user } = setUp({ priority: 3 });

    await user.click(screen.getByLabelText('Edit rule with priority 3'));
    await expect.element(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
