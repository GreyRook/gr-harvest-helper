/* eslint-disable-next-line no-unused-vars */
function updateModal() {
  modal(`<p>Welcome to the new version of the Harvest plugin!</p> 
  <p>The way this plugin works has changed a bit:</p> 
  <p>Select an issue in Jira, Zammad or GitLab and then click on the extension button in the upper right corner to start tracking time in Harvest.</p>`);
}

/* eslint-disable-next-line no-unused-vars  */
function installModal() {
  modal(`<p>Welcome to the Harvest plugin!</p>
  <p>Select an issue in Jira, Zammad or GitLab and then click on the extension button in the upper right corner to start tracking time in Harvest.</p>`);
}

function modal(text) {
  const modal = document.createElement('dialog');
  modal.innerHTML = text;
  modal.style.zIndex = '1500';
  modal.style.maxWidth = '500px';
  modal.style.height = 'min-content';
  modal.style.top = '5%';
  modal.style.display = 'inline-flex';
  modal.style.flexDirection = 'column';
  modal.style.borderColor = '#f36c00';
  modal.style.borderRadius = '10px';
  modal.style.fontSize = '18px';

  const modalImg = document.createElement('img');
  modalImg.src = chrome.extension.getURL('docs/images/modalImage.png');
  modalImg.style.marginTop = '10px';
  modalImg.style.width = '100%';
  modalImg.style.height = 'auto';
  modal.appendChild(modalImg);

  const closeButton = document.createElement('button');
  closeButton.style.background = '#4fb840';
  closeButton.style.color = '#fff';
  closeButton.style.fontWeight = '600';
  closeButton.style.fontSize = '16px';
  closeButton.style.lineHeight = '38px';
  closeButton.style.borderRadius = '4px';
  closeButton.style.marginTop = '10px';
  closeButton.style.borderStyle = 'solid';
  closeButton.style.borderColor = 'darkgreen';
  closeButton.style.borderWidth = 'thin';
  closeButton.innerHTML = 'OK';
  closeButton.onclick = () => {
    modal.style.display = 'none';
    modal.close();
  };
  modal.appendChild(closeButton);

  document.body.append(modal);
}

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
  let title = document.getElementsByClassName('ticket-title-update js-objectTitle')[0].textContent;
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
