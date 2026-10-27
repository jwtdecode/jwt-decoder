import { StrictMode } from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App, { preloadRoute } from './App';

const container = document.getElementById('root')!;

const tree = (
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);

// If the route was prerendered there is server-rendered HTML inside #root,
// so hydrate. In dev (vite serves the raw template) the container is empty,
// so fall back to a fresh render. The current route's page chunk is loaded
// first so hydration renders the same markup the server did.
preloadRoute(window.location.pathname).then(() => {
  if (container.firstElementChild) {
    hydrateRoot(container, tree);
  } else {
    createRoot(container).render(tree);
  }
});
