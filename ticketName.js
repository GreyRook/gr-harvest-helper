var GR_time_tracking_harvest_executed_once;
if (!GR_time_tracking_harvest_executed_once) {
  GR_time_tracking_harvest_executed_once = true;

  const GRlog = function(text) {
    console.log("[GR-Time-Tracker]: " + text);
  };

  const detectJira = function() {
    const appName = document.head.querySelector("[name=application-name]");
    return (
      appName &&
      appName.content == "JIRA" &&
      document.getElementById("summary-val") !== null
    );
  };

  const detectZammad = function() {
    try {
      return (
        document.getElementsByClassName(
          "ticket-title-update js-objectTitle"
        )[0] !== undefined
      );
    } catch {
      return false;
    }
  };

  const detectGitlab = function() {
    try {
      return (
        document.getElementsByClassName(
          "detail-page-header-actions js-issuable-actions"
        )[0] !== undefined
      );
    } catch {
      return false;
    }
  };

  const jiraAddTimeTracking = function() {
    return document.getElementById("summary-val").textContent;
  };

  const zammadAddTimeTracking = function() {
    return document.getElementsByClassName(
      "ticket-title-update js-objectTitle"
    )[0].textContent;
  };

  const gitlabAddTimeTracking = function() {
    var taskName = document.getElementsByClassName("title qa-title")[0]
      .textContent;
    var taskId = document.getElementsByClassName("breadcrumbs-sub-title")[0]
      .textContent;
    return taskName + "(" + taskId + ")";
  };

  function getName() {
    if (detectJira()) {
      GRlog("jira detected");
      return jiraAddTimeTracking();
    } else if (detectZammad()) {
      GRlog("zammad detected");
      return zammadAddTimeTracking();
    } else if (detectGitlab()) {
      GRlog("gitlab detected");
      return gitlabAddTimeTracking();
    } else {
      return "your task";
    }
  }
}
