
function createButton() {
  var issueKey = $('#key-val').text() //JIRA.Issue.getIssueKey(); global vars sadly not accessible
  var issueTitle = $('#summary-val').text()

  var $project = $('#project-name-val')
  var projHref = null
  var projectKey = null
  var projectName = null
  // old jira vs new jira (a version check would probably be better huh)
  if ($project.length != 0) {
    projHref = $project.get(0).href.split('/')
    projectKey = projHref[projHref.length - 1]
    projectName = $project.text()
  } else {
    var splitIssueKey = issueKey.split('-')
    splitIssueKey.splice(splitIssueKey.length - 1)
    projectKey = splitIssueKey.join('-')
    projectName = $('.geqndN').get(0).innerText
  }

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
  // old jira vs new jira (a version check would probably be better huh)
  var issueKey = $('#issuekey-val a').text()
  var issueTitle = null
  var projectName = null
  var $list = null
  var $listItem = null
  if (issueKey != '') {
    issueTitle = $('#summary-val').text()
    projectName = $('#ghx-project').text()

    $list = $('<li id=\'TRELLO-nav\' class=\'ghx-detail-nav-item\'></li>')
    $listItem = $list
  } else {
    $listItem = $('<div></div>')
    var $span = $('<span class="sc-czyBUM gKQHuw"></span>')
    $listItem.append($span)

    $list = $('<button class="sc-hMqMXs cdkVsS" spacing="none" type="button"></button>')
    $list.css({
      'width': '32px',
      'height': '32px',
      'display': 'inline-flex',
      'justify-content': 'center'
    })
    $span.append($list)

    projectName = $('.issZJq').text()

    issueTitle = $('.iGOJgA').text()
    issueKey = $('#ghx-detail-view .sc-dEoRIm.kHqMiE.sc-iqzUVk.NYYBu').text()
  }

  var splitIssueKey = issueKey.split('-')
  splitIssueKey.splice(splitIssueKey.length - 1)
  var projectKey = splitIssueKey.join('-')

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

  var $icon = $('<span class=\'jiraharvest-icon ghx-iconfont aui-icon aui-icon-small\'></span>')
  $icon.css('background', 'url(' + chrome.extension.getURL('images/timer-icon.png'))
  $icon.css('background-position', '0 -105px')
  $icon.css('height', 18)
  $icon.css('width', 12)

  $button.append($icon)
  $list.append($button)

  return $listItem
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
        return $('.ghx-detail-nav-menu ul, .kwlpBk')
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
