document.onload = init()

function init(){
  // pattern matching is quite broad so check if this is actually JIRA
  const appName = document.head.querySelector('[name=application-name]');
  if(!appName || (appName && appName.content !== 'JIRA')) {
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://platform.harvestapp.com/assets/platform.js';

  document.head.append(script);

  // BEGIN INJECTION CODE
  const code = function() {
    console.log('code injected');

    function createElement(htmlString) {
      const div = document.createElement('div');
      div.innerHTML = htmlString.trim();
      return div.firstChild;
    }

    let harvestTimer =  document.getElementById('#harvest-timer');

    if (!harvestTimer) {
      harvestTimer = createElement('<a id="harvest-timer" class="harvest-timer" href="#">Test</a>');
      document.body.append(harvestTimer);
    }

    window._harvestPlatformConfig = {
      'applicationName': 'JIRA',
      'permalink': 'https://' + window.location.host + '/projects/%GROUP_ID%/issues/%ITEM_ID%',
      'skipStyling': true,
    };

    window.triggerHarvest = function() {
      const harvestGroup = {
        id: JIRA.API.Projects.getCurrentProjectKey(),
        name: JIRA.API.Projects.getCurrentProjectName(),
      };

      harvestTimer.dataset.group = JSON.stringify(harvestGroup);

      let issueId = JIRA.Issue.getIssueKey();

      if (!issueId) {
        issueId = document.title.match(/\[(.*?)]/)[1];
      }

      fetch("/rest/api/2/issue/" + issueId, {headers: {'Content-Type': 'application/json'}})
        .then(response => response.json())
        .then(data => {
          const issueTitle = data.fields.summary;

          const harvestItem = {
            'id': issueId,
            'name': `[${issueId}] ${issueTitle}`,
          };

          harvestTimer.dataset.item = JSON.stringify(harvestItem);

          // trigger native click
          harvestTimer.click();
        })
    };

    let getSidebarResolved = false;

    JIRA.API.getSidebar().done((sb) => {
      getSidebarResolved = true;

      const sidebarGroup = sb.getGroupAt(0);
      if (sb.addItem !== undefined) {
        const item = {
          id: 'harvestTimer',
          icon: 'time',
          name: 'Track Time',
          selected: false,
          url: 'javascript:window.triggerHarvest(); void 0;'
        };
        sb.addItem(sidebarGroup.getId(), item, sidebarGroup.links.length);
      } else {
        const item = {
          iconClass: 'time',
          isSelected: false,
          label: 'Track Time',
          href: 'javascript:window.triggerHarvest(); void 0;'
        }

        const sidebarItem = aui.navigation.item(item);
        const domItem = createElement(sidebarItem);
        sidebarGroup.el.firstChild.append(domItem);
      }
    });

    // Fallback for the case that JIRA.API.getSidebar() is not supported.
    setTimeout(() => {
      if (getSidebarResolved) {
        return;
      }

      // The css classes are generated and may change. To find a sidebar item we are searching for the unique path of its svg icon.
      const uniqueSidebarItemIdentifier = document.querySelector('path[d=\'M5 15h12v-2H5v2zm-2-4h16v6H3v-6z\']');

      // Finds the sidebar item root element
      const sidebarItemRoot = uniqueSidebarItemIdentifier.closest('[role=presentation]:not(svg)');

      const sidebarItem = sidebarItemRoot.cloneNode(true);

      const link = sidebarItem.querySelector('a');

      link.href = 'javascript:window.triggerHarvest(); void 0;';
      link.style.boxShadow = 'none'
      link.onmouseenter = e => e.target.style.backgroundColor = 'rgb(235, 236, 240)'
      link.onmouseleave = e => e.target.style.backgroundColor = ''
      link.querySelector(':nth-child(2) :nth-child(1)').textContent = 'Track Time';

      setHarvestIcon(link.querySelector('svg'));

      sidebarItemRoot.parentNode.append(sidebarItem);
    }, 10);

    function setHarvestIcon (el) {
      const iconSvg = el;
      const iconContainer = iconSvg.parentNode;
      iconSvg.remove();

      const auiMedium = createElement('<style>.aui-icon-medium {height: 24px!important; width: 24px!important;} .aui-icon-medium:before {font-size: 20px; margin-top: -10px; margin-left: 2px;}</style>');
      iconContainer.append(auiMedium);

      const newIcon = createElement('<i class="aui-icon aui-icon-small aui-icon-medium aui-iconfont-time" />');
      iconContainer.append(newIcon);
    }
  }
  // END INJECTION CODE

  const injection = `(${code.toString()})()`;

  const windowHack = document.createElement('script');
  windowHack.textContent = injection;
  (document.head||document.documentElement).appendChild(windowHack);
}
