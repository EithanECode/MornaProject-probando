import React from 'react';
import ReactDOM from 'react-dom/client';
import Page from './page';

const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <Page />
    </React.StrictMode>
  );
}
