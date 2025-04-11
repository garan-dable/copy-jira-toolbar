(function () {
  if (!location.href.includes('atlassian.net/browse/')) return;

  const match = window.location.pathname.match(/\/browse\/([A-Z]+-\d+)/);
  const issueKey = match?.[1];
  if (!issueKey) return;

  const keyBtnId = 'key-btn';
  const titleBtnId = 'title-btn';
  const contentsBtnId = 'contents-btn';
  const urlBtnId = 'url-btn';
  const hasKeyBtnId = document.getElementById(keyBtnId);
  const hasTitleBtnId = document.getElementById(titleBtnId);
  const hasUrlBtnId = document.getElementById(urlBtnId);
  const hasContentsBtnId = document.getElementById(contentsBtnId);

  if (hasKeyBtnId || hasTitleBtnId || hasUrlBtnId || hasContentsBtnId) return;

  const createButton = (id, text, onClick) => {
    const button = document.createElement('button');
    button.id = id;
    button.innerText = text;
    button.style.padding = '4px 6px';
    button.style.fontStyle = 'normal';
    button.style.fontSize = '12px';
    button.style.textDecoration = 'none';
    button.style.backgroundColor = '#fff';
    button.style.border = 'none';
    button.style.cursor = 'pointer';
    button.style.outline = 'none';

    button.addEventListener('mouseover', () => {
      button.style.fontStyle = 'italic';
      button.style.textDecoration = 'underline';
      button.style.backgroundColor = '#00ffff';
    });
    button.addEventListener('mouseout', () => {
      button.style.fontStyle = 'normal';
      button.style.textDecoration = 'none';
      button.style.backgroundColor = '#fff';
    });

    button.onclick = onClick;
    return button;
  };

  const titleEl = document.querySelector(
    '[data-testid="issue.views.issue-base.foundation.summary.heading"]'
  );
  const contentsEl = document.querySelector(
    '[data-testid="issue.views.field.rich-text.description"]'
  );

  const turndownService = new TurndownService();
  const title = titleEl?.innerText || '';
  const keyTitle = `[${issueKey}] ${title}`;
  const contents = turndownService.turndown(contentsEl?.innerHTML || '');
  const url = location.href;

  const getButton = (id, text, value) => {
    const targetButton = createButton(id, text, () => {
      navigator.clipboard
        .writeText(value)
        .then(() => {
          targetButton.style.backgroundColor = '#ffff00';
          setTimeout(() => {
            targetButton.style.backgroundColor = '#fff';
          }, 1000);
        })
        .catch(console.error);
    });

    return targetButton;
  };

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '15px';
  container.style.left = '50%';
  container.style.transform = 'translateX(-50%)';
  container.style.zIndex = 9999;
  container.style.display = 'flex';
  container.style.gap = '14px';
  container.style.padding = '0 24px';
  container.style.backgroundColor = '#fff';
  container.style.border = '1px solid #000';
  container.style.borderRadius = '5px';

  container.appendChild(getButton(keyBtnId, 'KEY', issueKey));
  container.appendChild(getButton(titleBtnId, 'KEY+TITLE', keyTitle));
  container.appendChild(getButton(titleBtnId, 'TITLE', title));
  container.appendChild(getButton(contentsBtnId, 'CONTENTS', contents));
  container.appendChild(getButton(urlBtnId, 'URL', url));
  document.body.appendChild(container);
})();
