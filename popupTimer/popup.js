window._harvestPlatformConfig = {
  applicationName: 'GreyRook',
  skipStyling: true,
};

let taskName;
let tabURL;
let tab;
let id;

let messageReceived = false;

browser.runtime.onMessage.addListener(function (response) {
  messageReceived = true;
  id = response.id ? response.id : -1;
  taskName = response.title ? response.title : 'select a task first';
  tabURL = response.url ? response.url : window.location.href;

  // Append URL to the task name so it appears in the notes field
  let taskNameWithUrl = taskName;
  if (tabURL) {
    taskNameWithUrl = taskName + '\n';
  }

  let item = { id: id, name: taskNameWithUrl };
  const harvestTimer = document.getElementsByClassName('harvest-timer')[0];
  if (harvestTimer) {
    harvestTimer.setAttribute('data-item', JSON.stringify(item));
    // Always set the permalink if we have a URL
    if (tabURL) {
      harvestTimer.setAttribute('data-permalink', tabURL);
      console.log('Setting permalink to:', tabURL);
    }
    harvestTimer.click();
    harvestTimer.setAttribute('top', '10px');
  } else {
    console.error('Harvest timer element not found');
  }
});

browser.tabs.query({ currentWindow: true, active: true }).then(function (activeTab) {
  browser.tabs.executeScript(activeTab[0].id, { file: '/ticketName.js' });
  tab = activeTab;
  tabURL = tab[0].url;
});

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

setTimeout(() => { 
  if (!messageReceived) {
    console.error('No message received from ticketName.js - open popup without autofill');
    
    const harvestTimer = document.getElementsByClassName('harvest-timer')[0];
    if (harvestTimer) {
      harvestTimer.click();
      harvestTimer.setAttribute('top', '10px');
    } else {
      console.error('Harvest timer element not found');
    }
  }
}, 1000);
