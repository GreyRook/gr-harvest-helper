function GRlog(text) {
  console.log("[GR-Time-Tracker]: " + text);
}

function detectJira() {
  const appName = document.querySelector("[name=application-name]");
  return appName && appName.content == "JIRA";
}

function detectZammad() {
  try {
    return (
      document.getElementsByClassName(
        "ticket-title-update js-objectTitle"
      )[0] !== undefined
    );
  } catch {
    return false;
  }
}

function detectGitlab() {
  try {
    return (
      document.getElementsByClassName(
        "detail-page-header-actions js-issuable-actions"
      )[0] !== undefined
    );
  } catch {
    return false;
  }
}

async function jiraAddTimeTracking() {
  let issueId;
  try {
    issueId = document.title.match(/\[(.*?)]/)[1];
  } catch {
    const urlParams = new URLSearchParams(window.location.search);
    issueId = urlParams.get("selectedIssue");
  }
  if (!issueId) return "your task";

  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const issueTitle = fetch(
    protocol + "//" + hostname + "/rest/api/2/issue/" + issueId,
    {
      headers: { "Content-Type": "application/json" }
    }
  )
    .then(response => response.json())
    .then(data => {
      return data.fields.summary;
    });
  return issueTitle;
}

function zammadAddTimeTracking() {
  return document.getElementsByClassName(
    "ticket-title-update js-objectTitle"
  )[0].textContent;
}

function gitlabAddTimeTracking() {
  var taskName = document.getElementsByClassName("title qa-title")[0]
    .textContent;
  var taskId = document.getElementsByClassName("breadcrumbs-sub-title")[0]
    .textContent;
  return taskName + "(" + taskId + ")";
}

if (detectJira()) {
  GRlog("jira detected");
  jiraAddTimeTracking().then(res => {
    chrome.runtime.sendMessage(res);
  });
} else if (detectZammad()) {
  GRlog("zammad detected");
  chrome.runtime.sendMessage(zammadAddTimeTracking());
} else if (detectGitlab()) {
  GRlog("gitlab detected");
  chrome.runtime.sendMessage(gitlabAddTimeTracking());
}
