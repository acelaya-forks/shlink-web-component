import type { Store } from '@reduxjs/toolkit';
import type Bottle from 'bottlejs';
import type { FC, ReactNode } from 'react';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Provider as ReduxStoreProvider } from 'react-redux';
import { BrowserRouter, useInRouterContext } from 'react-router';
import type { ShlinkApiClient } from './api-contract';
import type { Settings } from './settings';
import { SettingsProvider } from './settings';
import { FeaturesProvider, useFeatures } from './utils/features';
import type { SemVerOrLatest } from './utils/helpers/version';
import { RoutesPrefixProvider } from './utils/routesPrefix';
import type { TagColorsStorage } from './utils/services/TagColorsStorage';

type ShlinkWebComponentProps = {
  serverVersion: SemVerOrLatest; // FIXME Consider making this optional and trying to resolve it if not set
  apiClient: ShlinkApiClient;
  tagColorsStorage?: TagColorsStorage;
  routesPrefix?: string;
  settings?: Exclude<Settings, 'ui'>;
  createNotFound?: (nonPrefixedHomePath: string) => ReactNode;
};

// FIXME This allows to track the reference to be resolved by the container, but it's hacky and relies on not more than
//       one ShlinkWebComponent rendered at the same time.
//       Works for now, but should be addressed.
let apiClientRef: ShlinkApiClient;

export const createShlinkWebComponent = (
  bottle: Bottle,
): FC<ShlinkWebComponentProps> => (
  { serverVersion, apiClient, settings, routesPrefix = '', createNotFound, tagColorsStorage },
) => {
  const features = useFeatures(serverVersion);
  const mainContent = useRef<ReactNode>(undefined);
  const [theStore, setStore] = useState<Store | undefined>();

  const inRouterContext = useInRouterContext();
  const RouterOrFragment = useMemo(() => (inRouterContext ? Fragment : BrowserRouter), [inRouterContext]);

  useEffect(() => {
    apiClientRef = apiClient;
    bottle.value('apiClientFactory', () => apiClientRef);

    if (tagColorsStorage) {
      bottle.value('TagColorsStorage', tagColorsStorage);
    }

    // It's important to not try to resolve services before the API client has been registered, as many other services
    // depend on it
    const { container } = bottle;
    const { Main, store, loadMercureInfo, listTags, listDomains } = container;
    mainContent.current = <Main createNotFound={createNotFound} />;
    setStore(store);

    // Load mercure info
    store.dispatch(loadMercureInfo(settings));
    // Load tags, as they are used by multiple components
    store.dispatch(listTags());
    // Load domains, as they are used by multiple components
    store.dispatch(listDomains());
  }, [apiClient, createNotFound, settings, tagColorsStorage]);

  return !theStore ? <></> : (
    <ReduxStoreProvider store={theStore}>
      <SettingsProvider value={settings ?? {}}>
        <FeaturesProvider value={features}>
          <RoutesPrefixProvider value={routesPrefix}>
            <RouterOrFragment>
              {mainContent.current}
            </RouterOrFragment>
          </RoutesPrefixProvider>
        </FeaturesProvider>
      </SettingsProvider>
    </ReduxStoreProvider>
  );
};
