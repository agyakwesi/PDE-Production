import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import API_BASE_URL from './config.js'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://bd5c863e6256fb5856cfbfdee3a9ba65@o4511144338784256.ingest.us.sentry.io/4511144358576128",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
