(async function () {
  const toolbarId = 'copy-jira-toolbar';
  let currentPath = location.pathname;

  const run = async () => {
    if (!location.href.includes('atlassian.net/browse/')) return;
    const match = currentPath.match(/\/browse\/([A-Z]+-\d+)/);
    const issueKey = match?.[1];
    if (!issueKey) return;
    if (document.getElementById(toolbarId)) return;

    const createButton = (text, id, getValue) => {
      const button = document.createElement('button');
      button.id = id;
      button.innerText = text;
      button.style.padding = '4px 8px';
      button.style.fontSize = '11px';
      button.style.fontWeight = 'bold';
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
        const value = getValue();
        navigator.clipboard
          .writeText(value)
          .then(() => {
            if (!value) throw new Error('Missing value');
            button.style.backgroundColor = '#ffff00';
            setTimeout(() => (button.style.backgroundColor = '#fff'), 500);
            console.log('[CJT🍀]', value);
          })
          .catch((error) => {
            button.style.backgroundColor = '#ff00ff';
            setTimeout(() => (button.style.backgroundColor = '#fff'), 500);
            console.warn('[CJT🍀]', error);
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
    container.style.padding = '0 15px';
    container.style.backgroundColor = '#fff';
    container.style.border = '1px solid #000';
    container.style.borderRadius = '5px';

    const titleSel =
      '[data-testid="issue.views.issue-base.foundation.summary.heading"]';
    const contentsSel =
      '[data-testid="issue.views.field.rich-text.description"]';

    container.appendChild(
      createButton('KEY', 'key-btn', () => {
        const match = currentPath.match(/\/browse\/([A-Z]+-\d+)/);
        const issueKey = match?.[1] ?? '';
        return issueKey;
      })
    );
    container.appendChild(
      createButton('TITLE', 'title-btn', () => {
        const titleEl = document.querySelector(titleSel);
        const title = titleEl?.innerText?.trim() ?? '';
        return title;
      })
    );
    container.appendChild(
      createButton('🔗', 'url-btn', () => {
        return location.href;
      })
    );
    container.appendChild(
      createButton('FULL', 'full-btn', () => {
        const match = currentPath.match(/\/browse\/([A-Z]+-\d+)/);
        const issueKey = match?.[1];
        const titleEl = document.querySelector(titleSel);
        const title = titleEl?.innerText?.trim();
        if (!issueKey || !title) return '';
        return `[${issueKey}] ${title}`;
      })
    );
    container.appendChild(
      createButton('FULL(#)', 'full-link-btn', () => {
        const match = currentPath.match(/\/browse\/([A-Z]+-\d+)/);
        const issueKey = match?.[1];
        const titleEl = document.querySelector(titleSel);
        const title = titleEl?.innerText?.trim();
        if (!issueKey || !title) return '';
        return `[${issueKey}] ${title}([#](${location.href}))`;
      })
    );
    container.appendChild(
      createButton('CONTENTS', 'contents-btn', () => {
        const contentsEl = document.querySelector(contentsSel);
        const contentsHtml = contentsEl?.innerHTML ?? '';
        const turndownService = new TurndownService();
        const contents = turndownService.turndown(contentsHtml);
        return contents;
      })
    );

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
