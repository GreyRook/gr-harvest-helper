$(document).on('ready', function(){

  // pattern matching is quite broad so check if this is actually JIRA
  var appName = document.head.querySelector('[name=application-name]');
  if(!appName || (appName && appName.content !== 'JIRA')) {
    return;
  }

  var $scriptHack = $('<script src=\'https://platform.harvestapp.com/assets/platform.js\'></script>');
  $(document.head).append($scriptHack);

  // BEGIN INJECTION CODE
  var code = function() {
    console.log('code injected');

    var $harvestTimer = $('#harvest-timer');
    if ($harvestTimer.length === 0) {
      $harvestTimer = $('<a id="harvest-timer" class="harvest-timer" href="#">Test</a>');
      $(document.body).append($harvestTimer);

      $('#harvest-messaging').trigger({
        type: 'harvest-event:timers:add',
        element: $harvestTimer.get(0),
      });
    }

    window._harvestPlatformConfig = {
      'applicationName': 'JIRA',
      'permalink': 'https://' + window.location.host + '/projects/%GROUP_ID%/issues/%ITEM_ID%',
      'skipStyling': true,
    };

    window.triggerHarvest = function() {
      var harvestGroup = {
        id: JIRA.API.Projects.getCurrentProjectKey(),
        name: JIRA.API.Projects.getCurrentProjectName(),
      };
      $harvestTimer.attr('data-group', JSON.stringify(harvestGroup));

      // request name from API
      var issueTitle = null;
      AJS.$.ajax({
        url: "/rest/api/2/issue/" + JIRA.Issue.getIssueKey(),
        type: 'get',
        dataType: 'json',
        async: false,
        success: function(data) {
          issueTitle = data.fields.summary;
        },
      });

      harvestItem = {
        'id': JIRA.Issue.getIssueKey(),
        'name': issueTitle,
      };
      $harvestTimer.attr('data-item', JSON.stringify(harvestItem));
      // trigger native click
      $harvestTimer.get(0).click();
    };

    let getSidebarResolved = false;

    JIRA.API.getSidebar().done((sb) => {
      getSidebarResolved = true;

      var sidebarGroup = sb.getGroupAt(0);
      if (sb.addItem !== undefined) {
        var item = {
          id: 'harvestTimer',
          icon: 'time',
          name: 'Track Time',
          selected: false,
          url: 'javascript:window.triggerHarvest(); void 0;'
        };
        sb.addItem(sidebarGroup.getId(), item, sidebarGroup.links.length);
        setHarvestIcon(el);
      } else {
        var item = {
          iconClass: 'time',
          isSelected: false,
          label: 'Track Time',
          href: 'javascript:window.triggerHarvest(); void 0;'
        }

        var $auiItem = $(aui.navigation.item(item))
        sidebarGroup.$el.children().append($auiItem)
      }
    });

    // Fallback for the case that JIRA.API.getSidebar() is not supported.
    setTimeout(() => {
      if (getSidebarResolved) {
        return;
      }

      // The css classes are generated and may change. To find a sidebar item we are searching for the unique path of its svg icon.
      const uniqueSidebarItemIdentifier = $('path[d=\'M5 15h12v-2H5v2zm-2-4h16v6H3v-6z\']');

      // Finds the sidebar item root element
      const sidebarItemRoot = uniqueSidebarItemIdentifier.closest('[role=presentation]:not(svg)');

      const sidebarItem = sidebarItemRoot.clone();

      const link = sidebarItem.find('a').first();

      link.attr('href', 'javascript:window.triggerHarvest(); void 0;');
      link.hover(
          function () { $(this).css('background-color', 'rgb(235, 236, 240)') },
          function () { $(this).css('background-color', 'transparent') }
      );
      link.find(':nth-child(2) :nth-child(1)').text('Track Time');

      setHarvestIcon(link.find('svg'));

      sidebarItemRoot.parent().append(sidebarItem);
    }, 10);

    function setHarvestIcon (el) {
      var $iconSvg = el;
      var $iconContainer = $iconSvg.parent();
      $iconSvg.remove();

      var $auiMedium = $('<style>.aui-icon-medium {height: 24px; width: 24px;} .aui-icon-medium:before {font-size: 20px; margin-top: -10px; margin-left: 2px;}</style>');
      $iconContainer.append($auiMedium);

      var $newIcon = $('<i class="aui-icon aui-icon-small aui-icon-medium aui-iconfont-time" />');
      $iconContainer.append($newIcon);
    }
  }
  // END INJECTION CODE

  var injection = `(${code.toString()})()`;

  var windowHack = document.createElement('script');
  windowHack.textContent = injection;
  (document.head||document.documentElement).appendChild(windowHack);
});
