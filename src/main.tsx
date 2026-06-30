import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Resolve sw.js relative to the manifest's location to handle subdirectories on GitHub Pages perfectly
    const baseHref = document.querySelector('link[rel="manifest"]')?.getAttribute('href') || 'manifest.json';
    const manifestUrl = new URL(baseHref, window.location.href);
    const swUrl = new URL('sw.js', manifestUrl).href;

    navigator.serviceWorker.register(swUrl)
      .then((reg) => {
        console.log('Service Worker registered successfully with scope:', reg.scope);
      })
      .catch((err) => {
        console.error('Service Worker registration failed:', err);
      });
  });
}

