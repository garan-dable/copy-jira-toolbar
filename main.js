(function () {
  let currentPath = location.pathname;
  const TOOLBAR_ID = 'copy-jira-toolbar';
  const TEXT_COLOR = 'var(--ds-text)';
  const BACKGROUND_COLOR = 'var(--ds-surface)';
  const TITLE_SELECTOR =
    '[data-testid="issue.views.issue-base.foundation.summary.heading"]';
  const CONTENTS_SELECTOR =
    '[data-testid="issue.views.field.rich-text.description"]';
  const STORAGE_KEY = 'CJT_btns';
  let visibleButtons = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
    'key-btn',
    'title-btn',
    'url-btn',
    'key-title-btn',
    'key-title-link-btn',
  ];
  let openSettings = null;
  let settingsClickListener = null;

  const getIssueKey = () => {
    const match = currentPath.match(/\/browse\/([A-Z]+-\d+)/);
    return match?.[1];
  };

  const getTitle = () => {
    const titleEl = document.querySelector(TITLE_SELECTOR);
    return titleEl?.innerText?.trim() ?? '';
  };

  const getUrl = () => {
    return location.href.split('?')[0];
  };

  const run = async () => {
    if (!getUrl().includes('atlassian.net/browse/')) return;
    if (!getIssueKey()) return;
    if (document.getElementById(TOOLBAR_ID)) return;

    const resetButton = (button) => {
      button.style.color = TEXT_COLOR;
      button.style.backgroundColor = 'transparent';
    };

    const highlightButton = (button, color) => {
      button.style.color = '#000';
      button.style.backgroundColor = color;
    };

    const toolbarStyle = {
      position: 'fixed',
      top: '53px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '0 15px',
      height: '25px',
      backgroundColor: BACKGROUND_COLOR,
      border: `1px solid ${TEXT_COLOR}`,
      borderRadius: '5px',
      whiteSpace: 'nowrap',
      overflowX: 'hidden',
      textOverflow: 'clip',
    };

    const copyButtonStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 8px',
      height: '100%',
      lineHeight: '25px',
      fontSize: '11px',
      fontWeight: 'bold',
      verticalAlign: 'middle',
      border: 'none',
      cursor: 'pointer',
      outline: 'none',
    };

    const settingsButtonStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: '5px',
      padding: '0 5px',
      fontSize: '12px',
      fontWeight: 'bold',
      cursor: 'pointer',
    };

    const settingsPopupStyle = {
      position: 'fixed',
      top: '87px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      padding: '7px',
      paddingRight: '0',
      gap: '5px',
      backgroundColor: BACKGROUND_COLOR,
      border: `1px solid ${TEXT_COLOR}`,
      borderRadius: '5px',
      whiteSpace: 'nowrap',
      overflowX: 'hidden',
      textOverflow: 'clip',
    };

    const settingsRowStyle = {
      display: 'flex',
      alignItems: 'center',
      height: '25px',
      gap: '2px',
    };

    const toggleStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '5px',
      cursor: 'pointer',
    };

    const toggleCircleStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1px',
      width: '8px',
      height: '8px',
      border: `1px solid ${TEXT_COLOR}`,
      borderRadius: '50%',
    };

    const toggleLightStyle = {
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      position: 'relative',
    };

    const toggleReflectStyle = {
      position: 'absolute',
      top: '1px',
      right: '1px',
      width: '3px',
      height: '3px',
      borderRadius: '50%',
    };

    const createCopyButton = ({ name, id, getValue }) => {
      const button = document.createElement('button');
      button.id = id;
      button.innerText = name;
      Object.assign(button.style, copyButtonStyle);
      resetButton(button);

      button.addEventListener('mouseover', () => {
        button.style.fontStyle = 'italic';
        button.style.textDecoration = 'underline';
        highlightButton(button, '#00ffff');
      });
      button.addEventListener('mouseout', () => {
        button.style.fontStyle = 'normal';
        button.style.textDecoration = 'none';
        resetButton(button);
      });

      button.onclick = (e) => {
        e.stopPropagation();
        const value = getValue();
        onClickCopyButton(button, value);
      };

      return button;
    };

    const onClickCopyButton = (button, value) => {
      navigator.clipboard
        .writeText(value)
        .then(() => {
          if (!value) throw new Error('Missing value');
          highlightButton(button, '#ffff00');
          setTimeout(() => resetButton(button), 200);
          console.log('[CJT🍀]', value);
          if (openSettings) closeSettingsPopup();
        })
        .catch((error) => {
          highlightButton(button, '#ff00ff');
          setTimeout(() => resetButton(button), 200);
          console.warn('[CJT🍀]', error);
        });
    };

    const createSettingsButton = () => {
      const settings = document.createElement('div');
      settings.id = 'settings-btn';
      settings.innerText = '···';
      Object.assign(settings.style, settingsButtonStyle);
      settings.onclick = () => onClickSettingsButton();
      return settings;
    };

    const onClickSettingsButton = () => {
      if (openSettings) {
        closeSettingsPopup();
        return;
      }
      const popup = createSettingsPopup();
      if (settingsClickListener) {
        document.removeEventListener('click', settingsClickListener);
      }
      settingsClickListener = (e) => {
        const clickOutside =
          !popup.contains(e.target) &&
          !document.getElementById('settings-btn').contains(e.target);
        if (clickOutside) closeSettingsPopup();
      };
      document.addEventListener('click', settingsClickListener);
      document.body.appendChild(popup);
      openSettings = popup;
    };

    const createSettingsPopup = () => {
      const popup = document.createElement('div');
      popup.id = 'settings-popup';
      Object.assign(popup.style, settingsPopupStyle);
      buttons.forEach((props) => {
        const row = createSettingsRow(props);
        popup.appendChild(row);
      });
      return popup;
    };

    const createSettingsRow = (props) => {
      const row = document.createElement('div');
      row.id = `row-${props.id}`;
      Object.assign(row.style, settingsRowStyle);
      const button = createCopyButton(props);
      button.style.justifyContent = 'flex-start';
      button.style.width = '100%';
      button.style.padding = '0 9px 0 5px';
      row.appendChild(createToggle(props.id));
      row.appendChild(button);
      return row;
    };

    const createToggle = (buttonId) => {
      const toggle = document.createElement('div');
      toggle.id = `toggle-${buttonId}`;
      Object.assign(toggle.style, toggleStyle);
      const circle = createToggleCircle();
      const light = createToggleLight();
      const reflect = createToggleReflect();
      const updateToggleState = () => {
        const isVisible = visibleButtons.includes(buttonId);
        light.style.backgroundColor = isVisible ? 'lime' : 'green';
        reflect.style.backgroundColor = isVisible ? '#fff' : '#FFFFFF50';
      };
      updateToggleState();
      light.appendChild(reflect);
      circle.appendChild(light);
      toggle.appendChild(circle);
      toggle.onclick = () => {
        onClickToggle(buttonId);
        updateToggleState();
      };
      return toggle;
    };

    const createToggleCircle = () => {
      const circle = document.createElement('div');
      Object.assign(circle.style, toggleCircleStyle);
      return circle;
    };

    const createToggleLight = () => {
      const light = document.createElement('div');
      Object.assign(light.style, toggleLightStyle);
      return light;
    };

    const createToggleReflect = () => {
      const reflect = document.createElement('div');
      Object.assign(reflect.style, toggleReflectStyle);
      return reflect;
    };

    const onClickToggle = (buttonId) => {
      const isVisible = visibleButtons.includes(buttonId);
      if (isVisible) {
        visibleButtons = visibleButtons.filter((id) => id !== buttonId);
      } else {
        visibleButtons.push(buttonId);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleButtons));
      const buttonEl = document.getElementById(buttonId);
      if (!buttonEl) return;
      buttonEl.style.display = !isVisible ? 'block' : 'none';
    };

    const closeSettingsPopup = () => {
      if (openSettings) {
        openSettings.remove();
        openSettings = null;
      }
      if (settingsClickListener) {
        document.removeEventListener('click', settingsClickListener);
        settingsClickListener = null;
      }
    };

    const container = document.createElement('div');
    container.id = TOOLBAR_ID;
    Object.assign(container.style, toolbarStyle);

    const buttons = [
      { name: 'KEY', id: 'key-btn', getValue: getIssueKey },
      { name: 'TITLE', id: 'title-btn', getValue: getTitle },
      { name: '🔗', id: 'url-btn', getValue: getUrl },
      {
        name: '[K] TITLE',
        id: 'key-title-btn',
        getValue: () => `[${getIssueKey()}] ${getTitle()}`,
      },
      {
        name: '[K] TITLE(#)',
        id: 'key-title-link-btn',
        getValue: () => `[${getIssueKey()}] ${getTitle()}([#](${getUrl()}))`,
      },
      {
        name: '[K] TITLE(#)-🔗',
        id: 'key-title-link-ex-btn',
        getValue: () => {
          const url = getUrl();
          return `*   [${getIssueKey()}] ${getTitle()}([#](${url}))\n    *   ${url}`;
        },
      },
      {
        name: 'CONTENTS',
        id: 'contents-btn',
        getValue: () => {
          const contentsEl = document.querySelector(CONTENTS_SELECTOR);
          const contentsHtml = contentsEl?.innerHTML ?? '';
          const turndownService = new TurndownService();
          const contents = turndownService.turndown(contentsHtml);
          return contents;
        },
      },
    ];

    buttons.forEach((props) => {
      const button = createCopyButton(props);
      const isVisible = visibleButtons.includes(props.id);
      button.style.display = isVisible ? 'block' : 'none';
      container.appendChild(button);
    });

    container.appendChild(createSettingsButton());
    document.body.appendChild(container);
  };

  run();

  const observer = new MutationObserver(async () => {
    if (currentPath !== location.pathname) {
      currentPath = location.pathname;
      document.getElementById(TOOLBAR_ID)?.remove();
      run();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
