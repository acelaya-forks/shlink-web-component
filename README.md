# Shlink web component

[![Build Status](https://img.shields.io/github/actions/workflow/status/shlinkio/shlink-web-component/ci.yml?branch=main&logo=github&style=flat-square)](https://github.com/shlinkio/shlink-web-component/actions/workflows/ci.yml?query=workflow%3A%22Continuous+integration%22)
[![Code Coverage](https://img.shields.io/codecov/c/gh/shlinkio/shlink-web-component/main?style=flat-square)](https://app.codecov.io/gh/shlinkio/shlink-web-component)
[![GitHub release](https://img.shields.io/github/release/shlinkio/shlink-web-component.svg?style=flat-square)](https://github.com/shlinkio/shlink-web-component/releases/latest)
[![GitHub license](https://img.shields.io/github/license/shlinkio/shlink-web-component.svg?style=flat-square)](https://github.com/shlinkio/shlink-web-component/blob/main/LICENSE)
[![Paypal Donate](https://img.shields.io/badge/Donate-paypal-blue.svg?style=flat-square&logo=paypal&colorA=cccccc)](https://slnk.to/donate)

Minimal UI to interact with Shlink on React applications.

> **Note**
> This component was originally part of [shlink-web-client](https://github.com/shlinkio/shlink-web-client), and it was extracted so that it could be used in other React-based apps

### Installation

    npm install @shlinkio/shlink-web-component

### Basic usage

This package exports a `ShlinkWebComponent` react component, which renders a set of sections that can be used to provide a convenient UI to interact with every aspect of a Shlink server: short URLs, tags domains, etc.

The main prop is the `apiClient`, which is used by the component in order to know how to consume the server's API.

Its implementation is up to the consumer, which gives you the flexibility to directly interact with Shlink from the browser, or through some dedicated proxy or backend-for-frontend.

```tsx
import { ShlinkWebComponent } from '@shlinkio/shlink-web-component';
import type { ShlinkApiClient } from '@shlinkio/shlink-js-sdk/api-contract';

export function App() {
  const apiClient: ShlinkApiClient = {
    // ...
  };

  return <ShlinkWebComponent apiClient={apiClient} />;
};
```

> **Note**
> The API client has to fulfil the type defined in `@shlinkio/shlink-js-sdk`, but that package is an optional peer dependency.
> If you don't need to import from it to define your own implementation or to use the implementation provided there, feel free to skip it.
>
> Also, this component re-exports the SDK types for your convenience, so you can choose to import from `@shlinkio/shlink-js-sdk/api-contract` or `@shlinkio/shlink-web-component/api-contract`.

### Settings

It is possible to customize some aspects of the UI by providing some optional settings.

Settings can control default ordering for lists, real-time updates behavior, optional fields for short URL creation, etc.

Everything related with settings is exposed via the `@shlinkio/shlink-web-component/settings` entry point.

```tsx
import { ShlinkWebComponent } from '@shlinkio/shlink-web-component';
import type { Settings } from '@shlinkio/shlink-web-component/settings';

export function App() {
  const settings: Settings = {};

  return (
    <ShlinkWebComponent settings={settings} {...} />
  );
};
```

This library provides another react component which renders a form designed to configure settings for `<ShlinkWebComponent />`.


```tsx
import type { Settings } from '@shlinkio/shlink-web-component/settings';
import { ShlinkWebSettings } from '@shlinkio/shlink-web-component/settings';

export function App() {
  const [settings, setSettings] = useState<Settings>({});

  return (
    <ShlinkWebSettings settings={settings} updateSettings={setSettings} {...} />
  );
};
```

### Routes prefix

Sections are handled via client-side routing with `react-router`. `ShlinkWebComponent` will add its own `<BrowserRouter />` unless already rendered inside a router.

If you render it inside a router, make sure you pass the prefix for all routes handled by this component.

```tsx
import { ShlinkWebComponent } from '@shlinkio/shlink-web-component';
import { BrowserRouter, Routes, Route } from 'react-router';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/foo" element={<Foo />} />
        <Route path="/bar" element={<Bar />} />
        <Route path="/shlink-ui" element={<ShlinkWebComponent routesPrefix="/shlink-ui" {...} />} />
      </Routes>
    </BrowserRouter>
  );
};
```

### Tag colors storage

One of the features on `ShlinkWebComponent` is generating and handling colors for short URL tags.

By default, all colors will be generated from scratch every time the component is rendered, but you can persist them between executions by providing an object implementing this type:

```ts
type TagColorsStorage = {
  getTagColors(): Record<string, string>;

  storeTagColors(colors: Record<string, string>): void;
};
```

For example, imagine you want to persist tag colors in the browser's local storage. You could do something like this:

```tsx
import { ShlinkWebComponent } from '@shlinkio/shlink-web-component';
import type { TagColorsStorage } from '@shlinkio/shlink-web-component';

class TagColorsLocalStorage implements TagColorsStorage {
  constructor(private readonly localStorage: Storage) {
  }

  getTagColors(): Record<string, string> {
    const colors = this.localStorage.getItem('shlink_tag_colors');
    return colors ? JSON.parse(colors) : {};
  }

  storeTagColors(colors: Record<string, string>): void {
    this.localStorage.setItem('shlink_tag_colors', JSON.stringify(colors));
  }
}

export function App() {
  const tagColorsStorage = new TagColorsLocalStorage(window.localStorage);

  return (
    <ShlinkWebComponent
      tagColorsStorage={tagColorsStorage}
      {...}
    />
  );
};
```

### Styles

Currently, this component depends on `tailwind` and `@shlinkio/shlink-frontend-kit` for proper styling.

Make sure you import stylesheets as documented here for everything to work.

```css
/* src/tailwind.css */
@import 'tailwindcss';

/* Add these three lines */
@source '../node_modules/@shlinkio/shlink-frontend-kit';
@source '../node_modules/@shlinkio/shlink-web-component';
@import '@shlinkio/shlink-frontend-kit/tailwind.preset.css';
@import '@shlinkio/shlink-web-component/tailwind.preset.css';
```

```tsx
import type { Theme } from '@shlinkio/shlink-frontend-kit';
import { Checkbox, changeThemeInMarkup } from '@shlinkio/shlink-frontend-kit';
import { ShlinkWebComponent } from '@shlinkio/shlink-web-component';
import { useCallback, useState } from 'react';
import './src/tailwind.css'; // The stylesheet above

export function App() {
  const [theme, setTheme] = useState<Theme>('light');
  const toggleTheme = useCallback((isDarkTheme: boolean) => {
    const newTheme: Theme = isDarkTheme ? 'dark' : 'light';

    setTheme(newTheme);
    changeThemeInMarkup(newTheme);
  }, []);

  return (
    <>
      <Checkbox checked={theme === 'dark'} onChange={toggleTheme}>
        Dark theme
      </Checkbox>
      <ShlinkWebComponent {...} />
    </>
  );
};
```

### Dev sandbox

Since this is a complex component, this project provides a convenient way to do some manual tests.

Simply run `npm run dev` or `docker compose up`, and a local vite server will be started on port `3002`.

Then visit http://localhost:3002 to see your changes in real time.
