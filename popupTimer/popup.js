window._harvestPlatformConfig = {
  applicationName: "GreyRook",
  skipStyling: true
};

var taskName;
var tabURL;

chrome.tabs.executeScript({ file: "/ticketName.js" });
chrome.tabs.query({ currentWindow: true, active: true }, function(tab) {
  chrome.tabs.executeScript(tab[0].id, { code: "getName()" }, function(result) {
    taskName = result[0];
  });
  tabURL = tab[0].url;
});

window.onload = function() {
  var item = { id: 1337, name: this.taskName };

  const harvestTimer = this.document.getElementsByClassName("harvest-timer")[0];

  harvestTimer.setAttribute("data-item", JSON.stringify(item));
  harvestTimer.setAttribute("data-permalink", this.tabURL);
  harvestTimer.click();
  harvestTimer.setAttribute("top", "10px");
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
    var setHeight = setInterval(() => {
      if (
        harvestIframe.scrollHeight !== 300 &&
        harvestIframe.scrollHeight !== 0 &&
        harvestIframe.scrollHeight == scrollHeight
      ) {
        document.body.style.height = harvestIframe.scrollHeight + "px";
        if (harvestIframe.scrollHeight !== 267) {
          clearInterval(setHeight);
        }
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
