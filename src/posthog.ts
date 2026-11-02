import posthogClient from 'posthog-js'

const projectToken = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN
const host = import.meta.env.VITE_POSTHOG_HOST

if (!projectToken || !host) {
  if (import.meta.env.DEV) {
    const missingVariable = projectToken
      ? 'VITE_POSTHOG_HOST'
      : 'VITE_POSTHOG_PROJECT_TOKEN'

    throw new Error(
      `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
    )
  }
} else {
  posthogClient.init(projectToken, {
    api_host: host,
    disable_capture_url_hashes: true,
    capture_pageview: 'history_change',
    capture_exceptions: {
      capture_unhandled_errors: true,
      capture_unhandled_rejections: true,
      capture_console_errors: false,
    },
    logs: {
      serviceName: 'festi-bestie-web',
      environment: import.meta.env.MODE,
    },
  })
  posthogClient.register({ environment: import.meta.env.MODE })
}

export const posthog = projectToken && host ? posthogClient : null
