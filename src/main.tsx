import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import '@xelene/tgui/dist/styles.css';
import WebApp from '@twa-dev/sdk'

WebApp.ready();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
