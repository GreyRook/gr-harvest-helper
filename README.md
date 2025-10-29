# Harvest Issue Board Plugin

This extension adds a Harvest time tracking button for Jira, Zammad and GitLab issues (active sprints page, issue page). No synchronization to the webpage is done, all data stays in Harvest.

- [Chrome Store](https://chrome.google.com/webstore/detail/jira-harvest-time-trackin/klgljijecjfkdfobihclllkadmoeokgg)
- [Mozilla Addons](https://addons.mozilla.org/de/firefox/addon/jira-harvest-helper)

# Usage

Select the ticket, then click on the extension icon in the upper right corner. A popup will open where you can specify project and task and set the desired starting time (which defaults to now). A permanent link to the selected issue will be added to the Harvest item automatically.

Earlier versions of this plugin displayed a time tracking button on Jira — this got removed. [Details](docs/on-page-tracker.md).

# Why this project was started

The official [harvest-jira](https://www.getharvest.com/apps-and-integrations/jira) integration is done via a Jira plugin — which might not be possible or desirable in some cases (for example you don't have an admin account on your client's Jira instance).

# Screenshot

![Example](./docs/images/modalImage.png)

# Install the development version

## For Chrome

- Get the code:
  - Either clone this repo (`git clone git@github.com:GreyRook/gr-harvest-helper.git`)
  - Or download as a zip and unzip it (`https://github.com/GreyRook/gr-harvest-helper/archive/master.zip`)
- Go to Chrome's extensions page (`chrome://extensions/`)
- Disable the Chrome Store version of this extension (if installed)
- Enable developer mode via the toggle in the top right
- Click on "Load unpacked" (top left button) and choose the folder of the cloned repo

## For Firefox

## Install the Development Version in Firefox

1. **Get the code** (if you haven't already):
   - Clone this repo: `git clone git@github.com:GreyRook/gr-harvest-helper.git`
   - Or download as a zip and unzip it

2. **Load the extension in Firefox**:
   - navigate to the folder containing the extension files and run `zip -r gr-harvest-helper-firefox.zip .`
   - Open Firefox
   - Navigate to `about:debugging#/runtime/this-firefox`
   - Click on "Load Temporary Add-on..."
   - Navigate to the extension folder and select the `gr-harvest-helper-firefox.zip` file
   - The extension should now be loaded!

3. **Testing**:
   - Navigate to a Jira issue page
   - Click the extension icon in the toolbar
   - The Harvest timer popup should appear with the issue details pre-filled

<!-- 

## For Permanent Installation (Unsigned)

If you want to keep the extension loaded permanently during development:

1. Open `about:config` in Firefox
2. Search for `xpinstall.signatures.required`
3. Set it to `false` (this allows unsigned extensions)
4. Follow the steps above in `about:debugging`

**Note**: Regular Firefox releases require extensions to be signed. For development, use Firefox Developer Edition or Firefox Nightly where you can disable signature verification.

## Building for Production (Firefox Add-ons)

To publish on [addons.mozilla.org](https://addons.mozilla.org):

1. Create a zip file of the extension:
   ```bash
   zip -r gr-harvest-helper-firefox.zip . -x "*.git*" -x "node_modules/*" -x "*.md" -x "docs/*"
   ```

2. Submit to [Firefox Add-ons Developer Hub](https://addons.mozilla.org/developers/)

## Key Changes Made for Firefox Compatibility

- Changed `manifest_version` from 3 to 2 (better Firefox support)
- Changed `action` to `browser_action` (MV2 syntax)
- Changed `service_worker` to `scripts` array in background
- Added `browser_specific_settings` with gecko-specific configuration
- Changed permissions from `scripting` to `<all_urls>` for content script injection
- Updated API calls to use `browser` namespace (already present in code)
- Made `browser.tabs.query` use promises instead of callbacks

## Differences from Chrome Version

The main differences are in the manifest file structure. The extension code itself uses the `browser` API which works on both Chrome (via polyfill) and Firefox natively.
 -->