// Simple module-level flag for "gamitin nang walang account" / demo mode.
// Module scope means it persists for the app's lifetime without any storage or network call.

let _active = false

export function enableDemoMode(): void {
  _active = true
}

export function isDemoMode(): boolean {
  return _active
}
