# Harvest Issue Board Plugin

This extension adds a Harvest time tracking button for Jira, Zammad and GitLab issues (active sprints page, issue page). No synchronization to the webpage is done, all data stays in Harvest.
 
 * [Chrome Store](https://chrome.google.com/webstore/detail/jira-harvest-time-trackin/klgljijecjfkdfobihclllkadmoeokgg)
 * [Mozilla Addons](https://addons.mozilla.org/de/firefox/addon/jira-harvest-helper)

# Usage
Select the ticket, then click on the extension icon in the upper right corner. A popup will open where you can specify project and task and set the desired starting time (which defaults to now). A permanent link to the selected issue will be added to the Harvest item automatically.

Earlier versions of this plugin displayed a time tracking button on Jira — this got removed. [Details](docs/on-page-tracker.md).

# Why this project was started

The official [harvest-jira](https://www.getharvest.com/apps-and-integrations/jira) integration is done via a Jira plugin — which might not be possible or desirable in some cases (for example you don't have an admin account on your client's Jira instance).

# Screenshot
![Example](./docs/images/modalImage.png)

# Install the development version
- Clone this repo (`git clone git@github.com:GreyRook/gr-harvest-helper.git`)
- Go to Chrome's extensions page (`chrome://extensions/`)
- Disable the Chrome Store version of this extension (if installed)
- Enable developer mode via the toggle in the top right
- Click on "Load unpacked" (top left button) and choose the folder of the cloned repo
