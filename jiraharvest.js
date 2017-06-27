
function createButton() {
  var $project = $('#project-name-val')
  var projHref = $project.get(0).href.split('/')
  var projectKey = projHref[projHref.length - 1]
  var projectName = $project.text()

  var issueKey = $('#key-val').text() //JIRA.Issue.getIssueKey(); global vars sadly not accessible
  var issueTitle = $('#summary-val').text()

  var $group = $('<ul id=\'opsbar-opsbar-harvest\' class=\'toolbar-harvestbutton toolbar-group pluggable-ops\'></ul>')
  var $list = $('<li class=\'toolbar-item\'></li>')
  var $label = $('<span class=\'trigger-label\'> Track Time</span>')
  var $button = $('<a id=\'harvest-timer\' class=\'harvest-timer toolbar-trigger\' href=\'#\'></a>')

  dataGroup = {
    'id': projectKey,
    'name': projectName
  }
  $button.attr('data-group', JSON.stringify(dataGroup))

  dataItem = {
    'id': issueKey,
    'name': issueTitle
  }
  $button.attr('data-item', JSON.stringify(dataItem))

  var $icon = $('<span class=\'jiraharvest-icon icon\'></span>')
  $icon.css('background', 'url(' + chrome.extension.getURL('images/timer-icon.png'))
  $icon.css('background-position', '0 -105px')
  $icon.css('height', 18)
  $icon.css('width', 12)

  $label.prepend($icon)
  $group.append($list.append($button.append($label)))
  return $group
}

function createListItem() {
  var issueKey = $('#issuekey-val a').text()
  var issueTitle = $('#summary-val').text()

  var projectKey = issueKey.split('-')[0]
  var projectName = $('#ghx-project').text()

  var $list = $('<li id=\'TRELLO-nav\' class=\'ghx-detail-nav-item\'></li>')
  var $button = $('<a id=\'harvest-timer\' title=\'Harvest timer\' href=\'#\'></a>')

  dataGroup = {
    'id': projectKey,
    'name': projectName
  }
  $button.attr('data-group', JSON.stringify(dataGroup))

  dataItem = {
    'id': issueKey,
    'name': issueTitle
  }
  $button.attr('data-item', JSON.stringify(dataItem))

  var $icon = $('<span class=\'jiraharvest-icon ghx-iconfont aui-icon aui-icon-small\'></span>')
  $icon.css('background', 'url(' + chrome.extension.getURL('images/timer-icon.png'))
  $icon.css('background-position', '0 -105px')
  $icon.css('height', 18)
  $icon.css('width', 12)

  $list.append($button.append($icon))

  return $list
}

$(document).on('ready', function(){

  // pattern matching is quite broad so check if this is actually JIRA
  var appName = document.head.querySelector('[name=application-name]')
  if(!appName || (appName && appName.content != 'JIRA')) {
    return
  }

  /*
  * chrome extensions can't access the original sites window var directly
  */

  var $scriptHack = $('<script src=\'https://platform.harvestapp.com/assets/platform.js\'></script>')
  $(document.head).append($scriptHack);

  var code = `
    window._harvestPlatformConfig = {
      'applicationName': 'JIRA',
      'permalink': 'https://' + window.location.host + '/projects/%GROUP_ID%/issues/%ITEM_ID%',
      'skipStyling': true
    }

    window.trigger = function() {
      $('#harvest-messaging').trigger({
        type: 'harvest-event:timers:add',
        element: $('#harvest-timer')
      })
    }
  `

  var windowHack = document.createElement('script');
  windowHack.textContent = code;
  (document.head||document.documentElement).appendChild(windowHack);

  var additions = [
    {
      'elem': function() {
        return $('.command-bar .ops-cont .toolbar-split-left')
      },
      'func': createButton
    }, {
      'elem': function() {
        return $('.ghx-detail-nav-menu ul')
      },
      'func': createListItem
    }
  ]

  // in case the container already exists from the beginning
  for(var i in additions) {
    var addition = additions[i]
    var $elem = addition.elem()

    if($elem && $elem.length > 0) {
      var $btn = $('#harvest-timer')
      if($btn.length == 0) {
        $btn = addition.func.call()
        $elem.append($btn)

        location.href='javascript:window.trigger(); void 0'
      }
    }
  }

  // JIRA needs some time to load an issue most of the time so we have to wait for the issue to be loaded
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (!mutation.addedNodes) return

      for (var i = 0; i < mutation.addedNodes.length; i++) {
        var node = mutation.addedNodes[i];
         var $btn = $('#harvest-timer')

        // stalker is the issue header id
        for(var j in additions) {
          var addition = additions[j]
          var $elem = addition.elem()

          if($btn.length == 0 && $elem && $elem.length > 0) {
            $btn = addition.func.call()
            $elem.append($btn)

            location.href='javascript:window.trigger(); void 0'
          }
        }
      }
    })
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  })

})
