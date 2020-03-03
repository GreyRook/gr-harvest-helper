(() => {
  // pattern matching is quite broad so check if this is actually JIRA

  const script = document.createElement("script");
  script.src = "https://platform.harvestapp.com/assets/platform.js";

  document.head.append(script);

  // BEGIN INJECTION CODE

  //   if (detectJira()) {
  //     GRlog("jira detected");
  //     jiraAddTimeTracking();
  //   } else if (detectZammad()) {
  //     GRlog("zammad detected");
  //     zammadAddTimeTracking();
  //   } else if (detectGitlab()) {
  //     GRlog("gitlab detected");
  //     gitlabAddTimeTracking();
  //   } else {
  //     return;
  //   }
  // };
  // END INJECTION CODE

  const GRlog = text => {
    console.log("[GR-Time-Tracker]: " + text);
  };

  const detect = () => {
    function createElement(htmlString) {
      const div = document.createElement("div");
      div.innerHTML = htmlString.trim();
      return div.firstChild;
    }
    // SVG icon is taken from the Google Material Icon set
    var clocksvg = createElement(`<svg viewBox="0 0 24 24"  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
     <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8z" fill="#626262"/>
     <path d="M12.5 7H11v6l5.25 3.15l.75-1.23l-4.5-2.67z" fill="#626262"/>
     </svg>`);
    let harvestTimer = createElement(
      `<a title="Track Time"  class="harvest-timer" > Track Time</a>`
    );
    harvestTimer.insertBefore(clocksvg, harvestTimer.firstChild);



    const jiraAddTimeTracking = () => {
      let harvestTimer = document.getElementById("#harvest-timer");

      if (!harvestTimer) {
        harvestTimer = createElement(
          '<a id="harvest-timer" class="harvest-timer" href="#"></a>'
        );
        document.body.append(harvestTimer);
      }

      window._harvestPlatformConfig = {
        applicationName: "JIRA",
        permalink:
          "https://" +
          window.location.host +
          "/projects/%GROUP_ID%/issues/%ITEM_ID%",
        skipStyling: true
      };

      window.triggerHarvest = function() {
        const harvestGroup = {
          id: JIRA.API.Projects.getCurrentProjectKey(),
          name: JIRA.API.Projects.getCurrentProjectName()
        };

        harvestTimer.dataset.group = JSON.stringify(harvestGroup);

        let issueId = JIRA.Issue.getIssueKey();

        if (!issueId) {
          issueId = document.title.match(/\[(.*?)]/)[1];
        }

        fetch("/rest/api/2/issue/" + issueId, {
          headers: { "Content-Type": "application/json" }
        })
          .then(response => response.json())
          .then(data => {
            const issueTitle = data.fields.summary;

            const harvestItem = {
              id: issueId,
              name: `[${issueId}] ${issueTitle}`
            };

            harvestTimer.dataset.item = JSON.stringify(harvestItem);

            // trigger native click
            harvestTimer.click();
          });
      };

      let getSidebarResolved = false;

      JIRA.API.getSidebar().done(sb => {
        getSidebarResolved = true;

        const sidebarGroup = sb.getGroupAt(0);
        if (sb.addItem !== undefined) {
          const item = {
            id: "harvestTimer",
            icon: "time",
            name: "Track Time",
            selected: false,
            url: "javascript:window.triggerHarvest(); void 0;"
          };
          sb.addItem(sidebarGroup.getId(), item, sidebarGroup.links.length);
        } else {
          const item = {
            iconClass: "time",
            isSelected: false,
            label: "Track Time",
            href: "javascript:window.triggerHarvest(); void 0;"
          };

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

        try {
          // The css classes are generated and may change. To find a sidebar item we are searching for the unique path of its svg icon.
          let uniqueSidebarItemIdentifier = document.querySelector(
            "path[d='M5 15h12v-2H5v2zm-2-4h16v6H3v-6z']"
          );

          if (!uniqueSidebarItemIdentifier) {
            uniqueSidebarItemIdentifier = document.querySelector(
              "path[d='M21 17H4.995C4.448 17 4 16.548 4 15.991V6a1 1 0 1 0-2 0v9.991A3.004 3.004 0 0 0 4.995 19H21a1 1 0 0 0 0-2zm-3-8v3a1 1 0 0 0 2 0V8a1 1 0 0 0-1-1h-4a1 1 0 0 0 0 2h3z']"
            );
          }

          // Finds the sidebar item root element
          const sidebarItemRoot = uniqueSidebarItemIdentifier.closest(
            "[role=presentation]:not(svg)"
          );

          const sidebarItem = sidebarItemRoot.cloneNode(true);

          const link = sidebarItem.querySelector("a");

          link.href = "javascript:window.triggerHarvest(); void 0;";
          link.style.boxShadow = "none";
          link.onmouseenter = e =>
            (e.target.style.backgroundColor = "rgb(235, 236, 240)");
          link.onmouseleave = e => (e.target.style.backgroundColor = "");
          link.querySelector(":nth-child(2) :nth-child(1)").textContent =
            "Track Time";

          setHarvestIcon(link.querySelector("svg"));

          sidebarItemRoot.parentNode.append(sidebarItem);
        } catch (error) {
          GRlog(error);
        }
      }, 10);

      function setHarvestIcon(el) {
        const iconSvg = el;
        const iconContainer = iconSvg.parentNode;
        iconSvg.remove();

        const auiMedium = createElement(
          "<style>.aui-icon-medium {height: 24px!important; width: 24px!important;} .aui-icon-medium:before {font-size: 20px; margin-top: -10px; margin-left: 2px;}</style>"
        );
        iconContainer.append(auiMedium);

        const newIcon = createElement(
          '<i class="aui-icon aui-icon-small aui-icon-medium aui-iconfont-time" />'
        );
        iconContainer.append(newIcon);
      }
    };
    const zammadAddTimeTracking = () => {
      window._harvestPlatformConfig = {
        applicationName: "ZAMMAD",
        permalink: window.location.href,
        skipStyling: true
      };

      clocksvg.setAttribute("height", "40");
      clocksvg.setAttribute("width", "40");
      clocksvg.style.verticalAlign = "middle";

      function updateTaskName() {
        var taskName = document.getElementsByClassName(
          "ticket-title-update js-objectTitle"
        )[0].textContent;
        var item = { id: 1337, name: taskName };
        harvestTimer.setAttribute("data-item", JSON.stringify(item));
      }
      try {
        var bottomBar = document.getElementsByClassName(
          "flex horizontal js-avatars"
        )[0];
        var taskNameDiv = document.getElementsByClassName(
          "ticket-title-update js-objectTitle"
        )[0];
        updateTaskName();
        harvestTimer.href = "javascript:window.triggerHarvest(); void 0;";

        bottomBar.appendChild(harvestTimer);
      } catch {}

      window.onhashchange = function() {
        bottomBar = document.getElementsByClassName(
          "flex horizontal js-avatars"
        )[0];
        if (
          bottomBar &&
          !bottomBar.getElementsByClassName("harvest-timer")[0]
        ) {
          updateTaskName();
          harvestTimer.href = "javascript:window.triggerHarvest(); void 0;";

          bottomBar.appendChild(harvestTimer);
        }
      };
    };
    const gitlabAddTimeTracking = () => {
      debugger;
      window._harvestPlatformConfig = {
        applicationName: "GIT",
        permalink: window.location.href,
        skipStyling: true
      };
      var taskName = document.getElementsByClassName("title qa-title")[0]
        .textContent;
      var taskId = document.getElementsByClassName("breadcrumbs-sub-title")[0]
        .textContent;

      clocksvg.setAttribute("height", "20");
      clocksvg.setAttribute("width", "20");
      clocksvg.style.verticalAlign = "text-top";

      var item = { id: 1337, name: taskName + "(" + taskId + ")" };
      harvestTimer.setAttribute("data-item", JSON.stringify(item));
      harvestTimer.href = "javascript:window.triggerHarvest(); void 0;";
      let iconContainer = document.createElement("div");
      iconContainer.appendChild(harvestTimer);
      iconContainer.style.float = "right";
      const issuebar = document.getElementsByClassName("issuable-meta")[0];
      issuebar.appendChild(iconContainer);
    };

    const detectJira = () => {
      const appName = document.head.querySelector("[name=application-name]");
      if (appName && appName.content == "JIRA") {
        GRlog("jira detected");
        return jiraAddTimeTracking;
      }
    };
    const detectZammad = () => {
      try {
        const zammadObject = App.Config.get(
          "defaults_calendar_subscriptions_tickets"
        );
        if (
          zammadObject.escalation !== undefined &&
          zammadObject.new_open !== undefined &&
          zammadObject.pending !== undefined
        ) {
          GRlog("zammad detected");
          return zammadAddTimeTracking;
        }
      } catch (error) {
        return false;
      }
    };
    const detectGitlab = () => {
      try {
        if (
          document.getElementsByClassName(
            "detail-page-header-actions js-issuable-actions"
          )[0] !== undefined
        ) {
          GRlog("gitlab detected");
          return gitlabAddTimeTracking;
        }
      } catch {
        return false;
      }
    };

    return {
      jira: () => detectJira(),
      zammad: () => detectZammad(),
      gitlab: () => detectGitlab()
    };
  };

  for (const key in detect()) {
    const callback = detect()[key]() || null;
    if (callback) {
      // windowhack the callback here or make it a function
      const windowHack = document.createElement("script");
      windowHack.textContent = callback();
      (document.head || document.documentElement).appendChild(windowHack);
      GRlog("code injected");
      break;
    }
  }
})();
