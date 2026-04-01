import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { datadogRum } from '@datadog/browser-rum';

import './index.css'
import App from './App.jsx'
import API_BASE_URL from './config.js'
import ErrorBoundary from './components/ErrorBoundary.jsx'

datadogRum.init({
    applicationId: '51b9d3e7-9078-4f96-89f7-600debf31ab3',
    clientToken: 'pubb90bb15089ac15771a98b779bb825bb9',
    site: 'us5.datadoghq.com',
    proxy: `${API_BASE_URL}/api/datadog-proxy`,
    service: 'pde-frontend',
    env: 'production',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 100,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'mask-user-input',
});

datadogRum.startSessionReplayRecording();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
