import { parseQuery, stringifyQuery } from '@shlinkio/shlink-frontend-kit';
import type { DependencyList, EffectCallback } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSwipeable as useReactSwipeable } from 'react-swipeable';

export type TimeoutToggle = typeof useTimeoutToggle;

export const useTimeoutToggle = (
  initialValue = false,
  delay = 2000,

  // Test seams
  setTimeout = window.setTimeout,
  clearTimeout = window.clearTimeout,
): [boolean, () => void] => {
  const [flag, setFlag] = useState<boolean>(initialValue);
  const initialValueRef = useRef(initialValue);
  const timeout = useRef<number | undefined>(undefined);
  const callback = useCallback(() => {
    setFlag(!initialValueRef.current);

    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    timeout.current = setTimeout(() => setFlag(initialValueRef.current), delay);
  }, [clearTimeout, delay, setTimeout]);

  return [flag, callback];
};

export const useSwipeable = (showSidebar: () => void, hideSidebar: () => void) => {
  const swipeMenuIfNoModalExists = (callback: () => void) => (e: any) => {
    const swippedOnVisitsTable = (e.event.composedPath() as HTMLElement[]).some(
      ({ classList }) => classList?.contains('visits-table'),
    );

    if (swippedOnVisitsTable || document.querySelector('.modal')) {
      return;
    }

    callback();
  };

  return useReactSwipeable({
    delta: 40,
    onSwipedLeft: swipeMenuIfNoModalExists(hideSidebar),
    onSwipedRight: swipeMenuIfNoModalExists(showSidebar),
  });
};

export const useQueryState = <T>(paramName: string, initialState: T): [ T, (newValue: T) => void ] => {
  const [value, setValue] = useState(initialState);
  const setValueWithLocation = (valueToSet: T) => {
    const { location, history } = window;
    const query = parseQuery<any>(location.search);

    query[paramName] = valueToSet;
    history.pushState(null, '', `${location.pathname}?${stringifyQuery(query)}`);
    setValue(valueToSet);
  };

  return [value, setValueWithLocation];
};

export const useEffectExceptFirstTime = (callback: EffectCallback, deps: DependencyList): void => {
  const isFirstLoad = useRef(true);

  useEffect(() => {
    !isFirstLoad.current && callback();
    isFirstLoad.current = false;
  }, deps);
};

export const useGoBack = () => {
  const navigate = useNavigate();
  return () => navigate(-1);
};
