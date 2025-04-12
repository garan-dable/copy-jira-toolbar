chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!tab.url) return;

  const isJiraIssuePage = tab.url.includes('atlassian.net/browse/');
  chrome.action.setIcon({
    tabId,
    path: isJiraIssuePage
      ? {
          16: 'icons/icon16.png',
          48: 'icons/icon48.png',
          128: 'icons/icon128.png',
        }
      : {
          16: 'icons/icon16_gray.png',
          48: 'icons/icon48_gray.png',
          128: 'icons/icon128_gray.png',
        },
  });
});
