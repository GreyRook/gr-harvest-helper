/* eslint-disable no-unused-vars */
function updateModal() {
  modal(`<p> Welcome to the new version of Harvest Plugin! </p> 
  <p> The way this plugin works has changed a bit: </p> 
  <p> Select an issue in Jira, Zammad or GitLab and then click on the extension button in the upper right corner to start tracking time in Harvest.</p>`);
}

function installModal() {
  modal(`<p>Welcome to Harvest Plugin!</p>
  <p> Select an issue in Jira, Zammad or GitLab and then click on the extension button in the upper right corner to start tracking time in Harvest.</p>`);
}

/* eslint-enable no-unused-vars */

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

function GRlog(text) {
  console.log('[GR-Time-Tracker]: ' + text);
}

function detectJira() {
  const appName = document.querySelector('[name=application-name]');
  return appName && appName.content === 'JIRA';
}

function detectZammad() {
  return (
    document && document.getElementsByClassName('ticket-title-update js-objectTitle').length > 0
  );
}

function detectGitlab() {
  return (
    document &&
    document.getElementsByClassName('detail-page-header-actions js-issuable-actions').length > 0
  );
}

async function jiraGetIssueTitle() {
  let issueId;
  let issueIdMatches = document.title.match(/\[(.*?)]/);

  if (issueIdMatches) {
    issueId = issueIdMatches[1];
  } else {
    // fallback to get issue id from the url
    const urlParams = new URLSearchParams(window.location.search);
    issueId = urlParams.get('selectedIssue');
  }

  if (!issueId) return '';

  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const issueTitle = await fetch(protocol + '//' + hostname + '/rest/api/2/issue/' + issueId, {
    headers: { 'Content-Type': 'application/json' },
  })
    .then((response) => response.json())
    .then((data) => {
      return data.fields.summary;
    });
  return {
    id: issueId,
    title: issueTitle,
  };
}

function zammadGetIssueTitle() {
  var title = document.getElementsByClassName('ticket-title-update js-objectTitle')[0].textContent;
  return {
    title: title,
  };
}

function gitlabGetIssueTitle() {
  var taskName = document.getElementsByClassName('title qa-title')[0].textContent;
  var taskId = document.getElementsByClassName('breadcrumbs-sub-title')[0].textContent;
  var title = taskName + '(' + taskId + ')';
  return {
    id: taskId,
    title: title,
  };
}

if (detectJira()) {
  GRlog('jira detected');
  jiraGetIssueTitle().then((res) => {
    chrome.runtime.sendMessage(res);
  });
} else if (detectZammad()) {
  GRlog('zammad detected');
  chrome.runtime.sendMessage(zammadGetIssueTitle());
} else if (detectGitlab()) {
  GRlog('gitlab detected');
  chrome.runtime.sendMessage(gitlabGetIssueTitle());
}
