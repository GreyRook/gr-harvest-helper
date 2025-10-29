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
  
  if (!issueId) {
    GRLog('Could not extract Jira issue ID - popup will open without autofill');
    return null;
  }
  
  try {
    const issue = await jiraGetIssueTitle(issueId);
    const ticketUrl = `${window.location.protocol}//${window.location.hostname}/browse/${issueId}`;
    return {
      id: issueId,
      title: issue.fields.summary,
      url: ticketUrl,
    };
  } catch (error) {
    GRLog('Error fetching Jira issue: ' + error.message);
    return null;
  }
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
      GRLog(data);
      return data;
    });
}

function zammadGetIssue() {
  let title =
    document.getElementsByClassName('ticket-title-update js-objectTitle')?.[0]?.textContent ?? '';
  return {
    title: title,
    url: window.location.href
  };
}

function gitlabGetIssue() {
  let taskName = document.querySelector('[data-testid=issue-title]').textContent;
  let taskId = document.querySelector('[data-testid="breadcrumb-current-link"] a')?.textContent;
  let title = taskName + ' (' + taskId + ')';
  return {
    id: taskId,
    title: title,
    url: window.location.href,
  };
}

if (detectJira()) {
  GRLog('jira detected');
  jiraGetIssue().then((res) => {
    if (res) {
      browser.runtime.sendMessage(res);
    }
  });
} else if (detectZammad()) {
  GRLog('zammad detected');
  browser.runtime.sendMessage(zammadGetIssue());
} else if (detectGitLab()) {
  GRLog('gitlab detected');
  browser.runtime.sendMessage(gitlabGetIssue());
} else {
  GRLog('no supported platform detected - popup will open without autofill');
  // Don't send any message, allowing the popup to open normally
}
