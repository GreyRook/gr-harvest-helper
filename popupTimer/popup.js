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
  this.document
    .getElementsByClassName("harvest-timer")[0]
    .setAttribute("data-item", JSON.stringify(item));
  this.document
    .getElementsByClassName("harvest-timer")[0]
    .setAttribute("data-permalink", this.tabURL);
  this.document.getElementsByClassName("harvest-timer")[0].click();
  this.document
    .getElementsByClassName("harvest-timer")[0]
    .setAttribute("top", "10px");
};

var frameDetected = false;

var detectFrame = setInterval(() => {
  if (document.getElementById("harvest-iframe") && !frameDetected) {
    frameDetected = true;

    document.getElementById("harvest-iframe").style.top = "10px";
    document.body.clientHeight = "150";

    this.document.getElementsByClassName(
      "harvest-overlay"
    )[0].style.background = "white";

    this.document.getElementsByClassName("harvest-overlay")[0].style.overflow =
      "hidden";

    var scrollHeight = 300;
    var setHeight = setInterval(() => {
      if (
        document.getElementById("harvest-iframe").scrollHeight !== 300 &&
        document.getElementById("harvest-iframe").scrollHeight == scrollHeight
      ) {
        document.body.style.height =
          document.getElementById("harvest-iframe").scrollHeight + "px";
        document.body.style.width = "500px";
        clearInterval(setHeight);
      } else {
        scrollHeight = document.getElementById("harvest-iframe").scrollHeight;
      }
    }, 100);
  }

  if (document.getElementById("harvest-iframe") == null && frameDetected) {
    window.close();
    clearInterval(detectFrame);
  }
}, 10);
