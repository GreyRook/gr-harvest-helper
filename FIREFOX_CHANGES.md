# Firefox Compatibility Changes

This document summarizes the changes made to make the extension compatible with Firefox.

## Files Modified

### 1. `manifest.json`

- **Changed**: `manifest_version` from 3 to 2
  - Reason: Firefox has better support for Manifest V2
- **Changed**: `action` to `browser_action`
  - Reason: MV2 uses `browser_action` instead of `action`
- **Changed**: Background from `service_worker` to `scripts` array
  - Reason: MV2 uses background scripts array, not service workers
- **Changed**: Permissions from `["activeTab", "scripting"]` to `["activeTab", "<all_urls>"]`
  - Reason: MV2 needs `<all_urls>` for content script injection
- **Added**: `browser_specific_settings` with gecko configuration
  - Reason: Firefox-specific settings including extension ID

### 2. `serviceWorker.js`

- **Changed**: Added browser API polyfill check
  - Reason: Ensures compatibility with both Chrome and Firefox

### 3. `popupTimer/popup.js`

- **Changed**: `browser.tabs.query` callback to promise-based
  - Reason: Firefox prefers promise-based APIs

<!-- ## Notes

- The extension code already used the `browser` API which is native to Firefox
- Chrome supports the `browser` API via a polyfill, so the code works on both browsers
- For production deployment to Firefox Add-ons, you'll need to create a proper zip package and submit for review -->
