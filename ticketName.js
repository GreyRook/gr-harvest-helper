function GRLog(text) {
  console.log('[GR-Time-Tracker]: ' + text);
}

function detectJira() {
  return document.querySelector('[name=application-name]')?.content === 'JIRA';
}

function detectZammad() {
  return (
    document && document.getElementsByClassName('ticket-title-update js-objectTitle').length > 0
  );
}

function detectGitLab() {
  return (
    document.querySelector('meta[property=og\\:site_name]')?.content === 'GitLab' &&
    document.querySelector('[data-testid=issue-title]')?.textContent
  );
}

async function jiraGetIssue() {
  const issueId = jiraGetIssueId();
  return {
    id: issueId,
    title: await jiraGetIssueTitle(issueId),
  };
}

function jiraGetIssueId() {
  let issueId;
  let issueIdMatches = document.title.match(/\[(.*?)]/);

  if (issueIdMatches) {
    issueId = issueIdMatches[1];
  } else {
    // fallback to get issue id from the url
    const urlParams = new URLSearchParams(window.location.search);
    issueId = urlParams.get('selectedIssue');
  }

  return issueId ?? '';
}

async function jiraGetIssueTitle(issueId) {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;

  return await fetch(protocol + '//' + hostname + '/rest/api/2/issue/' + issueId, {
    headers: { 'Content-Type': 'application/json' },
  })
    .then((response) => response.json())
    .then((data) => {
      return data.fields.summary;
    });
}

function zammadGetIssue() {
  let title =
    document.getElementsByClassName('ticket-title-update js-objectTitle')?.[0]?.textContent ?? '';
  return {
    title: title,
  };
}

function gitlabGetIssue() {
  let taskName = document.querySelector('[data-testid=issue-title]').textContent;
  let taskId = document.querySelector('[data-testid="breadcrumb-current-link"] a')?.textContent;
  let title = taskName + ' (' + taskId + ')';
  return {
    id: taskId,
    title: title,
  };
}

if (detectJira()) {
  GRLog('jira detected');
  jiraGetIssue().then((res) => {
    chrome.runtime.sendMessage(res);
  });
} else if (detectZammad()) {
  GRLog('zammad detected');
  chrome.runtime.sendMessage(zammadGetIssue());
} else if (detectGitLab()) {
  GRLog('gitlab detected');
  chrome.runtime.sendMessage(gitlabGetIssue());
}
