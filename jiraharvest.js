
function createButton(container) {

  var $project = $("#project-name-val");
  var projHref = $project.get(0).href.split("/");
  var projectKey = projHref[projHref.length - 1];
  var projectName = $project.text();

  var issueKey = $("#key-val").text(); //JIRA.Issue.getIssueKey(); global vars sadly not accessible
  var issueTitle = $("#summary-val").text();

  var $group = $("<ul id=\"opsbar-opsbar-harvest\" class=\"toolbar-harvestbutton toolbar-group pluggable-ops\"></ul>");
  var $list = $("<li class=\"toolbar-item\"></li>");
  var $label = $("<span class=\"trigger-label\"> Track Time</span>");
  var $button = $("<a id=\"harvest-timer\" class=\"harvest-timer toolbar-trigger\" href=\"#\"></a>");

  dataGroup = {
    "id": projectKey,
    "name": projectName
  };
  $button.attr('data-group', JSON.stringify(dataGroup));

  dataItem = {
    "id": issueKey,
    "name": issueTitle
  };
  $button.attr('data-item', JSON.stringify(dataItem));

  var $icon = $("<span class=\"jiraharvest-icon icon\"></span>");
  $icon.css("background", "url(" + chrome.extension.getURL('images/timer-icon.png'));
  $icon.css("background-position", "0 -105px");
  $icon.css("height", 18);
  $icon.css("width", 12);

  $label.prepend($icon);
  $group.append($list.append($button.append($label)));

  return $group;
}

$(document).on('ready', function(){
  /*
  * chrome extensions can't access the original sites window var directly
  */

  var $scriptHack = $("<script src=\"https://platform.harvestapp.com/assets/platform.js\"></script>");
  $(document.head).append($scriptHack);

  var code = `
    window._harvestPlatformConfig = {
      "applicationName": "JIRA",
      "permalink": "https://" + window.location.host + "/projects/%GROUP_ID%/issues/%ITEM_ID%",
      "skipStyling": true
    }

    window.trigger = function() {
      $("#harvest-messaging").trigger({
        type: "harvest-event:timers:add",
        element: $("#harvest-timer")
      });
    }
  `;

  var windowHack = document.createElement("script");
  windowHack.textContent = code;
  (document.head||document.documentElement).appendChild(windowHack);

  var $opsCont = $('.command-bar .ops-cont .toolbar-split-left');

  // JIRA needs some time to load an issue most of the time so we have to wait for the issue to be loaded
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (!mutation.addedNodes) return

        for (var i = 0; i < mutation.addedNodes.length; i++) {
          var node = mutation.addedNodes[i];

          // stalker is the issue header id
          $opsCont = $(node).find('.command-bar .ops-cont .toolbar-split-left');
          var $btn = $('#harvest-timer');
          if($btn.length == 0 && $opsCont.length > 0) {
            $btn = createButton();
            $opsCont.append($btn);

            location.href="javascript:window.trigger(); void 0";
          }
        }
      });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  });

});
