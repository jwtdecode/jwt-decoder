import { lazy, type ComponentType } from 'react';

// Route-level code splitting that stays SSR/hydration-safe.
// preload() resolves the page module; once resolved the page renders
// synchronously (no Suspense fallback), so the server can preload before
// renderToString and the client can preload the current route before
// hydrateRoot — both sides then produce identical markup. Client-side
// navigations to a not-yet-loaded page fall back to React.lazy.
export interface LazyPage {
  (): JSX.Element;
  preload: () => Promise<ComponentType>;
}

export function lazyPage(loader: () => Promise<{ default: ComponentType }>): LazyPage {
  let Loaded: ComponentType | null = null;
  let pending: Promise<ComponentType> | null = null;

  const preload = () =>
    (pending ??= loader().then(m => (Loaded = m.default)));

  // A chunk can 404 if a deploy replaced it while this tab was open — do a
  // full load of the (already pushed) URL instead of rendering nothing.
  const Lazy = lazy(() =>
    preload().then(
      C => ({ default: C }),
      () => {
        window.location.reload();
        return new Promise<never>(() => {});
      },
    ),
  );

  const Page = (() => (Loaded ? <Loaded /> : <Lazy />)) as LazyPage;
  Page.preload = preload;
  return Page;
}
