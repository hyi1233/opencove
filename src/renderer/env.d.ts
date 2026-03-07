import { CoveApi } from '../app/preload/index'

declare global {
  interface Window {
    coveApi: CoveApi
  }
}
