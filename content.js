(async function () {
  const toolbarId = 'copy-jira-toolbar';
  let currentPath = location.pathname;
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const run = async () => {
    if (!location.href.includes('atlassian.net/browse/')) return;

    const match = currentPath.match(/\/browse\/([A-Z]+-\d+)/);
    const issueKey = match?.[1];
    if (!issueKey) return;
    if (document.getElementById(toolbarId)) return;

    const titleSel =
      '[data-testid="issue.views.issue-base.foundation.summary.heading"]';
    const contentsSel =
      '[data-testid="issue.views.field.rich-text.description"]';

    await delay(1500);

    const titleEl = document.querySelector(titleSel);
    const title = titleEl?.innerText?.trim() || '';
    const keyTitle = `[${issueKey}] ${title}`;
    const contentsEl = document.querySelector(contentsSel);
    const contentsHtml = contentsEl?.innerHTML || '';
    const turndownService = new TurndownService();
    const contents = turndownService.turndown(contentsHtml);
    const url = location.href;

    const createButton = (text, id, value) => {
      const button = document.createElement('button');
      button.id = id;
      button.innerText = text;
      button.style.padding = '4px 8px';
      button.style.fontSize = '12px';
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

      button.onclick = () => {
        navigator.clipboard
          .writeText(value)
          .then(() => {
            if (!value) throw new Error('Missing value');
            console.log('[CJT]', value);
            button.style.backgroundColor = '#ffff00';
            setTimeout(() => (button.style.backgroundColor = '#fff'), 1000);
          })
          .catch((error) => {
            console.warn('[CJT]', error);
            button.style.backgroundColor = '#ff00ff';
            setTimeout(() => (button.style.backgroundColor = '#fff'), 1000);
          });
      };

      return button;
    };

    const container = document.createElement('div');
    container.id = toolbarId;
    container.style.position = 'fixed';
    container.style.top = '15px';
    container.style.left = '50%';
    container.style.transform = 'translateX(-50%)';
    container.style.zIndex = 9999;
    container.style.display = 'flex';
    container.style.gap = '13px';
    container.style.padding = '0 24px';
    container.style.backgroundColor = '#fff';
    container.style.border = '1px solid #000';
    container.style.borderRadius = '5px';

    container.appendChild(createButton('KEY', 'key-btn', issueKey));
    container.appendChild(createButton('KEY+TITLE', 'key-title-btn', keyTitle));
    container.appendChild(createButton('TITLE', 'title-btn', title));
    container.appendChild(createButton('CONTENTS', 'contents-btn', contents));
    container.appendChild(createButton('URL', 'url-btn', url));
    document.body.appendChild(container);
  };

  await run();

  const observer = new MutationObserver(async () => {
    if (currentPath !== location.pathname) {
      currentPath = location.pathname;
      document.getElementById(toolbarId)?.remove();
      run();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
