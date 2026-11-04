// The "Later times on top" setting (schedule-grid FR-7). It is saved per device.
export const LATER_TIMES_ON_TOP_KEY = 'festi-bestie:later-times-on-top'

type GetStorage = () => Pick<Storage, 'getItem' | 'setItem'>

const browserStorage: GetStorage = () => window.localStorage

// Off unless this device saved it on, also when the browser blocks storage.
export const readLaterTimesOnTop = (getStorage: GetStorage = browserStorage): boolean => {
  try {
    return getStorage().getItem(LATER_TIMES_ON_TOP_KEY) === 'true'
  } catch {
    return false
  }
}

// When the browser blocks storage, the setting lasts until the page reloads.
export const saveLaterTimesOnTop = (value: boolean, getStorage: GetStorage = browserStorage): void => {
  try {
    getStorage().setItem(LATER_TIMES_ON_TOP_KEY, String(value))
  } catch {
    // Nothing to do: the screen already shows the new value.
  }
}
