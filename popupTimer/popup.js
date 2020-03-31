window._harvestPlatformConfig = {
  applicationName: "GreyRook",
  skipStyling: true
};

var taskName;
var tabURL;
var tab;
chrome.runtime.onMessage.addListener(function(response) {
  taskName = response;
});

chrome.tabs.query({ currentWindow: true, active: true }, function(tab) {
  setTimeout(() => {
    chrome.tabs.executeScript({ file: "/ticketName.js" });
  }, 1000);
  this.tab = tab;
  tabURL = tab[0].url;
});

chrome.runtime.onInstalled.addListener(function(details) {
  chrome.tabs.create({
    url:"https://git.r0k.de/greyrook/foss/harvest-jira-chrome/blob/master/README.md"
  });
  setTimeout(() => {
    if (details.reason == "install") {
      chrome.tabs.executeScript({ code: "installModal()" });
    } else if (details.reason == "update") {
      chrome.tabs.executeScript({ code: "updateModal()" });
    }
  }, 1050);
});

window.onload = function() {
  let i = 0;
  const timeout = 2000; //2sec
  const intervalTime = 10;
  let taskNameInterval = setInterval(() => {
    if (this.taskName !== undefined || i == timeout / intervalTime) {
      clearInterval(taskNameInterval);
      let item = { id: 1337, name: this.taskName };
      const harvestTimer = this.document.getElementsByClassName(
        "harvest-timer"
      )[0];
      harvestTimer.setAttribute("data-item", JSON.stringify(item));
      if (this.taskName !== undefined) {
        harvestTimer.setAttribute("data-permalink", this.tabURL);
      }
      harvestTimer.click();
      harvestTimer.setAttribute("top", "10px");
    } else {
      i++;
    }
  }, intervalTime);
};

var frameDetected = false;

let detectFrame = setInterval(() => {
  const harvestIframe = document.getElementById("harvest-iframe");
  if (harvestIframe && !frameDetected) {
    frameDetected = true;

    harvestIframe.style.top = "10px";

    const harvestOverlay = this.document.getElementsByClassName(
      "harvest-overlay"
    )[0];

    harvestOverlay.style.background = "white";
    harvestOverlay.style.overflow = "hidden";

    let scrollHeight = 300;
    setInterval(() => {
      if (
        harvestIframe.scrollHeight !== 300 &&
        harvestIframe.scrollHeight !== 0 &&
        harvestIframe.scrollHeight === scrollHeight
      ) {
        document.body.style.height = harvestIframe.scrollHeight + "px";
        document.body.style.width = "500px";
      } else {
        scrollHeight = harvestIframe.scrollHeight;
      }
    }, 100);
  }

  if (harvestIframe == null && frameDetected) {
    window.close();
  }
}, 10);
