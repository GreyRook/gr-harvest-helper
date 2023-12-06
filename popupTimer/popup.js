window._harvestPlatformConfig = {
  applicationName: 'GreyRook',
  skipStyling: true,
};

let taskName;
let tabURL;
let tab;
let id;

chrome.runtime.onMessage.addListener(function (response) {
  id = response.id ? response.id : -1;
  taskName = response.title ? response.title : 'select a task first';
});

chrome.tabs.query({ currentWindow: true, active: true }, function (activeTab) {
  setTimeout(() => {
    chrome.scripting.executeScript({ target: { tabId: tab[0].id }, files: ['/ticketName.js'] });
  }, 1000);
  tab = activeTab;
  tabURL = tab[0].url;
});

window.onload = function () {
  let i = 0;
  const timeout = 2000; //2sec
  const intervalTime = 10;
  let taskNameInterval = setInterval(() => {
    if (taskName !== undefined || i === timeout / intervalTime) {
      clearInterval(taskNameInterval);
      let item = { id: id, name: taskName };
      const harvestTimer = document.getElementsByClassName('harvest-timer')[0];
      if (harvestTimer) {
        harvestTimer.setAttribute('data-item', JSON.stringify(item));
        if (taskName !== undefined) {
          harvestTimer.setAttribute('data-permalink', tabURL);
        }
        harvestTimer.click();
        harvestTimer.setAttribute('top', '10px');
      }
    } else {
      i++;
    }
  }, intervalTime);
};

let frameDetected = false;

let detectFrame = setInterval(() => {
  const harvestIframe = document.getElementById('harvest-iframe');
  if (harvestIframe && !frameDetected) {
    frameDetected = true;

    harvestIframe.style.top = '10px';

    const harvestOverlay = document.getElementsByClassName('harvest-overlay')[0];

    harvestOverlay.style.background = 'white';
    harvestOverlay.style.overflow = 'hidden';

    let scrollHeight = 300;
    setInterval(() => {
      if (
        harvestIframe.scrollHeight !== 300 &&
        harvestIframe.scrollHeight !== 0 &&
        harvestIframe.scrollHeight === scrollHeight
      ) {
        document.body.style.height = harvestIframe.scrollHeight + 'px';
        document.body.style.width = '500px';
      } else {
        scrollHeight = harvestIframe.scrollHeight;
      }
    }, 100);
  }

  if (harvestIframe == null && frameDetected) {
    window.close();
    clearInterval(detectFrame);
  }
}, 10);
