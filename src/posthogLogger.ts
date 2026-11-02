import type { LogAttributes } from 'posthog-js'
import { posthog } from './posthog'

export const posthogLogger = {
  info(message: string, attributes?: LogAttributes) {
    posthog?.logger.info(message, attributes)
  },
}
