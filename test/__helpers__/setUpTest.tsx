import type { ShlinkApiClient } from '@shlinkio/shlink-js-sdk';
import type { RenderOptions } from '@testing-library/react';
import { render as testingLibRender } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import type { PropsWithChildren, ReactElement } from 'react';
import { Provider } from 'react-redux';
import { render as vitestRender } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { ContainerProvider } from '../../src/container/context';
import type { RootState } from '../../src/store';
import { setUpStore } from '../../src/store';

export const render = vitestRender;

export const renderWithEvents = (element: ReactElement, options?: RenderOptions) => ({
  user: userEvent.setup(),
  ...testingLibRender(element, options),
});

export type RenderOptionsWithState = Omit<RenderOptions, 'wrapper'> & {
  initialState?: Partial<RootState>;
  apiClientFactory?: () => ShlinkApiClient;
};

export const renderWithStore = (
  element: ReactElement,
  { initialState = {}, apiClientFactory = vi.fn(), ...options }: RenderOptionsWithState = {},
) => {
  const store = setUpStore(initialState);
  const Wrapper = ({ children }: PropsWithChildren) => (
    <ContainerProvider value={fromPartial({ apiClientFactory })}>
      <Provider store={store}>{children}</Provider>
    </ContainerProvider>
  );

  return {
    store,
    ...renderWithEvents(element, { ...options, wrapper: Wrapper }),
  };
};
