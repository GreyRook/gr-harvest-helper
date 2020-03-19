window._harvestPlatformConfig = {
  applicationName: "GreyRook",
  skipStyling: true
};

var taskName;
var tabURL;
chrome.runtime.onMessage.addListener(function(response) {
  taskName = response;
});

chrome.tabs.executeScript({ file: "/ticketName.js" });
chrome.tabs.query({ currentWindow: true, active: true }, function(tab) {
  tabURL = tab[0].url;
});

window.onload = function() {
  var i = 0;
  const timeout = 2000; //2sec
  const intervalTime = 10;
  var taskNameInterval = setInterval(() => {
    if (this.taskName !== undefined || i == timeout / intervalTime) {
      clearInterval(taskNameInterval);
      var item = { id: 1337, name: this.taskName };
      this.document
        .getElementsByClassName("harvest-timer")[0]
        .setAttribute("data-item", JSON.stringify(item));
      if (this.taskName !== this.undefined) {
        this.document
          .getElementsByClassName("harvest-timer")[0]
          .setAttribute("data-permalink", this.tabURL);
      }
      this.document.getElementsByClassName("harvest-timer")[0].click();
      this.document
        .getElementsByClassName("harvest-timer")[0]
        .setAttribute("top", "10px");
    } else {
      i++;
    }
  }, intervalTime);
};

var frameDetected = false;

var detectFrame = setInterval(() => {
  const harvestIframe = document.getElementById("harvest-iframe");
  if (harvestIframe && !frameDetected) {
    frameDetected = true;

    harvestIframe.style.top = "10px";
    document.body.clientHeight = "150";

    const harvestOverlay = this.document.getElementsByClassName(
      "harvest-overlay"
    )[0];

    harvestOverlay.style.background = "white";
    harvestOverlay.style.overflow = "hidden";

    var scrollHeight = 300;
    setInterval(() => {
      if (
        harvestIframe.scrollHeight !== 300 &&
        harvestIframe.scrollHeight !== 0 &&
        harvestIframe.scrollHeight == scrollHeight
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
    clearInterval(detectFrame);
  }
}, 10);
