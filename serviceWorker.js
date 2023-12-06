chrome.runtime.onInstalled.addListener(function () {
  chrome.tabs.create({
    url: 'https://github.com/GreyRook/harvest-jira-chrome/blob/master/README.md',
  });
});
