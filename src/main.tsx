import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootEl = document.getElementById('root')!;
rootEl.style.height = '100dvh';
rootEl.style.overflowY = 'auto';

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
